from rest_framework import serializers
from .models import CognitiveMemoryRecord

class CognitiveMemoryRecordSerializer(serializers.ModelSerializer):
    order_number = serializers.CharField(source='disruption.order.order_number', read_only=True)

    class Meta:
        model = CognitiveMemoryRecord
        fields = [
            'id', 'chroma_vector_id', 'disruption_type', 'severity',
            'location_region', 'resolution_approach', 'outcome',
            'delay_mins', 'agent_confidence', 'retrieval_count',
            'helpful_count', 'created_at', 'order_number', 'embedded_text'
        ]
