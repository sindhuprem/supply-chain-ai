from typing import TypedDict, List, Dict, Any, Optional

class DisruptionState(TypedDict):
    disruption_id: str
    order_id: str
    disruption_type: str  # VEHICLE_BREAKDOWN, ROAD_BLOCKADE, ORDER_MODIFICATION
    description: str
    location_coords: List[float] # [lat, lng]
    severity: str # LOW, MEDIUM, HIGH, CRITICAL

    # Planner Output
    past_precedents: List[Dict[str, Any]]
    subtasks: List[str]

    # Executor Outputs
    route_proposal: Optional[Dict[str, Any]]
    resource_proposal: Optional[Dict[str, Any]]

    # Critic Output & Loop Control
    critic_validation: Optional[Dict[str, Any]]
    revision_count: int
    is_approved: bool

    # Final Execution Summary
    execution_logs: List[str]
    final_response: Optional[Dict[str, Any]]
