import logging
from geopy.distance import geodesic
from users.models import TransporterProfile

logger = logging.getLogger(__name__)

def find_best_alternate_transporter(disruption_location, order_weight_kg=1000.0, exclude_transporter_id=None):
    """
    Finds available transporters sorted by composite score:
    Score = (performance_score * 0.5) + (proximity_score * 0.3) + (capacity_score * 0.2)
    """
    qs = TransporterProfile.objects.filter(is_available=True)
    if exclude_transporter_id:
        qs = qs.exclude(user_id=exclude_transporter_id)

    candidates = list(qs.select_related('user'))
    scored = []

    disruption_lat = float(disruption_location.get('lat', 18.5204))
    disruption_lng = float(disruption_location.get('lng', 73.8567))

    for t in candidates:
        t_lat = float(t.current_latitude or 18.5204)
        t_lng = float(t.current_longitude or 73.8567)

        distance_km = geodesic((disruption_lat, disruption_lng), (t_lat, t_lng)).km
        proximity_score = max(0.0, 10.0 - (distance_km * 0.2))
        capacity_score = min(10.0, (t.capacity_kg / max(1.0, order_weight_kg)) * 5.0)
        perf_score = float(t.performance_score or 8.5)

        composite = (perf_score * 0.5) + (proximity_score * 0.3) + (capacity_score * 0.2)

        scored.append({
            'user_id': str(t.user.id),
            'username': t.user.username,
            'company_name': t.user.company_name or t.user.username,
            'name': t.user.company_name or t.user.get_full_name() or t.user.username,
            'vehicle_type': t.vehicle_type,
            'vehicle_number': t.vehicle_number,
            'performance_score': perf_score,
            'distance_km': round(distance_km, 2),
            'total_disruptions': t.total_disruptions,
            'capacity_kg': t.capacity_kg,
            'composite_score': round(composite, 2)
        })

    scored.sort(key=lambda x: x['composite_score'], reverse=True)
    return scored
