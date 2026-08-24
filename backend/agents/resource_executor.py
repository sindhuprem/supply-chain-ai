import logging
from typing import Dict, Any, List
from .state import DisruptionState

logger = logging.getLogger(__name__)

# Mock database of available alternate fleet transporters
CANDIDATE_TRANSPORTERS = [
    {
        "id": "trans_vanguard",
        "name": "Vanguard Logistics Hub",
        "fleet_size": 22,
        "reliability_score": 0.96,
        "vehicle_type": "10-Ton Heavy Cold-Chain Truck",
        "available_drivers": 4,
        "distance_to_pickup_km": 8.5
    },
    {
        "id": "trans_swift",
        "name": "SwiftRail & Express Freight",
        "fleet_size": 15,
        "reliability_score": 0.89,
        "vehicle_type": "Multi-Axle Heavy Hauler",
        "available_drivers": 2,
        "distance_to_pickup_km": 14.2
    },
    {
        "id": "trans_apex",
        "name": "Apex Cargo Lines",
        "fleet_size": 30,
        "reliability_score": 0.93,
        "vehicle_type": "Medium Freight Container",
        "available_drivers": 6,
        "distance_to_pickup_km": 5.1
    }
]

def run_resource_executor_agent(state: DisruptionState) -> DisruptionState:
    """
    Resource Executor Agent Node:
    Evaluates available transporters, scores driver availability, capacity & historical reliability index.
    Selects the optimal replacement transporter.
    """
    logger.info(f"[Resource Executor Agent] Evaluating alternate transporters for order {state.get('order_id')}")

    # Score candidates: composite score = 0.5 * reliability + 0.3 * (1 / distance) + 0.2 * drivers
    scored_candidates = []
    for t in CANDIDATE_TRANSPORTER_LIST if 'CANDIDATE_TRANSPORTER_LIST' in globals() else CANDIDATE_TRANSPORTERS:
        score = (t["reliability_score"] * 0.5) + ((20 - t["distance_to_pickup_km"]) / 20 * 0.3) + (min(t["available_drivers"], 5) / 5 * 0.2)
        scored_candidates.append({**t, "composite_score": round(score, 3)})

    scored_candidates.sort(key=lambda x: x["composite_score"], reverse=True)
    selected_transporter = scored_candidates[0]

    resource_proposal = {
        "selected_transporter_id": selected_transporter["id"],
        "transporter_name": selected_transporter["name"],
        "reliability_score": selected_transporter["reliability_score"],
        "vehicle_type": selected_transporter["vehicle_type"],
        "pickup_eta_minutes": int(selected_transporter["distance_to_pickup_km"] * 2.5),
        "composite_score": selected_transporter["composite_score"],
        "alternate_candidates": [c["name"] for c in scored_candidates[1:]]
    }

    log_msg = f"[Resource Executor Agent]: Evaluated 3 candidate transporters. Selected '{selected_transporter['name']}' (Reliability: {int(selected_transporter['reliability_score']*100)}%, Composite Score: {selected_transporter['composite_score']})."

    state["resource_proposal"] = resource_proposal
    state["execution_logs"].append(log_msg)

    return state
