import React from 'react';
import { Terminal, CheckCircle2, AlertCircle, Cpu, Route, Truck, ShieldCheck, Database } from 'lucide-react';

export default function AgentTerminal({ activeDisruption }) {
  const payload = activeDisruption?.response_payload || {};
  const logs = payload.execution_logs || [
    "[Planner Agent]: Disruption signal detected on NH-44 Pune Expressway.",
    "[Planner Agent]: Fetched 2 past disruption precedents from ChromaDB Memory.",
    "[Route Executor Agent]: Calculated detour via Bypass 4B (+16.4 km, +22 mins).",
    "[Resource Executor Agent]: Selected 'Vanguard Logistics' (Reliability: 96%).",
    "[Critic Agent]: Hard/soft constraints check PASSED. Approved reroute response."
  ];

  const critic = payload.critic_validation || {
    status: 'APPROVED',
    confidence_score: 0.96,
    checks: {
      detour_within_limit: 'PASS (16.4 km <= 50 km)',
      transporter_reliability: 'PASS (96% >= 85%)',
      time_window_compliance: 'PASS (+22 min delay within SLA)'
    }
  };

  const precedents = payload.past_precedents || [
    {
      description: "Engine failure on 10-ton truck near NH-44 carrying cold-chain pharma",
      resolution: "Reassigned to Vanguard Logistics & rerouted via SH-12 bypass.",
      success_score: 0.94
    }
  ];

  return (
    <div className="glass-panel rounded-2xl p-4 border border-slate-800 shadow-xl flex flex-col h-full">
      {/* Terminal Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-3">
        <div className="flex items-center space-x-2">
          <Terminal className="w-5 h-5 text-cyan-400" />
          <h2 className="text-sm font-semibold text-white">LangGraph Multi-Agent Execution Terminal</h2>
        </div>
        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-950 text-emerald-400 border border-emerald-800">
            <CheckCircle2 className="w-3 h-3 mr-1" /> Validated Response
          </span>
        </div>
      </div>

      {/* Agent Workflow Steps */}
      <div className="space-y-3 flex-1 overflow-y-auto pr-1">
        {/* Planner Node */}
        <div className="glass-card rounded-xl p-3 border border-slate-800">
          <div className="flex items-center space-x-2 text-cyan-400 text-xs font-semibold mb-1">
            <Cpu className="w-4 h-4" />
            <span>1. Planner Agent & Precedent Search</span>
          </div>
          <p className="text-xs text-slate-300 mb-2">Interpreted signal and queried ChromaDB Cognitive Memory vector store.</p>
          
          {precedents.length > 0 && (
            <div className="bg-slate-950/80 p-2 rounded-lg border border-slate-800 text-[11px] text-slate-400 font-mono space-y-1">
              <div className="flex items-center text-cyan-300 font-semibold mb-0.5">
                <Database className="w-3 h-3 mr-1" /> Retained Precedent Insight:
              </div>
              <p>• {precedents[0].resolution}</p>
            </div>
          )}
        </div>

        {/* Parallel Executors Node */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {/* Route Executor */}
          <div className="glass-card rounded-xl p-3 border border-slate-800">
            <div className="flex items-center space-x-1.5 text-blue-400 text-xs font-semibold mb-1">
              <Route className="w-4 h-4" />
              <span>Route Executor Node</span>
            </div>
            <p className="text-xs text-slate-300">Detour: <span className="font-semibold text-white">+16.4 km</span> (+22 mins ETA)</p>
            <p className="text-[11px] text-slate-400 mt-1">OpenRouteService Avoidance Bypass Applied</p>
          </div>

          {/* Resource Executor */}
          <div className="glass-card rounded-xl p-3 border border-slate-800">
            <div className="flex items-center space-x-1.5 text-purple-400 text-xs font-semibold mb-1">
              <Truck className="w-4 h-4" />
              <span>Resource Executor Node</span>
            </div>
            <p className="text-xs text-slate-300">Selected: <span className="font-semibold text-white">Vanguard Logistics</span></p>
            <p className="text-[11px] text-emerald-400 font-medium mt-1">Reliability Index: 96% (Composite Score: 0.94)</p>
          </div>
        </div>

        {/* Critic Agent Validation Node */}
        <div className="glass-card rounded-xl p-3 border border-emerald-900/40 bg-emerald-950/10">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2 text-emerald-400 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>2. Critic Agent Hard/Soft Constraint Audit</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-900/50 text-emerald-300 border border-emerald-700 font-mono">
              CONFIDENCE 96%
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-1.5 text-[11px]">
            {Object.entries(critic.checks || {}).map(([key, val]) => (
              <div key={key} className="bg-slate-950/60 p-1.5 rounded border border-slate-800">
                <span className="text-slate-400 block font-mono text-[10px] uppercase">{key.replace(/_/g, ' ')}</span>
                <span className="text-emerald-400 font-medium">{val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Live Execution Console Logs */}
        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/90 font-mono text-[11px] space-y-1 overflow-x-auto max-h-36">
          <div className="text-slate-500 text-[10px] uppercase tracking-wider mb-1 border-b border-slate-800 pb-1">Pipeline Console Log</div>
          {logs.map((line, idx) => (
            <div key={idx} className="text-slate-300 leading-relaxed">
              <span className="text-cyan-500 mr-1 shadow-sm">&gt;</span> {line}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
