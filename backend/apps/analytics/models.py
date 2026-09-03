import uuid
from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class AnalyticsSnapshot(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    manufacturer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='analytics_snapshots')
    snapshot_date = models.DateField()

    total_orders = models.IntegerField(default=0)
    completed_orders = models.IntegerField(default=0)
    cancelled_orders = models.IntegerField(default=0)
    disputed_orders = models.IntegerField(default=0)
    fulfillment_rate = models.FloatField(default=0.0)

    avg_delay_mins = models.FloatField(default=0.0)
    on_time_deliveries = models.IntegerField(default=0)
    delayed_deliveries = models.IntegerField(default=0)

    total_disruptions = models.IntegerField(default=0)
    agent_resolved_disruptions = models.IntegerField(default=0)
    human_escalated_disruptions = models.IntegerField(default=0)

    avg_agent_response_time_s = models.FloatField(default=0.0)
    avg_delay_saved_mins = models.FloatField(default=0.0)
    distributor_scores_json = models.JSONField(default=dict, blank=True)

    memory_queries_total = models.IntegerField(default=0)
    memory_hit_rate = models.FloatField(default=0.0)
    memory_improvement_rate = models.FloatField(default=0.0)

    computed_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['manufacturer', 'snapshot_date']
        ordering = ['-snapshot_date']

    def __str__(self):
        return f"AnalyticsSnapshot for {self.manufacturer.username} on {self.snapshot_date}"
