from django.contrib import admin
from .models import AnalyticsSnapshot

@admin.register(AnalyticsSnapshot)
class AnalyticsSnapshotAdmin(admin.ModelAdmin):
    list_display = ('manufacturer', 'snapshot_date', 'total_orders', 'fulfillment_rate', 'avg_delay_saved_mins', 'avg_agent_response_time_s')
    list_filter = ('snapshot_date',)
