from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r"ws/disruptions/$", consumers.DisruptionConsumer.as_asgi()),
]
