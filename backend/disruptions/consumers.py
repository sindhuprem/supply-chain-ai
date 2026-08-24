import json
import logging
from channels.generic.websocket import AsyncWebsocketConsumer

logger = logging.getLogger(__name__)

class DisruptionConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.group_name = "disruptions_broadcast"
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()
        logger.info(f"WebSocket client connected to {self.group_name}")
        await self.send(text_data=json.dumps({
            "type": "connection_established",
            "message": "Connected to Supply Chain Real-Time Disruption WebSocket Engine"
        }))

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.group_name, self.channel_name)
        logger.info("WebSocket client disconnected.")

    async def receive(self, text_data):
        data = json.loads(text_data)
        message_type = data.get("type", "ping")
        if message_type == "ping":
            await self.send(text_data=json.dumps({"type": "pong"}))

    async def disruption_event(self, event):
        """
        Handler for broadcasting disruption events to all connected clients.
        """
        await self.send(text_data=json.dumps({
            "type": "disruption_update",
            "payload": event["payload"]
        }))
