from django.contrib import admin
from .models import DisruptionEvent, AgentDecisionLog, AuditTrail

@admin.register(DisruptionEvent)
class DisruptionEventAdmin(admin.ModelAdmin):
    list_display = ('id', 'order', 'disruption_type', 'severity', 'resolution_status', 'agent_response_time_s', 'reported_at')
    list_filter = ('disruption_type', 'severity', 'resolution_status')

@admin.register(AgentDecisionLog)
class AgentDecisionLogAdmin(admin.ModelAdmin):
    list_display = ('disruption', 'agent_type', 'action_type', 'revision_round', 'processing_time_ms', 'timestamp')
    list_filter = ('agent_type', 'action_type', 'revision_round')

@admin.register(AuditTrail)
class AuditTrailAdmin(admin.ModelAdmin):
    list_display = ('order', 'event_type', 'triggered_by', 'triggered_by_agent', 'previous_status', 'new_status', 'timestamp')
    list_filter = ('event_type', 'timestamp')
    readonly_fields = ('id', 'order', 'event_type', 'triggered_by', 'triggered_by_agent', 'previous_status', 'new_status', 'details', 'timestamp')
