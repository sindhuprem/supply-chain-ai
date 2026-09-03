import logging
from datetime import date
from django.db.models import Sum, Avg, F
from orders.models import Order
from disruptions.models import DisruptionEvent
from memory.models import CognitiveMemoryRecord
from .models import AnalyticsSnapshot

logger = logging.getLogger(__name__)

def compute_analytics_snapshot(manufacturer_id):
    """
    Recomputes all analytics metrics for the manufacturer.
    Includes memory system performance metrics for the paper.
    Run daily via Celery beat + after every order confirmation.
    """
    try:
        today = date.today()
        orders = Order.objects.filter(manufacturer_id=manufacturer_id)
        disruptions = DisruptionEvent.objects.filter(order__manufacturer_id=manufacturer_id)

        total = orders.count()
        completed = orders.filter(status=Order.STATUS_CONFIRMED).count()
        fulfillment_rate = (completed / total * 100) if total > 0 else 0.0

        confirmed_orders = orders.filter(status=Order.STATUS_CONFIRMED, actual_delivered_at__isnull=False)
        delays = []
        for o in confirmed_orders:
            if o.actual_delivered_at and o.estimated_delivery_at:
                delta = (o.actual_delivered_at - o.estimated_delivery_at).total_seconds() / 60.0
                delays.append(max(0.0, delta))
        avg_delay = sum(delays) / len(delays) if delays else 0.0

        agent_resolved = disruptions.filter(resolution_status=DisruptionEvent.RESOLUTION_RESOLVED).count()
        escalated = disruptions.filter(resolution_status=DisruptionEvent.RESOLUTION_ESCALATED).count()
        response_times = list(disruptions.filter(
            agent_response_time_s__isnull=False
        ).values_list('agent_response_time_s', flat=True))
        avg_response = sum(response_times) / len(response_times) if response_times else 0.0

        # Memory metrics — KEY paper metrics
        total_queries = disruptions.aggregate(Sum('memory_hits'))['memory_hits__sum'] or 0
        queries_with_hits = disruptions.filter(memory_hits__gt=0).count()
        hit_rate = (queries_with_hits / disruptions.count() * 100) if disruptions.count() > 0 else 0.0

        # Memory improvement rate: compare delay for disruptions with memory hits vs without
        with_memory = disruptions.filter(memory_hits__gt=0, outcome_delay_mins__isnull=False)
        without_memory = disruptions.filter(memory_hits=0, outcome_delay_mins__isnull=False)
        avg_delay_with = with_memory.aggregate(Avg('outcome_delay_mins'))['outcome_delay_mins__avg'] or 0.0
        avg_delay_without = without_memory.aggregate(Avg('outcome_delay_mins'))['outcome_delay_mins__avg'] or 0.0
        improvement = ((avg_delay_without - avg_delay_with) / avg_delay_without * 100) if avg_delay_without > 0 else 0.0

        snapshot, _ = AnalyticsSnapshot.objects.update_or_create(
            manufacturer_id=manufacturer_id,
            snapshot_date=today,
            defaults={
                'total_orders': total,
                'completed_orders': completed,
                'fulfillment_rate': round(fulfillment_rate, 2),
                'avg_delay_mins': round(avg_delay, 2),
                'on_time_deliveries': orders.filter(status=Order.STATUS_CONFIRMED).filter(
                    actual_delivered_at__lte=F('estimated_delivery_at')
                ).count(),
                'total_disruptions': disruptions.count(),
                'agent_resolved_disruptions': agent_resolved,
                'human_escalated_disruptions': escalated,
                'avg_agent_response_time_s': round(avg_response, 2),
                'memory_queries_total': total_queries,
                'memory_hit_rate': round(hit_rate, 2),
                'memory_improvement_rate': round(improvement, 2),
            }
        )
        return snapshot
    except Exception as e:
        logger.error(f"Error computing analytics snapshot for {manufacturer_id}: {e}")
        return None
