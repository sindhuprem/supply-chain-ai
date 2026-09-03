import uuid
from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Order(models.Model):
    STATUS_CREATED = 'created'
    STATUS_ASSIGNED = 'assigned'
    STATUS_DISPATCHED = 'dispatched'
    STATUS_PICKED_UP = 'picked_up'
    STATUS_IN_TRANSIT = 'in_transit'
    STATUS_DISRUPTED = 'disrupted'
    STATUS_REROUTED = 'rerouted'
    STATUS_DELIVERED = 'delivered'
    STATUS_CONFIRMED = 'confirmed'
    STATUS_DISPUTED = 'disputed'
    STATUS_CANCELLED = 'cancelled'

    STATUS_CHOICES = [
        (STATUS_CREATED, 'Created'),
        (STATUS_ASSIGNED, 'Assigned'),
        (STATUS_DISPATCHED, 'Dispatched'),
        (STATUS_PICKED_UP, 'Picked Up'),
        (STATUS_IN_TRANSIT, 'In Transit'),
        (STATUS_DISRUPTED, 'Disrupted'),
        (STATUS_REROUTED, 'Rerouted'),
        (STATUS_DELIVERED, 'Delivered'),
        (STATUS_CONFIRMED, 'Confirmed'),
        (STATUS_DISPUTED, 'Disputed'),
        (STATUS_CANCELLED, 'Cancelled'),
    ]

    PRIORITY_LOW = 'low'
    PRIORITY_MEDIUM = 'medium'
    PRIORITY_HIGH = 'high'
    PRIORITY_CRITICAL = 'critical'

    PRIORITY_CHOICES = [
        (PRIORITY_LOW, 'Low'),
        (PRIORITY_MEDIUM, 'Medium'),
        (PRIORITY_HIGH, 'High'),
        (PRIORITY_CRITICAL, 'Critical'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order_number = models.CharField(max_length=100, unique=True)
    manufacturer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='manufactured_orders')
    distributor = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='distributed_orders')
    transporter = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='transported_orders')
    retailer = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='retailer_orders')
    
    product_name = models.CharField(max_length=255)
    quantity = models.FloatField(default=1.0)
    quantity_unit = models.CharField(max_length=50, default='tons')
    weight_kg = models.FloatField(default=1000.0)
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default=STATUS_CREATED)
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default=PRIORITY_MEDIUM)

    created_at = models.DateTimeField(auto_now_add=True)
    assigned_at = models.DateTimeField(null=True, blank=True)
    dispatched_at = models.DateTimeField(null=True, blank=True)
    picked_up_at = models.DateTimeField(null=True, blank=True)
    estimated_delivery_at = models.DateTimeField(null=True, blank=True)
    revised_delivery_at = models.DateTimeField(null=True, blank=True)
    actual_delivered_at = models.DateTimeField(null=True, blank=True)
    confirmed_at = models.DateTimeField(null=True, blank=True)

    proof_of_delivery_url = models.CharField(max_length=500, blank=True, null=True)
    delivery_notes = models.TextField(blank=True, null=True)
    dispute_reason = models.TextField(blank=True, null=True)

    agent_handled = models.BooleanField(default=False)
    disruption_count = models.IntegerField(default=0)

    @property
    def is_delayed(self):
        if self.actual_delivered_at and self.estimated_delivery_at:
            return self.actual_delivered_at > self.estimated_delivery_at
        if self.revised_delivery_at and self.estimated_delivery_at:
            return self.revised_delivery_at > self.estimated_delivery_at
        return False

    def __str__(self):
        return f"Order {self.order_number} [{self.get_status_display()}]"


class Route(models.Model):
    TYPE_ORIGINAL = 'original'
    TYPE_REROUTED = 'rerouted'
    TYPE_MANUAL = 'manual'

    ROUTE_TYPE_CHOICES = [
        (TYPE_ORIGINAL, 'Original'),
        (TYPE_REROUTED, 'Rerouted'),
        (TYPE_MANUAL, 'Manual'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='routes')
    route_type = models.CharField(max_length=20, choices=ROUTE_TYPE_CHOICES, default=TYPE_ORIGINAL)
    is_active = models.BooleanField(default=True)
    total_distance_km = models.FloatField(default=0.0)
    estimated_duration_mins = models.FloatField(default=0.0)
    actual_duration_mins = models.FloatField(default=0.0, null=True, blank=True)
    delay_vs_original_mins = models.FloatField(default=0.0)
    agent_reasoning = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Route {self.id} for Order {self.order.order_number} ({self.route_type})"


class Waypoint(models.Model):
    STATUS_PENDING = 'pending'
    STATUS_REACHED = 'reached'
    STATUS_SKIPPED = 'skipped'

    STATUS_CHOICES = [
        (STATUS_PENDING, 'Pending'),
        (STATUS_REACHED, 'Reached'),
        (STATUS_SKIPPED, 'Skipped'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    route = models.ForeignKey(Route, on_delete=models.CASCADE, related_name='waypoints')
    sequence_number = models.IntegerField(default=1)
    location_name = models.CharField(max_length=255)
    latitude = models.FloatField()
    longitude = models.FloatField()
    address = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_PENDING)
    distance_from_prev_km = models.FloatField(default=0.0)
    duration_from_prev_mins = models.FloatField(default=0.0)
    estimated_arrival = models.DateTimeField(null=True, blank=True)
    actual_arrival = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['sequence_number']

    def __str__(self):
        return f"Waypoint #{self.sequence_number}: {self.location_name} [{self.status}]"
