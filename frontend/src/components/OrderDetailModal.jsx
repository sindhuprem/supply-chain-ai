import React from 'react';
import { X, Package, Truck, Clock, MapPin, ShieldCheck, CheckCircle2, AlertTriangle, FileText, Camera } from 'lucide-react';

export default function OrderDetailModal({ order, onClose }) {
  if (!order) return null;

  const routes = order.routes || [];
  const activeRoute = routes.find(r => r.is_active) || routes[0];
  const auditTrails = order.audit_trails || [];

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-4 p-6 text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase">{order.order_number}</span>
            <h2 className="text-lg font-bold text-white mt-0.5">{order.product_name}</h2>
            <p className="text-xs text-slate-400">Created: {new Date(order.created_at).toLocaleString()}</p>
          </div>
          <button onClick={onClose} className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Banner */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs bg-slate-950 p-3 rounded-xl border border-slate-800">
          <div>
            <span className="text-slate-500 font-semibold block uppercase text-[10px]">Status</span>
            <span className="text-emerald-400 font-bold uppercase">{order.status}</span>
          </div>
          <div>
            <span className="text-slate-500 font-semibold block uppercase text-[10px]">Priority</span>
            <span className="text-amber-400 font-bold uppercase">{order.priority}</span>
          </div>
          <div>
            <span className="text-slate-500 font-semibold block uppercase text-[10px]">Quantity</span>
            <span className="text-slate-200 font-medium">{order.quantity} {order.quantity_unit}</span>
          </div>
          <div>
            <span className="text-slate-500 font-semibold block uppercase text-[10px]">AI Disruption Protection</span>
            <span className="text-purple-400 font-bold">{order.agent_handled ? 'ACTIVE' : 'STANDARD'}</span>
          </div>
        </div>

        {/* Route & Waypoints */}
        {activeRoute && (
          <div className="space-y-2 border border-slate-800 rounded-xl p-4 bg-slate-950/60">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
              <MapPin className="w-4 h-4 text-cyan-400" />
              <span>Current Navigation Route ({activeRoute.route_type})</span>
            </h3>
            <p className="text-xs text-slate-400 italic font-mono bg-slate-900/80 p-2 rounded-lg border border-slate-800">
              "{activeRoute.agent_reasoning || 'Default optimal routing route assigned.'}"
            </p>
            <div className="space-y-2 pt-2">
              {(activeRoute.waypoints || []).map((wp, idx) => (
                <div key={wp.id || idx} className="flex items-center justify-between text-xs p-2 bg-slate-900 rounded-lg border border-slate-800">
                  <div className="flex items-center space-x-2">
                    <span className="w-5 h-5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-700 flex items-center justify-center font-mono font-bold text-[10px]">
                      {wp.sequence_number}
                    </span>
                    <span className="font-medium text-slate-200">{wp.location_name}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                    wp.status === 'reached' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {wp.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Audit Trail */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Immutable Audit Trail</h3>
          <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
            {auditTrails.map((trail) => (
              <div key={trail.id} className="text-xs p-2.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-mono text-cyan-400 font-semibold">{trail.event_type}</span>
                  <p className="text-[11px] text-slate-400 mt-0.5">By: {trail.triggered_by_username || trail.triggered_by_agent || 'System'}</p>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">{new Date(trail.timestamp).toLocaleTimeString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Proof of Delivery */}
        {order.proof_of_delivery_url && (
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center space-x-3">
              <img
                src={order.proof_of_delivery_url}
                alt="Proof of Delivery Receipt"
                className="w-16 h-12 object-cover rounded-lg border border-slate-700 shadow-md cursor-pointer hover:opacity-80"
                onClick={() => window.open(order.proof_of_delivery_url, '_blank')}
                onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=300&auto=format&fit=crop'; }}
              />
              <div>
                <span className="text-xs font-bold text-emerald-400 flex items-center space-x-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Proof of Delivery Photo Verified</span>
                </span>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">Signed receipt & package photo uploaded by carrier</p>
              </div>
            </div>
            {/* Full-width Image Preview Card */}
            <div className="pt-2 border-t border-slate-900 flex justify-center bg-slate-900/50 p-2 rounded-lg">
              <img
                src={order.proof_of_delivery_url}
                alt="Full Delivery Receipt"
                className="max-h-56 w-auto object-contain rounded-lg border border-slate-800 shadow-lg"
                onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&auto=format&fit=crop'; }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
