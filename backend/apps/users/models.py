import uuid
from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    ROLE_MANUFACTURER = 'manufacturer'
    ROLE_DISTRIBUTOR = 'distributor'
    ROLE_TRANSPORTER = 'transporter'
    ROLE_RETAILER = 'retailer'

    ROLES = [
        (ROLE_MANUFACTURER, 'Manufacturer'),
        (ROLE_DISTRIBUTOR, 'Distributor'),
        (ROLE_TRANSPORTER, 'Transporter'),
        (ROLE_RETAILER, 'Retailer'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    role = models.CharField(max_length=20, choices=ROLES, default=ROLE_MANUFACTURER)
    phone = models.CharField(max_length=20, blank=True, null=True)
    company_name = models.CharField(max_length=255, blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)
    state = models.CharField(max_length=100, blank=True, null=True)
    base_latitude = models.FloatField(default=0.0)
    base_longitude = models.FloatField(default=0.0)
    fcm_token = models.CharField(max_length=550, blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"


class TransporterProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='transporter_profile')
    vehicle_type = models.CharField(max_length=100, default='Heavy Truck')
    vehicle_number = models.CharField(max_length=50, blank=True, null=True)
    capacity_kg = models.FloatField(default=10000.0)
    total_deliveries = models.IntegerField(default=0)
    on_time_deliveries = models.IntegerField(default=0)
    total_disruptions = models.IntegerField(default=0)
    performance_score = models.FloatField(default=10.0)  # float 0-10
    is_available = models.BooleanField(default=True)
    current_latitude = models.FloatField(default=0.0)
    current_longitude = models.FloatField(default=0.0)
    last_location_update = models.DateTimeField(auto_now=True)

    def update_performance_score(self):
        """
        Formula: score = (on_time_rate * 8) - (disruption_rate * 3) + 2, clamped 0-10
        """
        if self.total_deliveries > 0:
            on_time_rate = self.on_time_deliveries / self.total_deliveries
            disruption_rate = self.total_disruptions / self.total_deliveries
            raw_score = (on_time_rate * 8.0) - (disruption_rate * 3.0) + 2.0
            self.performance_score = max(0.0, min(10.0, round(raw_score, 2)))
        else:
            self.performance_score = 10.0
        self.save(update_fields=['performance_score'])
        return self.performance_score

    def __str__(self):
        return f"Transporter Profile: {self.user.username} (Score: {self.performance_score})"
