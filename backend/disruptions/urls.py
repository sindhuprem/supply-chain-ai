from django.urls import path
from .views import TriggerDisruptionView, DisruptionListView, CognitiveMemoryView

urlpatterns = [
    path("", DisruptionListView.as_view(), name="disruption-list"),
    path("trigger/", TriggerDisruptionView.as_view(), name="trigger-disruption"),
    path("cognitive-memory/", CognitiveMemoryView.as_view(), name="cognitive-memory"),
]
