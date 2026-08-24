import logging
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

from orders.models import Order, Transporter
from .models import DisruptionSignal
from .serializers import DisruptionSignalSerializer
from agents.graph import execute_disruption_pipeline
from agents.memory import memory_store

logger = logging.getLogger(__name__)

class TriggerDisruptionView(APIView):
    def post(self, request):
        order_id = request.data.get("order_id")
        disruption_type = request.data.get("disruption_type", "ROAD_BLOCKADE")
        description = request.data.get("description", "Landslide closure reported near NH-44 Pune Expressway")
        lat = float(request.data.get("latitude", 18.5204))
        lng = float(request.data.get("longitude", 73.8567))

        order = Order.objects.filter(id=order_id).first() if order_id else Order.objects.first()
        if not order:
            return Response({"error": "No valid order found to attach disruption"}, status=status.HTTP_400_BAD_REQUEST)

        # 1. Create initial Disruption Signal model record
        disruption_signal = DisruptionSignal.objects.create(
            order=order,
            disruption_type=disruption_type,
            description=description,
            latitude=lat,
            longitude=lng,
            status="PROCESSING"
        )

        # 2. Prepare initial state for LangGraph Multi-Agent Engine
        initial_state = {
            "disruption_id": str(disruption_signal.id),
            "order_id": order.order_number,
            "disruption_type": disruption_type,
            "description": description,
            "location_coords": [lat, lng],
            "severity": "HIGH",
            "past_precedents": [],
            "subtasks": [],
            "route_proposal": None,
            "resource_proposal": None,
            "critic_validation": None,
            "revision_count": 0,
            "is_approved": False,
            "execution_logs": [],
            "final_response": None
        }

        # 3. Run Multi-Agent Execution Pipeline (Planner -> Route/Resource Executors -> Critic)
        final_state = execute_disruption_pipeline(initial_state)

        # 4. Update Disruption Signal & Order with validated outputs
        res_prop = final_state.get("resource_proposal") or {}
        route_prop = final_state.get("route_proposal") or {}

        transporter_name = res_prop.get("transporter_name")
        if transporter_name:
            t_obj = Transporter.objects.filter(name__icontains=transporter_name.split()[0]).first()
            if t_obj:
                disruption_signal.assigned_transporter = t_obj
                order.transporter = t_obj

        disruption_signal.detour_km = route_prop.get("detour_distance_km", 16.4)
        disruption_signal.delay_minutes = route_prop.get("additional_time_minutes", 22)
        disruption_signal.status = "RESOLVED"
        disruption_signal.response_payload = final_state.get("final_response", {})
        disruption_signal.save()

        order.status = "REROUTED"
        order.save()

        # 5. Broadcast validated update across WebSockets to all connected dashboards
        channel_layer = get_channel_layer()
        if channel_layer:
            async_to_sync(channel_layer.group_send)(
                "disruptions_broadcast",
                {
                    "type": "disruption_event",
                    "payload": final_state.get("final_response", {})
                }
            )

        serializer = DisruptionSignalSerializer(disruption_signal)
        return Response({
            "message": "Disruption processed and validated by Multi-Agent Engine.",
            "disruption": serializer.data,
            "pipeline_summary": final_state.get("final_response", {})
        }, status=status.HTTP_201_CREATED)

class DisruptionListView(APIView):
    def get(self, request):
        disruptions = DisruptionSignal.objects.all().order_by("-created_at")
        serializer = DisruptionSignalSerializer(disruptions, many=True)
        return Response(serializer.data)

class CognitiveMemoryView(APIView):
    def get(self, request):
        query = request.query_params.get("query", "roadblock vehicle breakdown")
        precedents = memory_store.query_similar_precedents(query_text=query, top_k=5)
        return Response({"query": query, "precedents": precedents})
