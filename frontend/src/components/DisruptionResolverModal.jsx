import React from 'react';
import { ShieldCheck, Cpu, CheckCircle2, Navigation, AlertTriangle, ArrowRight, X, Clock, MapPin, Truck } from 'lucide-react';

export default function DisruptionResolverModal({ disruption, order, onClose }) {
  if (!disruption && !order) return null;

  const routeData = order?.routes?.find(r => r.is_active) || {};

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-5 text-slate-100 animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/30">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-white tracking-tight">AI Multi-Agent Reroute Resolution</h3>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-950 text-emerald-300 rounded-full border border-emerald-800 uppercase">
                  Approved by Critic
                </span>
              </div>
              <p className="text-xs text-slate-400">Order #{order?.order_number || '2026-9901'} • Autonomous SLA Protection</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Agent Workflow Stepper */}
        <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800/80 space-y-3">
          <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider block">4-Agent Autonomous Execution Chain</span>
          <div className="grid grid-cols-4 gap-2 text-center text-xs">
            <div className="p-2 bg-purple-950/50 border border-purple-800/60 rounded-xl space-y-1">
              <Cpu className="w-4 h-4 text-purple-400 mx-auto" />
              <span className="text-[10px] font-bold text-purple-200 block">1. Planner</span>
              <span className="text-[9px] text-emerald-400 block font-semibold">ChromaDB Hit</span>
            </div>

            <div className="p-2 bg-cyan-950/50 border border-cyan-800/60 rounded-xl space-y-1">
              <Navigation className="w-4 h-4 text-cyan-400 mx-auto" />
              <span className="text-[10px] font-bold text-cyan-200 block">2. Route Exec</span>
              <span className="text-[9px] text-cyan-400 block font-semibold">Bypass 4B</span>
            </div>

            <div className="p-2 bg-amber-950/50 border border-amber-800/60 rounded-xl space-y-1">
              <Truck className="w-4 h-4 text-amber-400 mx-auto" />
              <span className="text-[10px] font-bold text-amber-200 block">3. Resource Exec</span>
              <span className="text-[9px] text-amber-400 block font-semibold">Fleet Linked</span>
            </div>

            <div className="p-2 bg-emerald-950/50 border border-emerald-800/60 rounded-xl space-y-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400 mx-auto" />
              <span className="text-[10px] font-bold text-emerald-200 block">4. Critic Agent</span>
              <span className="text-[9px] text-emerald-400 block font-semibold">SLA Verified</span>
            </div>
          </div>
        </div>

        {/* Simple Plain-English Resolution Summary */}
        <div className="space-y-3 text-xs">
          <div className="p-4 bg-slate-950/70 rounded-2xl border border-slate-800 space-y-2">
            <h4 className="font-bold text-slate-200 flex items-center space-x-1.5">
              <MapPin className="w-4 h-4 text-cyan-400" />
              <span>Optimized Navigation Details</span>
            </h4>
            <p className="text-slate-300 leading-relaxed font-medium">
              {routeData.agent_reasoning || "The AI multi-agent pipeline computed an optimal detour around the traffic obstacle. All delivery stops have been re-ordered to prevent customer stockouts."}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-500 font-semibold uppercase block">Bypass Route Distance</span>
              <span className="text-base font-bold text-cyan-400 font-mono">{routeData.total_distance_km || 165.4} km</span>
            </div>
            <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-500 font-semibold uppercase block">Estimated Delay Penalty</span>
              <span className="text-base font-bold text-emerald-400 font-mono">+{routeData.estimated_duration_mins || 22} mins</span>
            </div>
          </div>
        </div>

        {/* Footer Action */}
        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="flex items-center space-x-1.5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/30 transition-all"
          >
            <span>Resume Navigation with AI Route</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
