from django.contrib import admin
from .models import Order, Route, Waypoint

class WaypointInline(admin.TabularInline):
    model = Waypoint
    extra = 0

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('order_number', 'product_name', 'manufacturer', 'distributor', 'transporter', 'retailer', 'status', 'priority', 'created_at')
    list_filter = ('status', 'priority', 'created_at')
    search_fields = ('order_number', 'product_name')

@admin.register(Route)
class RouteAdmin(admin.ModelAdmin):
    list_display = ('id', 'order', 'route_type', 'is_active', 'total_distance_km', 'estimated_duration_mins')
    list_filter = ('route_type', 'is_active')
    inlines = [WaypointInline]

@admin.register(Waypoint)
class WaypointAdmin(admin.ModelAdmin):
    list_display = ('route', 'sequence_number', 'location_name', 'status', 'latitude', 'longitude')
    list_filter = ('status',)
