from django.db import models

class WarehouseLocation(models.Model):
    name = models.CharField(max_length=255)
    city = models.CharField(max_length=100)
    latitude = models.FloatField()
    longitude = models.FloatField()

    def __str__(self):
        return f"{self.name} ({self.city})"

class Transporter(models.Model):
    name = models.CharField(max_length=255)
    fleet_size = models.IntegerField(default=10)
    reliability_score = models.FloatField(default=0.92) # 0.0 - 1.0 score based on historical performance
    status = models.CharField(max_length=50, default="AVAILABLE") # AVAILABLE, BUSY, IN_MAINTENANCE
    contact_phone = models.CharField(max_length=20, default="+91 9898989898")
    vehicle_type = models.CharField(max_length=100, default="Heavy-Duty Refrigerated Truck")

    def __str__(self):
        return f"{self.name} - Reliability: {int(self.reliability_score * 100)}%"

class Order(models.Model):
    STATUS_CHOICES = [
        ("PLANNED", "Planned"),
        ("IN_TRANSIT", "In Transit"),
        ("DISRUPTED", "Disrupted"),
        ("REROUTED", "Rerouted / Reassigned"),
        ("DELIVERED", "Delivered"),
    ]

    order_number = models.CharField(max_length=100, unique=True)
    item_description = models.CharField(max_length=255)
    quantity_tons = models.FloatField(default=5.0)
    origin = models.ForeignKey(WarehouseLocation, on_delete=models.CASCADE, related_name="origin_orders")
    destination = models.ForeignKey(WarehouseLocation, on_delete=models.CASCADE, related_name="destination_orders")
    transporter = models.ForeignKey(Transporter, on_delete=models.SET_NULL, null=True, blank=True)
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default="IN_TRANSIT")
    original_eta = models.DateTimeField()
    current_eta = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.order_number} - {self.item_description} [{self.status}]"
