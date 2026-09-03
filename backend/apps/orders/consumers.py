import json
from channels.generic.websocket import AsyncWebsocketConsumer
from urllib.parse import parse_qs
import jwt
from django.conf import settings
from django.contrib.auth import get_user_model
from asgiref.sync import sync_to_async

User = get_user_model()

class OrderConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        query_string = self.scope.get('query_string', b'').decode('utf-8')
        params = parse_qs(query_string)
        token = params.get('token', [None])[0]
        
        self.user = None
        self.groups_joined = []

        if token:
            try:
                payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
                user_id = payload.get('user_id')
                if user_id:
                    self.user = await sync_to_async(User.objects.filter(id=user_id).first)()
            except Exception:
                pass

        await self.accept()

        # Join role group and broadcast groups
        if self.user:
            role_group = f"{self.user.role}_{self.user.id}"
            broadcast_role_group = f"broadcast_{self.user.role}s"
            
            await self.channel_layer.group_add(role_group, self.channel_name)
            await self.channel_layer.group_add(broadcast_role_group, self.channel_name)
            self.groups_joined.extend([role_group, broadcast_role_group])

        # Also join global order events group
        await self.channel_layer.group_add("global_orders", self.channel_name)
        self.groups_joined.append("global_orders")

        await self.send(text_data=json.dumps({
            "type": "connection_established",
            "message": "WebSocket connected to Supply Chain AI Hub",
            "user": self.user.username if self.user else "Anonymous"
        }))

    async def disconnect(self, close_code):
        for group in self.groups_joined:
            await self.channel_layer.group_discard(group, self.channel_name)

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            msg_type = data.get('type')
            
            if msg_type == 'ping':
                await self.send(text_data=json.dumps({"type": "pong"}))
            elif msg_type == 'location_update':
                order_id = data.get('order_id')
                if order_id:
                    await self.channel_layer.group_send(
                        f"order_{order_id}",
                        {
                            "type": "order_event",
                            "event_type": "location_updated",
                            "order_id": order_id,
                            "data": data.get('location', {})
                        }
                    )
        except Exception as e:
            pass

    async def order_event(self, event):
        await self.send(text_data=json.dumps({
            "type": event.get("event_type"),
            "order_id": event.get("order_id"),
            "data": event.get("data"),
            "timestamp": event.get("timestamp")
        }))
