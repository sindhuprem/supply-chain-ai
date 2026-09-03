import React, { useState } from 'react';
import { X, Truck, Star, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function AssignTransporterModal({ order, onAssign, onClose }) {
  const [selectedTransporter, setSelectedTransporter] = useState('swift_fleet');
  const [loading, setLoading] = useState(false);

  const mockTransporters = [
    {
      id: 'swift_fleet',
      name: 'Swift Fleet Carriers',
      vehicle: '10-Ton Refrigerated Truck (Reefer #RF-104)',
      score: 9.8,
      distance: '4.2 km to pickup facility',
      disruptions: 0,
      color: 'text-emerald-400'
    },
    {
      id: 'vanguard_express',
      name: 'Vanguard Express Lines',
      vehicle: '12-Ton Heavy Transport Container (#LX-808)',
      score: 9.5,
      distance: '8.4 km to pickup facility',
      disruptions: 1,
      color: 'text-cyan-400'
    },
    {
      id: 'apex_freight',
      name: 'Apex Freight Logistics',
      vehicle: '20-Ton Heavy Hauler Trailer (#AF-302)',
      score: 9.2,
      distance: '12.6 km to pickup facility',
      disruptions: 0,
      color: 'text-purple-400'
    },
    {
      id: 'cryo_cold_transit',
      name: 'Cryo-Cold Pharma Transit',
      vehicle: '8-Ton Specialized Deep-Freeze Reefer (#CC-501)',
      score: 9.9,
      distance: '15.1 km to pickup facility',
      disruptions: 0,
      color: 'text-emerald-400'
    },
    {
      id: 'metro_cargo',
      name: 'Metro Heavy Cargo',
      vehicle: '15-Ton Multi-Axle Flatbed (#BS-909)',
      score: 8.4,
      distance: '18.1 km to pickup facility',
      disruptions: 2,
      color: 'text-amber-400'
    }
  ];

  const handleSelectAndSubmit = (transporterId) => {
    setSelectedTransporter(transporterId);
    setLoading(true);
    onAssign(order.id, transporterId);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    onAssign(order.id, selectedTransporter);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full shadow-2xl space-y-4 p-6 text-slate-100">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-bold text-white">Assign Carrier Fleet</h3>
            <p className="text-xs text-slate-400">Order: <span className="font-mono text-cyan-400 font-bold">{order?.order_number}</span></p>
          </div>
          <button onClick={onClose} className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-2">
            {mockTransporters.map((t) => (
              <div
                key={t.id}
                onClick={() => handleSelectAndSubmit(t.id)}
                className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  selectedTransporter === t.id
                    ? 'bg-emerald-950/50 border-emerald-500 shadow-lg shadow-emerald-950/30'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-950/90'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${selectedTransporter === t.id ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-300'}`}>
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-100 flex items-center space-x-1.5">
                      <span>{t.name}</span>
                      {selectedTransporter === t.id && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                    </h4>
                    <p className="text-[11px] text-slate-400">{t.vehicle}</p>
                    <span className="text-[10px] text-slate-500 block mt-0.5">{t.distance}</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="flex items-center space-x-1 justify-end">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span className={`text-xs font-bold font-mono ${t.color}`}>{t.score}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 block mt-0.5">{t.disruptions} Disruptions</span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end space-x-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-emerald-600/20 transition-all"
            >
              <span>{loading ? 'Assigning...' : 'Confirm Carrier Match'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
