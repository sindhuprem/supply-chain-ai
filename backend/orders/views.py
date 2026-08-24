from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from datetime import timedelta
from .models import WarehouseLocation, Transporter, Order
from .serializers import WarehouseLocationSerializer, TransporterSerializer, OrderSerializer

class OrderListView(APIView):
    def get(self, request):
        orders = Order.objects.all()
        if not orders.exists():
            self.seed_initial_data()
            orders = Order.objects.all()
        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data)

    def seed_initial_data(self):
        # 1. Seed Locations
        loc_mumbai = WarehouseLocation.objects.create(name="Mumbai Port Logistics Center", city="Mumbai", latitude=19.0760, longitude=72.8777)
        loc_pune = WarehouseLocation.objects.create(name="Pune Industrial Hub", city="Pune", latitude=18.5204, longitude=73.8567)
        loc_blr = WarehouseLocation.objects.create(name="Bengaluru Tech Park Distribution", city="Bengaluru", latitude=12.9716, longitude=77.5946)
        loc_hyd = WarehouseLocation.objects.create(name="Hyderabad Gateway Depot", city="Hyderabad", latitude=17.3850, longitude=78.4867)

        # 2. Seed Transporters
        t1 = Transporter.objects.create(name="Apex Transports", fleet_size=25, reliability_score=0.95, vehicle_type="10-Ton Refrigerated Container")
        t2 = Transporter.objects.create(name="SwiftRail & Road Freight", fleet_size=18, reliability_score=0.88, vehicle_type="Multi-Axle Heavy Hauler")
        t3 = Transporter.objects.create(name="Vanguard Logistics", fleet_size=12, reliability_score=0.94, vehicle_type="Medium Duty Express Freight")

        now = timezone.now()
        # 3. Seed Orders
        Order.objects.create(
            order_number="ORD-2026-8801",
            item_description="Precision Automotive Microcontrollers (12 Tons)",
            quantity_tons=12.0,
            origin=loc_mumbai,
            destination=loc_blr,
            transporter=t1,
            status="IN_TRANSIT",
            original_eta=now + timedelta(hours=14),
            current_eta=now + timedelta(hours=14)
        )
        Order.objects.create(
            order_number="ORD-2026-8802",
            item_description="Cold-Chain Pharmaceutical Vaccines (4 Tons)",
            quantity_tons=4.0,
            origin=loc_pune,
            destination=loc_hyd,
            transporter=t2,
            status="IN_TRANSIT",
            original_eta=now + timedelta(hours=10),
            current_eta=now + timedelta(hours=10)
        )

class TransporterListView(APIView):
    def get(self, request):
        transporters = Transporter.objects.all()
        if not transporters.exists():
            OrderListView().seed_initial_data()
            transporters = Transporter.objects.all()
        serializer = TransporterSerializer(transporters, many=True)
        return Response(serializer.data)
