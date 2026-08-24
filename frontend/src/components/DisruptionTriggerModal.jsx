import React, { useState } from 'react';
import { X, AlertTriangle, Send, Truck, ShieldAlert, Route } from 'lucide-react';

export default function DisruptionTriggerModal({ isOpen, onClose, onSubmit }) {
  const [disruptionType, setDisruptionType] = useState('ROAD_BLOCKADE');
  const [description, setDescription] = useState('Landslide and highway blockade near NH-44 Pune corridor');
  const [lat, setLat] = useState('18.5204');
  const [lng, setLng] = useState('73.8567');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await onSubmit({
      disruption_type: disruptionType,
      description,
      latitude: parseFloat(lat),
      longitude: parseFloat(lng)
    });
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
      <div className="glass-panel w-full max-w-lg rounded-2xl border border-slate-700 shadow-2xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-5">
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Simulate Disruption Event</h2>
            <p className="text-xs text-slate-400">Trigger multi-agent Planner $\rightarrow$ Executor $\rightarrow$ Critic workflow</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Disruption Type</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'ROAD_BLOCKADE', label: 'Road Blockade', icon: Route },
                { id: 'VEHICLE_BREAKDOWN', label: 'Breakdown', icon: Truck },
                { id: 'ORDER_MODIFICATION', label: 'Order Change', icon: ShieldAlert },
              ].map((item) => {
                const Icon = item.icon;
                const isSelected = disruptionType === item.id;
                return (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => setDisruptionType(item.id)}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-medium transition ${
                      isSelected
                        ? 'bg-cyan-950/80 border-cyan-500 text-cyan-300 shadow-md shadow-cyan-500/20'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800/60'
                    }`}
                  >
                    <Icon className="w-4 h-4 mb-1" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Description & Impact Signal</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              placeholder="Describe the disruption..."
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Latitude</label>
              <input
                type="text"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Longitude</label>
              <input
                type="text"
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center space-x-2 px-5 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-lg shadow-amber-500/25 transition transform active:scale-95 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{loading ? 'Processing Agent Pipeline...' : 'Run Agent Pipeline'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
