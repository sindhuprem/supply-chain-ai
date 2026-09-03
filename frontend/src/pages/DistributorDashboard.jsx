import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useWebSocket } from '../hooks/useWebSocket';
import api from '../services/api';

import TopBar from '../components/TopBar';
import NotificationBanner from '../components/NotificationBanner';
import AssignTransporterModal from '../components/AssignTransporterModal';

import { Building2, Truck, RefreshCw, CheckCircle, ArrowRight, UserCheck, Eye } from 'lucide-react';

export default function DistributorDashboard() {
  const { user } = useAuth();
  const { lastMessage, connectionStatus } = useWebSocket();

  const [pendingOrders, setPendingOrders] = useState([]);
  const [activeOrders, setActiveOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrderForAssign, setSelectedOrderForAssign] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  // Listen for real-time WebSocket events
  useEffect(() => {
    if (lastMessage && (lastMessage.type === 'order_status_changed' || lastMessage.type === 'route_updated')) {
      fetchOrders();
    }
  }, [lastMessage]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const [pendingRes, activeRes] = await Promise.all([
        api.get('/orders/pending/'),
        api.get('/orders/active/')
      ]);
      setPendingOrders(pendingRes.data || []);
      setActiveOrders(activeRes.data || []);
    } catch (err) {
      console.warn("API GET /orders/ pending/active fallback:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignTransporter = async (orderId, transporterId) => {
    try {
      await api.post(`/orders/${orderId}/assign-transporter/`, { transporter_id: transporterId });
      setSelectedOrderForAssign(null);
      fetchOrders();
    } catch (err) {
      console.error("Assign transporter error:", err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      <TopBar title="Distributor Hub & Fleet Allocator" icon={Building2} colorClass="bg-emerald-600" connectionStatus={connectionStatus} />
      <NotificationBanner lastMessage={lastMessage} />

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-medium">Pending Assignments</p>
              <p className="text-2xl font-bold text-amber-400 mt-1">{pendingOrders.length}</p>
            </div>
            <button onClick={fetchOrders} className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs flex items-center space-x-1">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Sync</span>
            </button>
          </div>

          <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800">
            <p className="text-xs text-slate-400 font-medium">Available Transporter Fleets</p>
            <p className="text-2xl font-bold text-emerald-400 mt-1">14 Vehicles Active</p>
          </div>

          <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800">
            <p className="text-xs text-slate-400 font-medium">Active In-Transit Deliveries</p>
            <p className="text-2xl font-bold text-blue-400 mt-1">{activeOrders.length}</p>
          </div>
        </div>

        {/* Incoming Pending Assignments */}
        <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-4 space-y-4 shadow-xl">
          <h2 className="text-base font-semibold text-slate-200">Incoming Orders & Carrier Allocation</h2>
          
          <div className="space-y-3">
            {pendingOrders.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">No pending orders awaiting carrier assignment.</p>
            ) : (
              pendingOrders.map((ord) => (
                <div key={ord.id} className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-sm font-bold text-emerald-400">{ord.order_number}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 uppercase">{ord.status}</span>
                    </div>
                    <p className="text-sm font-medium text-slate-200 mt-1">{ord.product_name} ({ord.quantity} {ord.quantity_unit})</p>
                    <p className="text-xs text-slate-400 mt-0.5">Assigned Carrier: <span className="text-slate-200 font-semibold">{ord.transporter_name || 'Unassigned'}</span></p>
                  </div>

                  {ord.status === 'created' ? (
                    <button
                      onClick={() => setSelectedOrderForAssign(ord)}
                      className="flex items-center space-x-1 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-emerald-600/20"
                    >
                      <span>Assign Carrier</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <span className="flex items-center space-x-1 text-xs text-emerald-400 font-semibold">
                      <CheckCircle className="w-4 h-4" />
                      <span>Carrier Linked</span>
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Active In-Transit Deliveries */}
        <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-4 space-y-4 shadow-xl">
          <h2 className="text-base font-semibold text-slate-200">Active Deliveries Monitoring</h2>
          <div className="space-y-3">
            {activeOrders.map((ord) => (
              <div key={ord.id} className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-sm font-bold text-cyan-400">{ord.order_number}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 uppercase font-semibold">{ord.status}</span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1">{ord.product_name} • Carrier: <span className="text-slate-100 font-bold">{ord.transporter_name || 'Swift Fleet'}</span></p>
                </div>
                <span className="text-xs text-slate-400 font-mono">Disruptions: {ord.disruption_count || 0}</span>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Assign Transporter Modal */}
      {selectedOrderForAssign && (
        <AssignTransporterModal
          order={selectedOrderForAssign}
          onAssign={handleAssignTransporter}
          onClose={() => setSelectedOrderForAssign(null)}
        />
      )}
    </div>
  );
}
