import React from 'react';
import { LogOut, Activity, UserCheck, ShieldCheck } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function TopBar({ title, icon: Icon, colorClass, connectionStatus }) {
  const { user, logout } = useAuth();

  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`p-2.5 rounded-xl ${colorClass} text-white shadow-lg`}>
            {Icon && <Icon className="w-5 h-5" />}
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-100 tracking-tight">{title}</h1>
            <p className="text-xs text-slate-400">
              {user?.company_name || 'Supply Chain Operations'} • <span className="text-cyan-400 font-medium">{user?.username}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* WebSocket Status Dot */}
          <div className="flex items-center space-x-2 px-3 py-1.5 bg-slate-950/80 rounded-full border border-slate-800 text-xs">
            <span className={`w-2 h-2 rounded-full ${
              connectionStatus === 'Connected' ? 'bg-emerald-500 animate-pulse shadow-sm shadow-emerald-500' :
              connectionStatus === 'Connecting' ? 'bg-amber-500 animate-ping' : 'bg-rose-500'
            }`} />
            <span className="text-slate-300 font-medium text-[11px]">
              {connectionStatus === 'Connected' ? 'Live WS Connected' : connectionStatus}
            </span>
          </div>

          {/* Logout Button */}
          <button
            onClick={logout}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-semibold transition-all border border-slate-700"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
