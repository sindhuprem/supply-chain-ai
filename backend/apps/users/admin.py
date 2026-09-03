from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, TransporterProfile

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('username', 'email', 'role', 'company_name', 'city', 'is_active')
    list_filter = ('role', 'is_active', 'state')
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Supply Chain Info', {
            'fields': ('role', 'phone', 'company_name', 'city', 'state', 'base_latitude', 'base_longitude', 'fcm_token')
        }),
    )

@admin.register(TransporterProfile)
class TransporterProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'vehicle_type', 'vehicle_number', 'performance_score', 'is_available')
    list_filter = ('is_available', 'vehicle_type')
