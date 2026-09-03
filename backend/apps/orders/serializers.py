from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Order, Route, Waypoint
from disruptions.models import AuditTrail, AgentDecisionLog, DisruptionEvent

User = get_user_model()

class UserSimpleSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role', 'company_name', 'city', 'state']

class WaypointSerializer(serializers.ModelSerializer):
    class Meta:
        model = Waypoint
        fields = [
            'id', 'sequence_number', 'location_name', 'latitude', 'longitude',
            'address', 'status', 'distance_from_prev_km', 'duration_from_prev_mins',
            'estimated_arrival', 'actual_arrival'
        ]

class RouteSerializer(serializers.ModelSerializer):
    waypoints = WaypointSerializer(many=True, read_only=True)

    class Meta:
        model = Route
        fields = [
            'id', 'route_type', 'is_active', 'total_distance_km',
            'estimated_duration_mins', 'actual_duration_mins',
            'delay_vs_original_mins', 'agent_reasoning', 'created_at', 'waypoints'
        ]

class OrderCreateSerializer(serializers.ModelSerializer):
    retailer_id = serializers.UUIDField(required=False, write_only=True)

    class Meta:
        model = Order
        fields = ['product_name', 'quantity', 'quantity_unit', 'weight_kg', 'priority', 'delivery_notes', 'retailer_id']

    def create(self, validated_data):
        retailer_id = validated_data.pop('retailer_id', None)
        request = self.context.get('request')
        manufacturer = request.user if request and request.user.is_authenticated else None
        
        # Default distributor / retailer if not explicitly passed
        retailer = None
        if retailer_id:
            retailer = User.objects.filter(id=retailer_id, role=User.ROLE_RETAILER).first()
        if not retailer:
            retailer = User.objects.filter(role=User.ROLE_RETAILER).first()

        distributor = User.objects.filter(role=User.ROLE_DISTRIBUTOR).first()

        import random, string
        order_number = f"ORD-2026-{''.join(random.choices(string.digits, k=4))}"

        order = Order.objects.create(
            order_number=order_number,
            manufacturer=manufacturer,
            distributor=distributor,
            retailer=retailer,
            **validated_data
        )
        return order

class OrderListSerializer(serializers.ModelSerializer):
    manufacturer_name = serializers.CharField(source='manufacturer.company_name', read_only=True)
    distributor_name = serializers.CharField(source='distributor.company_name', read_only=True)
    transporter_name = serializers.CharField(source='transporter.company_name', read_only=True)
    retailer_name = serializers.CharField(source='retailer.company_name', read_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 'order_number', 'product_name', 'quantity', 'quantity_unit',
            'status', 'priority', 'created_at', 'estimated_delivery_at', 'revised_delivery_at',
            'agent_handled', 'disruption_count', 'proof_of_delivery_url',
            'manufacturer_name', 'distributor_name', 'transporter_name', 'retailer_name'
        ]

class AuditTrailSerializer(serializers.ModelSerializer):
    triggered_by_username = serializers.CharField(source='triggered_by.username', read_only=True)

    class Meta:
        model = AuditTrail
        fields = [
            'id', 'event_type', 'triggered_by_username', 'triggered_by_agent',
            'previous_status', 'new_status', 'details', 'timestamp'
        ]

class AgentDecisionLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = AgentDecisionLog
        fields = [
            'id', 'agent_type', 'action_type', 'input_summary', 'reasoning',
            'output_summary', 'revision_round', 'critic_feedback', 'processing_time_ms', 'timestamp'
        ]

class OrderDetailSerializer(serializers.ModelSerializer):
    manufacturer = UserSimpleSerializer(read_only=True)
    distributor = UserSimpleSerializer(read_only=True)
    transporter = UserSimpleSerializer(read_only=True)
    retailer = UserSimpleSerializer(read_only=True)
    routes = RouteSerializer(many=True, read_only=True)
    audit_trails = AuditTrailSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 'order_number', 'product_name', 'quantity', 'quantity_unit', 'weight_kg',
            'status', 'priority', 'created_at', 'assigned_at', 'dispatched_at', 'picked_up_at',
            'estimated_delivery_at', 'revised_delivery_at', 'actual_delivered_at', 'confirmed_at',
            'proof_of_delivery_url', 'delivery_notes', 'dispute_reason', 'agent_handled',
            'disruption_count', 'manufacturer', 'distributor', 'transporter', 'retailer',
            'routes', 'audit_trails'
        ]
