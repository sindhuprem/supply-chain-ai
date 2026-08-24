import React from 'react';
import { ShieldCheck, Cpu, RefreshCw, Radio, Database, AlertTriangle } from 'lucide-react';

const ROLES = [
  { id: 'MANUFACTURER', name: 'Manufacturer', badge: 'Apex Electronics' },
  { id: 'DISTRIBUTOR', name: 'Distributor', badge: 'Metro Hub' },
  { id: 'TRANSPORTER', name: 'Transporter', badge: 'Express Fleet' },
  { id: 'RETAILER', name: 'Retailer', badge: 'CityMart Superstores' },
];

export default function Navbar({ activeRole, setActiveRole, wsStatus, onTriggerDisruption, onOpenMemory }) {
  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-slate-800/80 px-4 py-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand & System Status */}
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-gradient-to-tr from-cyan-600 to-blue-600 rounded-xl shadow-lg shadow-cyan-500/20 text-white">
            <Cpu className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-bold text-lg tracking-tight text-white">SupplyChain<span className="text-cyan-400">AI</span></h1>
              <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wide bg-cyan-950 text-cyan-400 border border-cyan-800/60 rounded-full uppercase">Multi-Agent Engine</span>
            </div>
            <p className="text-xs text-slate-400">Autonomous Disruption Resiliency Platform</p>
          </div>
        </div>

        {/* Role Switcher */}
        <div className="flex items-center bg-slate-900/90 p-1.5 rounded-xl border border-slate-800/90 shadow-inner">
          {ROLES.map((r) => {
            const isActive = activeRole === r.id;
            return (
              <button
                key={r.id}
                onClick={() => setActiveRole(r.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/25'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                {r.name}
              </button>
            );
          })}
        </div>

        {/* Action Controls & WebSocket Indicator */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onOpenMemory}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 text-xs font-medium border border-slate-700/60 transition"
          >
            <Database className="w-3.5 h-3.5 text-cyan-400" />
            <span>ChromaDB Memory</span>
          </button>

          <button
            onClick={onTriggerDisruption}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white text-xs font-semibold shadow-md shadow-amber-500/20 transition transform active:scale-95"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Simulate Disruption</span>
          </button>

          <div className="flex items-center space-x-2 px-2.5 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs">
            <Radio className={`w-3.5 h-3.5 ${wsStatus ? 'text-emerald-400 animate-pulse' : 'text-slate-500'}`} />
            <span className={wsStatus ? 'text-emerald-400 font-medium' : 'text-slate-400'}>
              {wsStatus ? 'Live WS Connected' : 'REST Mode'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
