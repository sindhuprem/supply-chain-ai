import logging
from typing import Dict, Any
from .state import DisruptionState
from .planner import run_planner_agent
from .route_executor import run_route_executor_agent
from .resource_executor import run_resource_executor_agent
from .critic import run_critic_agent

logger = logging.getLogger(__name__)

def execute_disruption_pipeline(initial_state: DisruptionState) -> DisruptionState:
    """
    Executes the Multi-Agent Disruption Engine pipeline:
    Planner -> Route Executor & Resource Executor (Parallel execution logic) -> Critic Agent -> [Approved / Revision Loop]
    """
    logger.info("--- Starting LangGraph Multi-Agent Disruption Engine Pipeline ---")
    
    if "revision_count" not in initial_state or initial_state["revision_count"] is None:
        initial_state["revision_count"] = 0
    if "execution_logs" not in initial_state or initial_state["execution_logs"] is None:
        initial_state["execution_logs"] = []

    # Step 1: Planner Agent
    state = run_planner_agent(initial_state)

    # Step 2 & 3: Parallel Executors (Route & Resource)
    state = run_route_executor_agent(state)
    state = run_resource_executor_agent(state)

    # Step 4: Critic Agent Validation Engine
    state = run_critic_agent(state)

    # Step 5: Revision loop check if needed
    if not state.get("is_approved", False) and state.get("revision_count", 0) < 2:
        logger.info(f"Triggering Revision Round {state['revision_count']}...")
        state = run_route_executor_agent(state)
        state = run_resource_executor_agent(state)
        state = run_critic_agent(state)

    logger.info("--- Completed Multi-Agent Disruption Engine Pipeline ---")
    return state

# Try compiling true LangGraph StateGraph if langgraph is available
try:
    from langgraph.graph import StateGraph, END

    workflow = StateGraph(DisruptionState)
    workflow.add_node("planner", run_planner_agent)
    workflow.add_node("route_executor", run_route_executor_agent)
    workflow.add_node("resource_executor", run_resource_executor_agent)
    workflow.add_node("critic", run_critic_agent)

    workflow.set_entry_point("planner")
    workflow.add_edge("planner", "route_executor")
    workflow.add_edge("planner", "resource_executor")
    workflow.add_edge("route_executor", "critic")
    workflow.add_edge("resource_executor", "critic")

    def should_continue(state: DisruptionState):
        if state.get("is_approved", True) or state.get("revision_count", 0) >= 2:
            return END
        return "route_executor"

    workflow.add_conditional_edges("critic", should_continue)
    app_graph = workflow.compile()
    logger.info("LangGraph StateGraph compiled successfully.")
except Exception as e:
    logger.warning(f"LangGraph StateGraph direct compile fallback to pipeline execution: {e}")
    app_graph = None
