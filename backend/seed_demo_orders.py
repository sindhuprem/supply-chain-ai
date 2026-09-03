import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from orders.models import Order, Route, Waypoint

User = get_user_model()

def seed_orders():
    manufacturer = User.objects.filter(role=User.ROLE_MANUFACTURER).first()
    distributor = User.objects.filter(role=User.ROLE_DISTRIBUTOR).first()
    transporter = User.objects.filter(role=User.ROLE_TRANSPORTER).first()
    retailer = User.objects.filter(role=User.ROLE_RETAILER).first()

    if not manufacturer or not distributor:
        print("Run seed_demo_data.py first.")
        return

    orders_data = [
        {
            "order_number": "ORD-2026-9901",
            "product_name": "High-Precision Microcontrollers",
            "quantity": 12.0,
            "quantity_unit": "tons",
            "status": Order.STATUS_CREATED,
            "priority": Order.PRIORITY_CRITICAL,
            "manufacturer": manufacturer,
            "distributor": distributor,
            "retailer": retailer,
            "agent_handled": True
        },
        {
            "order_number": "ORD-2026-9902",
            "product_name": "Cold-Chain Biological Vaccines",
            "quantity": 4.0,
            "quantity_unit": "tons",
            "status": Order.STATUS_ASSIGNED,
            "priority": Order.PRIORITY_HIGH,
            "manufacturer": manufacturer,
            "distributor": distributor,
            "transporter": transporter,
            "retailer": retailer,
            "agent_handled": True
        }
    ]

    for data in orders_data:
        ord_obj, created = Order.objects.get_or_create(
            order_number=data["order_number"],
            defaults=data
        )
        if created:
            print(f"Created order: {ord_obj.order_number}")
            route = Route.objects.create(
                order=ord_obj,
                route_type=Route.TYPE_ORIGINAL,
                is_active=True,
                total_distance_km=180.5,
                estimated_duration_mins=160.0,
                agent_reasoning="Optimal baseline route calculated."
            )
            Waypoint.objects.create(route=route, sequence_number=1, location_name="Mumbai Plant Cleanroom", latitude=19.0760, longitude=72.8777, status="reached")
            Waypoint.objects.create(route=route, sequence_number=2, location_name="Pune Hub Cross-Dock", latitude=18.5204, longitude=73.8567, status="pending")
            Waypoint.objects.create(route=route, sequence_number=3, location_name="Nashik Retail Superstore", latitude=19.9975, longitude=73.7898, status="pending")
        else:
            print(f"Order {ord_obj.order_number} already exists.")

if __name__ == "__main__":
    seed_orders()
