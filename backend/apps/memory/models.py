import uuid
from django.db import models
from disruptions.models import DisruptionEvent

class CognitiveMemoryRecord(models.Model):
    OUTCOME_SUCCESS = 'success'
    OUTCOME_DELAYED = 'delayed'
    OUTCOME_FAILED = 'failed'
    OUTCOME_ESCALATED = 'escalated'

    OUTCOME_CHOICES = [
        (OUTCOME_SUCCESS, 'Success'),
        (OUTCOME_DELAYED, 'Delayed'),
        (OUTCOME_FAILED, 'Failed'),
        (OUTCOME_ESCALATED, 'Escalated'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    disruption = models.OneToOneField(DisruptionEvent, on_delete=models.CASCADE, related_name='memory_record')
    chroma_vector_id = models.CharField(max_length=255, unique=True)
    embedded_text = models.TextField()
    disruption_type = models.CharField(max_length=50)
    severity = models.CharField(max_length=20)
    location_region = models.CharField(max_length=100, blank=True, null=True)
    resolution_approach = models.TextField(blank=True, null=True)
    
    outcome = models.CharField(max_length=20, choices=OUTCOME_CHOICES, default=OUTCOME_SUCCESS)
    delay_mins = models.FloatField(default=0.0)
    agent_confidence = models.FloatField(default=0.9)  # float 0-1
    retrieval_count = models.IntegerField(default=0)
    helpful_count = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"MemoryRecord [{self.chroma_vector_id}] - Outcome: {self.outcome}"
