from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from django.utils import timezone

from .models import Order
from disruptions.models import DisruptionEvent, AuditTrail
from analytics.tasks import compute_analytics_snapshot
from memory.chroma_client import write_disruption_to_memory
from .utils import broadcast_order_update_sync

def _get_resolution_approach(disruption):
    log = disruption.decision_logs.filter(agent_type='critic').first()
    if log and log.output_summary:
        return log.output_summary
    return "Rerouted via alternate highway bypass"

def _get_transporter_score(disruption):
    if disruption.transporter and hasattr(disruption.transporter, 'transporter_profile'):
        return disruption.transporter.transporter_profile.performance_score
    return 9.0

@receiver(pre_save, sender=Order)
def cache_previous_status(sender, instance, **kwargs):
    if instance.pk:
        try:
            old_obj = Order.objects.get(pk=instance.pk)
            instance._previous_status = old_obj.status
        except Order.DoesNotExist:
            instance._previous_status = None
    else:
        instance._previous_status = None

@receiver(post_save, sender=Order)
def handle_order_post_save(sender, instance, created, **kwargs):
    prev_status = getattr(instance, '_previous_status', None)
    
    if created:
        event_type = 'order_created'
        AuditTrail.objects.create(
            order=instance,
            event_type=event_type,
            triggered_by=instance.manufacturer,
            previous_status=None,
            new_status=instance.status,
            details={"product_name": instance.product_name, "quantity": instance.quantity}
        )
        broadcast_order_update_sync(str(instance.id), 'order_status_changed', {
            "order_id": str(instance.id),
            "order_number": instance.order_number,
            "status": instance.status,
            "event_type": event_type
        })
    elif prev_status and prev_status != instance.status:
        event_type = f"order_{instance.status}"
        AuditTrail.objects.create(
            order=instance,
            event_type=event_type,
            triggered_by=instance.transporter or instance.distributor or instance.retailer,
            previous_status=prev_status,
            new_status=instance.status,
            details={"previous_status": prev_status, "new_status": instance.status}
        )
        
        broadcast_order_update_sync(str(instance.id), 'order_status_changed', {
            "order_id": str(instance.id),
            "order_number": instance.order_number,
            "status": instance.status,
            "previous_status": prev_status,
            "event_type": event_type
        })

@receiver(post_save, sender=Order)
def on_order_confirmed(sender, instance, **kwargs):
    if instance.status == Order.STATUS_CONFIRMED:
        # 1. Process agent-handled disruption outcomes for ChromaDB continual learning
        if instance.agent_handled:
            disruptions = DisruptionEvent.objects.filter(
                order=instance,
                resolution_status=DisruptionEvent.RESOLUTION_RESOLVED
            )
            for disruption in disruptions:
                delay_mins = 0
                if instance.actual_delivered_at and instance.estimated_delivery_at:
                    delta = instance.actual_delivered_at - instance.estimated_delivery_at
                    delay_mins = max(0, int(delta.total_seconds() / 60))

                outcome_result = 'success' if delay_mins <= 15 else 'delayed'

                critic_log = disruption.decision_logs.filter(action_type='critic_approval').first()
                confidence = float(critic_log.output_summary.split('Confidence: ')[-1]) if (critic_log and 'Confidence:' in critic_log.output_summary) else 0.92

                outcome = {
                    'resolution_approach': _get_resolution_approach(disruption),
                    'result': outcome_result,
                    'delay_mins': delay_mins,
                    'transporter_score': _get_transporter_score(disruption),
                    'agent_confidence': confidence
                }

                memory_id = write_disruption_to_memory(disruption, outcome)

                disruption.chroma_memory_id = memory_id
                disruption.outcome_delay_mins = delay_mins
                disruption.outcome_success = (outcome_result == 'success')
                disruption.save()

        # 2. Update TransporterProfile performance score
        if instance.transporter and hasattr(instance.transporter, 'transporter_profile'):
            profile = instance.transporter.transporter_profile
            profile.total_deliveries += 1
            if instance.actual_delivered_at and instance.estimated_delivery_at:
                if instance.actual_delivered_at <= instance.estimated_delivery_at:
                    profile.on_time_deliveries += 1
            else:
                profile.on_time_deliveries += 1
            profile.update_performance_score()

        # 3. Recompute AnalyticsSnapshot for manufacturer
        if instance.manufacturer:
            compute_analytics_snapshot(str(instance.manufacturer.id))
