from rest_framework import serializers
from .models import DisruptionSignal
from orders.serializers import OrderSerializer, TransporterSerializer

class DisruptionSignalSerializer(serializers.ModelSerializer):
    order_detail = OrderSerializer(source="order", read_only=True)
    assigned_transporter_detail = TransporterSerializer(source="assigned_transporter", read_only=True)

    class Meta:
        model = DisruptionSignal
        fields = "__all__"
