import uuid
from django.db import models
from django.contrib.auth import get_user_model
from orders.models import Order

User = get_user_model()

class DisruptionEvent(models.Model):
    TYPE_VEHICLE_BREAKDOWN = 'vehicle_breakdown'
    TYPE_ROAD_BLOCK = 'road_block'
    TYPE_ACCIDENT = 'accident'
    TYPE_WEATHER = 'weather'
    TYPE_ORDER_MODIFICATION = 'order_modification'
    TYPE_TRANSPORTER_UNWELL = 'transporter_unwell'
    TYPE_OTHER = 'other'

    DISRUPTION_TYPES = [
        (TYPE_VEHICLE_BREAKDOWN, 'Vehicle Breakdown'),
        (TYPE_ROAD_BLOCK, 'Road Blockade'),
        (TYPE_ACCIDENT, 'Accident'),
        (TYPE_WEATHER, 'Severe Weather'),
        (TYPE_ORDER_MODIFICATION, 'Order Modification'),
        (TYPE_TRANSPORTER_UNWELL, 'Transporter Unwell'),
        (TYPE_OTHER, 'Other Disruption'),
    ]

    SEVERITY_LOW = 'low'
    SEVERITY_MEDIUM = 'medium'
    SEVERITY_HIGH = 'high'

    SEVERITY_CHOICES = [
        (SEVERITY_LOW, 'Low'),
        (SEVERITY_MEDIUM, 'Medium'),
        (SEVERITY_HIGH, 'High'),
    ]

    RESOLUTION_PENDING = 'pending'
    RESOLUTION_RESOLVED = 'resolved'
    RESOLUTION_ESCALATED = 'escalated'
    RESOLUTION_FAILED = 'failed'

    RESOLUTION_CHOICES = [
        (RESOLUTION_PENDING, 'Pending'),
        (RESOLUTION_RESOLVED, 'Resolved'),
        (RESOLUTION_ESCALATED, 'Escalated'),
        (RESOLUTION_FAILED, 'Failed'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='disruption_events')
    transporter = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='reported_disruptions')
    disruption_type = models.CharField(max_length=50, choices=DISRUPTION_TYPES, default=TYPE_ROAD_BLOCK)
    severity = models.CharField(max_length=20, choices=SEVERITY_CHOICES, default=SEVERITY_MEDIUM)
    description = models.TextField(blank=True, null=True)
    
    location_latitude = models.FloatField(default=0.0)
    location_longitude = models.FloatField(default=0.0)
    location_name = models.CharField(max_length=255, blank=True, null=True)
    remaining_waypoints_json = models.JSONField(default=list, blank=True)

    resolution_status = models.CharField(max_length=20, choices=RESOLUTION_CHOICES, default=RESOLUTION_PENDING)
    agent_response_time_s = models.FloatField(default=0.0)
    memory_hits = models.IntegerField(default=0)
    outcome_delay_mins = models.FloatField(default=0.0)
    outcome_success = models.BooleanField(default=True)
    chroma_memory_id = models.CharField(max_length=255, blank=True, null=True)

    reported_at = models.DateTimeField(auto_now_add=True)
    resolved_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Disruption ({self.get_disruption_type_display()}) on Order {self.order.order_number}"


class AgentDecisionLog(models.Model):
    AGENT_PLANNER = 'planner'
    AGENT_ROUTE_EXECUTOR = 'route_executor'
    AGENT_RESOURCE_EXECUTOR = 'resource_executor'
    AGENT_CRITIC = 'critic'

    AGENT_TYPE_CHOICES = [
        (AGENT_PLANNER, 'Planner Agent (L1)'),
        (AGENT_ROUTE_EXECUTOR, 'Route Executor Agent (L2)'),
        (AGENT_RESOURCE_EXECUTOR, 'Resource Executor Agent (L2)'),
        (AGENT_CRITIC, 'Critic Agent (L3)'),
    ]

    ACTION_TASK_DECOMPOSITION = 'task_decomposition'
    ACTION_MEMORY_QUERY = 'memory_query'
    ACTION_ROUTE_PROPOSAL = 'route_proposal'
    ACTION_RESOURCE_PROPOSAL = 'resource_proposal'
    ACTION_CRITIC_APPROVAL = 'critic_approval'
    ACTION_CRITIC_REJECTION = 'critic_rejection'
    ACTION_PLAN_EXECUTED = 'plan_executed'
    ACTION_MEMORY_WRITE = 'memory_write'
    ACTION_ESCALATION = 'escalation'

    ACTION_TYPE_CHOICES = [
        (ACTION_TASK_DECOMPOSITION, 'Task Decomposition'),
        (ACTION_MEMORY_QUERY, 'Memory Query'),
        (ACTION_ROUTE_PROPOSAL, 'Route Proposal'),
        (ACTION_RESOURCE_PROPOSAL, 'Resource Proposal'),
        (ACTION_CRITIC_APPROVAL, 'Critic Approval'),
        (ACTION_CRITIC_REJECTION, 'Critic Rejection'),
        (ACTION_PLAN_EXECUTED, 'Plan Executed'),
        (ACTION_MEMORY_WRITE, 'Memory Write'),
        (ACTION_ESCALATION, 'Escalation'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    disruption = models.ForeignKey(DisruptionEvent, on_delete=models.CASCADE, related_name='decision_logs')
    agent_type = models.CharField(max_length=30, choices=AGENT_TYPE_CHOICES)
    action_type = models.CharField(max_length=30, choices=ACTION_TYPE_CHOICES)
    
    input_summary = models.TextField(blank=True, null=True)
    reasoning = models.TextField(blank=True, null=True)
    output_summary = models.TextField(blank=True, null=True)
    
    revision_round = models.IntegerField(default=0)
    critic_feedback = models.TextField(blank=True, null=True)
    processing_time_ms = models.IntegerField(default=0)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Agent Log [{self.agent_type} - {self.action_type}] on Disruption {self.disruption.id}"


class AuditTrail(models.Model):
    EVENT_CHOICES = [
        ('order_created', 'Order Created'),
        ('order_assigned', 'Order Assigned'),
        ('transporter_assigned', 'Transporter Assigned'),
        ('order_picked_up', 'Order Picked Up'),
        ('waypoint_reached', 'Waypoint Reached'),
        ('disruption_reported', 'Disruption Reported'),
        ('agent_rerouted', 'Agent Rerouted'),
        ('transporter_reassigned', 'Transporter Reassigned'),
        ('order_delivered', 'Order Delivered'),
        ('delivery_confirmed', 'Delivery Confirmed'),
        ('dispute_raised', 'Dispute Raised'),
        ('order_cancelled', 'Order Cancelled'),
        ('agent_escalated', 'Agent Escalated'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='audit_trails')
    event_type = models.CharField(max_length=50, choices=EVENT_CHOICES)
    triggered_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    triggered_by_agent = models.CharField(max_length=50, blank=True, null=True)
    previous_status = models.CharField(max_length=50, blank=True, null=True)
    new_status = models.CharField(max_length=50, blank=True, null=True)
    details = models.JSONField(default=dict, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        # Enforce append-only immutability
        if self._state.adding is False:
            raise PermissionError("AuditTrail entries are immutable and cannot be updated.")
        super().save(*args, **kwargs)

    def __str__(self):
        return f"AuditTrail [{self.event_type}] for Order {self.order.order_number} at {self.timestamp}"
