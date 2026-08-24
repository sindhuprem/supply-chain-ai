from rest_framework import serializers
from .models import WarehouseLocation, Transporter, Order

class WarehouseLocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = WarehouseLocation
        fields = "__all__"

class TransporterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transporter
        fields = "__all__"

class OrderSerializer(serializers.ModelSerializer):
    origin_detail = WarehouseLocationSerializer(source="origin", read_only=True)
    destination_detail = WarehouseLocationSerializer(source="destination", read_only=True)
    transporter_detail = TransporterSerializer(source="transporter", read_only=True)

    class Meta:
        model = Order
        fields = "__all__"
