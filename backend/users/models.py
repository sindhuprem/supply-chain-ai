from django.db import models
from django.contrib.auth.models import AbstractUser

class UserRole(models.TextChoices):
    MANUFACTURER = "MANUFACTURER", "Manufacturer"
    DISTRIBUTOR = "DISTRIBUTOR", "Distributor"
    TRANSPORTER = "TRANSPORTER", "Transporter"
    RETAILER = "RETAILER", "Retailer"

class UserProfile(models.Model):
    username = models.CharField(max_length=150, unique=True)
    role = models.CharField(max_length=20, choices=UserRole.choices, default=UserRole.MANUFACTURER)
    organization_name = models.CharField(max_length=255, default="SupplyChain Corp")
    email = models.EmailField(default="user@supplychain.ai")
    phone = models.CharField(max_length=20, default="+91 9876543210")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.username} ({self.role})"
