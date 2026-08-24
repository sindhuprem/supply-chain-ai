import logging
from typing import Dict, Any
from .state import DisruptionState
from .memory import memory_store

logger = logging.getLogger(__name__)

def run_planner_agent(state: DisruptionState) -> DisruptionState:
    """
    Planner Agent Node:
    1. Interprets the incoming disruption signal.
    2. Queries ChromaDB Cognitive Memory for past precedent resolutions.
    3. Decomposes the signal into Route Recomputation & Transporter Reassignment subtasks.
    """
    signal_desc = state.get("description", "Unspecified disruption")
    d_type = state.get("disruption_type", "ROAD_BLOCKADE")
    
    logger.info(f"[Planner Agent] Processing signal: '{signal_desc}' ({d_type})")

    # 1. Query Cognitive Memory
    precedents = memory_store.query_similar_precedents(query_text=signal_desc, disruption_type=d_type, top_k=2)

    # 2. Subtask Decomposition
    subtasks = [
        f"Recompute active road route segment around disruption point {state.get('location_coords', [19.0, 73.0])}",
        f"Evaluate transporter availability, capacity, and reliability score for re-assignment",
        f"Synchronize real-time WebSocket alerts across Manufacturer, Distributor, Transporter, and Retailer"
    ]

    # Log action to state execution logs
    log_msg = f"[Planner Agent]: Analyzed '{d_type}' signal. Retrieved {len(precedents)} past precedents from ChromaDB Memory. Created subtasks for Route & Resource Executors."
    
    state["past_precedents"] = precedents
    state["subtasks"] = subtasks
    if "execution_logs" not in state or state["execution_logs"] is None:
        state["execution_logs"] = []
    state["execution_logs"].append(log_msg)

    return state
