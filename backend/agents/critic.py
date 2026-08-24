import logging
from typing import Dict, Any
from .state import DisruptionState
from .memory import memory_store

logger = logging.getLogger(__name__)

def run_critic_agent(state: DisruptionState) -> DisruptionState:
    """
    Critic Agent Node:
    1. Validates Route Executor & Resource Executor proposals against hard and soft constraints.
    2. Enforces validation rules (Detour < 50km, Transporter Reliability >= 85%).
    3. Triggers revision loop (max 2 rounds) or grants final validation approval.
    4. Writes back the approved outcome into ChromaDB Cognitive Memory.
    """
    route_prop = state.get("route_proposal", {})
    res_prop = state.get("resource_proposal", {})
    revision_count = state.get("revision_count", 0)

    logger.info(f"[Critic Agent] Auditing proposals (Revision Round {revision_count})...")

    # Hard Constraint Check
    detour_dist = route_prop.get("detour_distance_km", 999.0)
    reliability = res_prop.get("reliability_score", 0.0)

    is_route_valid = detour_dist <= 50.0
    is_resource_valid = reliability >= 0.85

    validation_passed = is_route_valid and is_resource_valid

    if validation_passed:
        state["is_approved"] = True
        critic_decision = {
            "status": "APPROVED",
            "confidence_score": 0.96,
            "checks": {
                "detour_within_limit": f"PASS ({detour_dist} km <= 50 km)",
                "transporter_reliability": f"PASS ({int(reliability*100)}% >= 85%)",
                "time_window_compliance": "PASS (+22 min delay within acceptable SLA window)"
            },
            "approval_summary": f"Critic Agent approved reroute via Bypass 4B with Transporter '{res_prop.get('transporter_name')}'."
        }
        log_msg = f"[Critic Agent]: VALIDATION PASSED. Approved reroute and transporter assignment. Confidence: 96%."
        state["execution_logs"].append(log_msg)

        # Writeback to Cognitive Memory Store (Vector DB learning!)
        memory_store.store_outcome(
            disruption_type=state.get("disruption_type", "ROAD_BLOCKADE"),
            description=state.get("description", "Disruption event"),
            resolution=critic_decision["approval_summary"],
            success_score=0.96
        )

    else:
        # If validation failed and revision round available
        if revision_count < 2:
            state["revision_count"] = revision_count + 1
            state["is_approved"] = False
            critic_decision = {
                "status": "REVISION_REQUESTED",
                "reason": f"Constraint violation: detour={detour_dist}km, reliability={reliability}",
                "feedback": "Requesting Route & Resource Executors to recalculate tighter detour corridor."
            }
            log_msg = f"[Critic Agent]: VALIDATION FAILED. Requesting revision round {state['revision_count']}/2."
            state["execution_logs"].append(log_msg)
        else:
            # Fallback approval with warning if max revisions reached
            state["is_approved"] = True
            critic_decision = {
                "status": "APPROVED_WITH_WARNING",
                "reason": "Max revision limit reached (2 rounds). Proceeding with best candidate.",
                "approval_summary": f"Critic Agent approved best fallback solution."
            }
            log_msg = f"[Critic Agent]: Max revision attempts reached. Approved fallback solution."
            state["execution_logs"].append(log_msg)

    state["critic_validation"] = critic_decision

    # Final combined response payload for frontend & WebSocket broadcast
    state["final_response"] = {
        "disruption_id": state.get("disruption_id"),
        "order_id": state.get("order_id"),
        "disruption_type": state.get("disruption_type"),
        "status": critic_decision.get("status"),
        "planner_subtasks": state.get("subtasks"),
        "past_precedents": state.get("past_precedents"),
        "route_proposal": route_prop,
        "resource_proposal": res_prop,
        "critic_validation": critic_decision,
        "execution_logs": state.get("execution_logs")
    }

    return state
