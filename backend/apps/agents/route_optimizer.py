import math
import uuid
import datetime
import logging
import requests
from geopy.distance import geodesic

logger = logging.getLogger(__name__)

ORS_BASE = "https://api.openrouteservice.org/v2"

def get_road_distance_matrix(locations: list, api_key: str = ""):
    """
    locations: list of [lng, lat] pairs
    Returns NxN distance matrix in seconds (durations) and meters (distances).
    Includes geodesic fallback if ORS API key is missing or fails.
    """
    if api_key and api_key != "demo_ors_key":
        try:
            res = requests.post(
                f"{ORS_BASE}/matrix/driving-car",
                headers={"Authorization": api_key, "Content-Type": "application/json"},
                json={"locations": locations, "metrics": ["duration", "distance"]},
                timeout=5
            )
            if res.status_code == 200:
                data = res.json()
                return data['durations'], data['distances']
        except Exception as e:
            logger.warning(f"ORS API request failed, using geodesic fallback: {e}")

    # Fallback: Geodesic calculation
    n = len(locations)
    durations = [[0.0]*n for _ in range(n)]
    distances = [[0.0]*n for _ in range(n)]

    for i in range(n):
        for j in range(n):
            if i != j:
                p1 = (locations[i][1], locations[i][0])
                p2 = (locations[j][1], locations[j][0])
                dist_m = geodesic(p1, p2).meters
                dur_s = dist_m / 13.88
                distances[i][j] = dist_m
                durations[i][j] = dur_s

    return durations, distances


def greedy_nearest_neighbour(distance_matrix: list, start_index: int = 0) -> list:
    n = len(distance_matrix)
    if n <= 1:
        return [0]
    
    visited = [False] * n
    route = [start_index]
    visited[start_index] = True
    
    for _ in range(n - 1):
        current = route[-1]
        unvisited = [i for i in range(n) if not visited[i]]
        if not unvisited:
            break
        nearest = min(unvisited, key=lambda i: distance_matrix[current][i])
        route.append(nearest)
        visited[nearest] = True
        
    return route


def compute_reroute(start_lat, start_lng, remaining_waypoints, ors_api_key=""):
    if not remaining_waypoints:
        return {
            'waypoints': [],
            'total_distance_km': 0.0,
            'estimated_duration_mins': 0
        }

    locations = [[float(start_lng), float(start_lat)]]
    for wp in remaining_waypoints:
        locations.append([float(wp.get('longitude', start_lng)), float(wp.get('latitude', start_lat))])

    durations, distances = get_road_distance_matrix(locations, ors_api_key)
    route_order = greedy_nearest_neighbour(durations, start_index=0)

    reordered_waypoints = []
    total_distance = 0.0
    total_duration = 0.0

    for seq, idx in enumerate(route_order[1:], start=1):
        raw_wp = remaining_waypoints[idx - 1]
        prev_idx = route_order[seq - 1]
        
        dist_km = round(distances[prev_idx][idx] / 1000.0, 2)
        dur_mins = round(durations[prev_idx][idx] / 60.0, 1)

        # Ensure all values (especially UUIDs) are JSON serializable
        clean_wp = {}
        for k, v in raw_wp.items():
            if isinstance(v, uuid.UUID):
                clean_wp[k] = str(v)
            elif isinstance(v, (datetime.datetime, datetime.date)):
                clean_wp[k] = v.isoformat()
            else:
                clean_wp[k] = v

        clean_wp['sequence_number'] = seq
        clean_wp['distance_from_prev_km'] = dist_km
        clean_wp['duration_from_prev_mins'] = dur_mins
        clean_wp['status'] = raw_wp.get('status', 'pending')

        reordered_waypoints.append(clean_wp)
        total_distance += distances[prev_idx][idx]
        total_duration += durations[prev_idx][idx]

    return {
        'waypoints': reordered_waypoints,
        'total_distance_km': round(total_distance / 1000.0, 2),
        'estimated_duration_mins': round(total_duration / 60.0, 1)
    }
