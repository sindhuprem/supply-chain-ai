import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from orders.models import Order
from disruptions.models import DisruptionEvent
from memory.chroma_client import write_disruption_to_memory

User = get_user_model()

def seed_memories():
    order = Order.objects.first()
    if not order:
        print("No order found. Seed demo orders first.")
        return

    transporter = User.objects.filter(role=User.ROLE_TRANSPORTER).first()

    memories_data = [
        {
            "disruption_type": "road_block",
            "severity": "high",
            "location_name": "NH-44 Pune Expressway Junction",
            "description": "Highway blockade due to heavy landslide at mile marker 42.",
            "outcome": {
                "resolution_approach": "Rerouted via Bypass 4B (Talegaon Expressway detour)",
                "result": "success",
                "delay_mins": 22.0,
                "agent_confidence": 0.94,
                "transporter_score": 9.5
            }
        },
        {
            "disruption_type": "vehicle_breakdown",
            "severity": "medium",
            "location_name": "Mumbai Port Outbound Expressway",
            "description": "Refrigerated compressor failure on Reefer Truck #RF-104.",
            "outcome": {
                "resolution_approach": "Dispatched emergency Mobile Fleet Technician #MF-08",
                "result": "success",
                "delay_mins": 18.5,
                "agent_confidence": 0.91,
                "transporter_score": 9.2
            }
        },
        {
            "disruption_type": "weather",
            "severity": "high",
            "location_name": "Western Ghats Mountain Pass",
            "description": "Dense fog and flash flooding causing speed restriction to 20 km/h.",
            "outcome": {
                "resolution_approach": "Adjusted velocity window & notified retailer buffer",
                "result": "delayed",
                "delay_mins": 34.0,
                "agent_confidence": 0.88,
                "transporter_score": 8.9
            }
        }
    ]

    for item in memories_data:
        disruption = DisruptionEvent.objects.create(
            order=order,
            transporter=transporter,
            disruption_type=item["disruption_type"],
            severity=item["severity"],
            description=item["description"],
            location_name=item["location_name"],
            resolution_status=DisruptionEvent.RESOLUTION_RESOLVED
        )
        mem_id = write_disruption_to_memory(disruption, item["outcome"])
        print(f"Seeded memory {mem_id} for {item['disruption_type']}")

if __name__ == "__main__":
    seed_memories()
