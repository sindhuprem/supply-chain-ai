import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from users.models import TransporterProfile

User = get_user_model()

def seed_users():
    users_data = [
        {
            "username": "manufacturer",
            "email": "manufacturer@supplychain.ai",
            "password": "password123",
            "role": User.ROLE_MANUFACTURER,
            "company_name": "Apex Manufacturing Ltd",
            "city": "Mumbai",
            "state": "Maharashtra",
            "base_latitude": 19.0760,
            "base_longitude": 72.8777
        },
        {
            "username": "distributor",
            "email": "distributor@supplychain.ai",
            "password": "password123",
            "role": User.ROLE_DISTRIBUTOR,
            "company_name": "LogiDirect Logistics",
            "city": "Pune",
            "state": "Maharashtra",
            "base_latitude": 18.5204,
            "base_longitude": 73.8567
        },
        {
            "username": "transporter",
            "email": "transporter@supplychain.ai",
            "password": "password123",
            "role": User.ROLE_TRANSPORTER,
            "company_name": "Swift Fleet Carriers",
            "city": "Navi Mumbai",
            "state": "Maharashtra",
            "base_latitude": 19.0330,
            "base_longitude": 73.0297
        },
        {
            "username": "retailer",
            "email": "retailer@supplychain.ai",
            "password": "password123",
            "role": User.ROLE_RETAILER,
            "company_name": "Metro Retail Market",
            "city": "Nashik",
            "state": "Maharashtra",
            "base_latitude": 19.9975,
            "base_longitude": 73.7898
        }
    ]

    for data in users_data:
        username = data.pop('username')
        password = data.pop('password')
        user, created = User.objects.get_or_create(username=username, defaults=data)
        if created:
            user.set_password(password)
            user.save()
            print(f"Created user: {username} ({user.role})")
            if user.role == User.ROLE_TRANSPORTER:
                TransporterProfile.objects.get_or_create(
                    user=user,
                    defaults={
                        "vehicle_type": "10-Ton Refrigerated Truck",
                        "vehicle_number": "MH-12-AB-1234",
                        "capacity_kg": 10000.0,
                        "performance_score": 9.5,
                        "is_available": True,
                        "current_latitude": 18.5204,
                        "current_longitude": 73.8567
                    }
                )
        else:
            print(f"User {username} already exists.")

if __name__ == "__main__":
    seed_users()
