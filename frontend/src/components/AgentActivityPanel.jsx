import React from 'react';
import { Cpu, CheckCircle2, ShieldCheck, Navigation, Truck, Sparkles, Layers } from 'lucide-react';

export default function AgentActivityPanel({ logs = [] }) {
  const sampleLogs = [
    {
      id: '1',
      agent_type: 'planner',
      action_type: 'task_decomposition',
      reasoning: 'Analyzed roadblock disruption. Retrieved past resolution from ChromaDB memory (94% confidence match). Strategy: Reroute via Bypass 4B.',
      timestamp: new Date(Date.now() - 1000 * 60 * 3).toLocaleTimeString()
    },
    {
      id: '2',
      agent_type: 'route_executor',
      action_type: 'route_proposal',
      reasoning: 'Computed real road distance matrix via OpenRouteService API. Reordered waypoints to avoid landslide zone (+16.4 km, +22m ETA penalty).',
      timestamp: new Date(Date.now() - 1000 * 60 * 2).toLocaleTimeString()
    },
    {
      id: '3',
      agent_type: 'resource_executor',
      action_type: 'resource_proposal',
      reasoning: 'Evaluated fleet availability. Retained current transporter vehicle (Reefer Truck #RF-104) as cold-chain stability temperature is stable.',
      timestamp: new Date(Date.now() - 1000 * 60 * 1.5).toLocaleTimeString()
    },
    {
      id: '4',
      agent_type: 'critic',
      action_type: 'critic_approval',
      reasoning: 'Critic Agent verified SLA compliance & safety thresholds for high severity level. Confidence score 0.94. APPROVED and written to database.',
      timestamp: new Date(Date.now() - 1000 * 60 * 1).toLocaleTimeString()
    }
  ];

  const activeLogs = logs.length > 0 ? logs : sampleLogs;

  const agentBadges = {
    planner: { label: '1. Planner Agent', icon: Cpu, color: 'bg-purple-950 text-purple-300 border-purple-800' },
    route_executor: { label: '2. Route Executor', icon: Navigation, color: 'bg-cyan-950 text-cyan-300 border-cyan-800' },
    resource_executor: { label: '3. Resource Executor', icon: Truck, color: 'bg-amber-950 text-amber-300 border-amber-800' },
    critic: { label: '4. Critic Agent', icon: ShieldCheck, color: 'bg-emerald-950 text-emerald-300 border-emerald-800' }
  };

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4 space-y-3 shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-purple-500/20 text-purple-400 rounded-lg border border-purple-500/30">
            <Cpu className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-slate-100">Live AI Multi-Agent Decision Feed</h3>
        </div>
        <span className="px-2 py-0.5 text-[10px] font-mono bg-purple-950 text-purple-300 rounded-full border border-purple-800">
          ChromaDB Memory Active
        </span>
      </div>

      <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
        {activeLogs.map((log) => {
          const agentKey = log.agent_type?.toLowerCase() || 'planner';
          const badge = agentBadges[agentKey] || agentBadges.planner;
          const BadgeIcon = badge.icon;

          return (
            <div key={log.id} className="p-3 bg-slate-950/70 rounded-xl border border-slate-800/80 text-xs space-y-1.5 hover:border-purple-500/30 transition-all">
              <div className="flex items-center justify-between">
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border flex items-center space-x-1 ${badge.color}`}>
                  <BadgeIcon className="w-3 h-3" />
                  <span>{badge.label}</span>
                </span>
                <span className="text-[10px] text-slate-500 font-mono">{log.timestamp}</span>
              </div>
              <p className="text-slate-300 font-medium leading-relaxed">{log.reasoning}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
