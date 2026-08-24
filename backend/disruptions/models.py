from django.db import models
from orders.models import Order, Transporter

class DisruptionSignal(models.Model):
    DISRUPTION_TYPES = [
        ("VEHICLE_BREAKDOWN", "Vehicle Breakdown"),
        ("ROAD_BLOCKADE", "Road Blockade"),
        ("ORDER_MODIFICATION", "Order Modification"),
    ]

    STATUS_CHOICES = [
        ("REPORTED", "Reported"),
        ("PROCESSING", "Processing (Multi-Agent Engine)"),
        ("RESOLVED", "Resolved & Validated"),
        ("REJECTED", "Rejected"),
    ]

    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="disruptions")
    disruption_type = models.CharField(max_length=50, choices=DISRUPTION_TYPES, default="ROAD_BLOCKADE")
    description = models.TextField()
    latitude = models.FloatField(default=18.5204)
    longitude = models.FloatField(default=73.8567)
    severity = models.CharField(max_length=20, default="HIGH")
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default="REPORTED")

    # Execution outputs
    assigned_transporter = models.ForeignKey(Transporter, on_delete=models.SET_NULL, null=True, blank=True)
    detour_km = models.FloatField(default=0.0)
    delay_minutes = models.IntegerField(default=0)
    response_payload = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.disruption_type} on Order {self.order.order_number} [{self.status}]"
