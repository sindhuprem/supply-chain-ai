import logging
from django.utils import timezone

logger = logging.getLogger(__name__)

try:
    from channels.layers import get_channel_layer
    from asgiref.sync import async_to_sync
except ImportError:
    get_channel_layer = None
    async_to_sync = None

async def broadcast_order_update(order_id, event_type, payload):
    if not get_channel_layer:
        return
    channel_layer = get_channel_layer()
    if not channel_layer:
        return

    message = {
        "type": "order_event",
        "event_type": event_type,
        "order_id": order_id,
        "data": payload,
        "timestamp": timezone.now().isoformat()
    }

    groups = [
        f"order_{order_id}",
        "broadcast_manufacturers",
        "broadcast_distributors",
        "broadcast_transporters",
        "broadcast_retailers"
    ]

    for group in groups:
        try:
            await channel_layer.group_send(group, message)
        except Exception as e:
            logger.warning(f"Error broadcasting to group {group}: {e}")

def broadcast_order_update_sync(order_id, event_type, payload):
    if not get_channel_layer or not async_to_sync:
        return
    channel_layer = get_channel_layer()
    if not channel_layer:
        return

    message = {
        "type": "order_event",
        "event_type": event_type,
        "order_id": order_id,
        "data": payload,
        "timestamp": timezone.now().isoformat()
    }

    groups = [
        f"order_{order_id}",
        "broadcast_manufacturers",
        "broadcast_distributors",
        "broadcast_transporters",
        "broadcast_retailers"
    ]

    for group in groups:
        try:
            async_to_sync(channel_layer.group_send)(group, message)
        except Exception as e:
            logger.warning(f"Error sync broadcasting to group {group}: {e}")
