from django.contrib import admin
from .models import CognitiveMemoryRecord

@admin.register(CognitiveMemoryRecord)
class CognitiveMemoryRecordAdmin(admin.ModelAdmin):
    list_display = ('chroma_vector_id', 'disruption_type', 'severity', 'outcome', 'delay_mins', 'retrieval_count', 'created_at')
    list_filter = ('disruption_type', 'severity', 'outcome')
