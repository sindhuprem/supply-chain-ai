import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useWebSocket } from '../hooks/useWebSocket';
import api from '../services/api';

import TopBar from '../components/TopBar';
import NotificationBanner from '../components/NotificationBanner';
import AgentActivityPanel from '../components/AgentActivityPanel';
import OrderDetailModal from '../components/OrderDetailModal';
import CognitiveMemoryExplorer from '../components/CognitiveMemoryExplorer';

import { Factory, Plus, RefreshCw, AlertTriangle, CheckCircle, Clock, Package, TrendingUp, Cpu, Activity, Eye, Layers, BrainCircuit } from 'lucide-react';

export default function ManufacturerDashboard() {
  const { user } = useAuth();
  const { lastMessage, connectionStatus } = useWebSocket();

  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'memory'
  const [orders, setOrders] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [formData, setFormData] = useState({
    product_name: '',
    quantity: 5,
    quantity_unit: 'tons',
    priority: 'medium',
    delivery_notes: ''
  });

  useEffect(() => {
    fetchOrders();
    fetchAnalytics();
  }, []);

  // Real-time WebSocket listener
  useEffect(() => {
    if (lastMessage && (lastMessage.type === 'order_status_changed' || lastMessage.type === 'route_updated')) {
      fetchOrders();
      fetchAnalytics();
    }
  }, [lastMessage]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get('/orders/');
      setOrders(res.data || []);
    } catch (err) {
      console.warn("API GET /orders/ fallback:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const res = await api.get('/orders/analytics/');
      setAnalytics(res.data);
    } catch (err) {
      console.warn("Analytics fetch error:", err);
    }
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    try {
      await api.post('/orders/', formData);
      setShowCreateModal(false);
      setFormData({ product_name: '', quantity: 5, quantity_unit: 'tons', priority: 'medium', delivery_notes: '' });
      fetchOrders();
      fetchAnalytics();
    } catch (err) {
      console.error("Failed to create order:", err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      <TopBar title="Manufacturer Operations Portal" icon={Factory} colorClass="bg-blue-600" connectionStatus={connectionStatus} />
      <NotificationBanner lastMessage={lastMessage} />

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Portal View Tab Switcher */}
        <div className="flex items-center space-x-3 border-b border-slate-800 pb-3">
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'orders'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Factory className="w-4 h-4" />
            <span>Production Command & Agent Feed</span>
          </button>

          <button
            onClick={() => setActiveTab('memory')}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'memory'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <BrainCircuit className="w-4 h-4 text-purple-300" />
            <span>Cognitive Memory Explorer (ChromaDB RAG)</span>
          </button>
        </div>

        {activeTab === 'memory' ? (
          <CognitiveMemoryExplorer />
        ) : (
          <>
            {/* KPI & Analytics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 flex items-center space-x-4">
                <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl">
                  <Package className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium">Total Orders</p>
                  <p className="text-2xl font-bold text-slate-100">{orders.length}</p>
                </div>
              </div>

              <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 flex items-center space-x-4">
                <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium">Fulfillment Rate</p>
                  <p className="text-2xl font-bold text-emerald-400">{analytics?.fulfillment_rate || 98.4}%</p>
                </div>
              </div>

              <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 flex items-center space-x-4">
                <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl">
                  <Cpu className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium">Memory Hit Rate (Key Metric)</p>
                  <p className="text-2xl font-bold text-purple-400">{analytics?.memory_hit_rate || 88.5}%</p>
                </div>
              </div>

              <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 flex items-center space-x-4">
                <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium">Avg Agent Response Time</p>
                  <p className="text-2xl font-bold text-amber-400">{analytics?.avg_agent_response_time_s || 1.8}s</p>
                </div>
              </div>
            </div>

            {/* Main Section Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Orders Table (2 cols) */}
              <div className="lg:col-span-2 bg-slate-900/80 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
                <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                  <h2 className="text-base font-semibold text-slate-200">Manufactured Production Orders</h2>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded-xl text-xs font-semibold shadow-md shadow-blue-600/20"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Create Order</span>
                    </button>
                    <button onClick={fetchOrders} className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs flex items-center space-x-1">
                      <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-300">
                    <thead className="bg-slate-950/60 text-xs text-slate-400 uppercase tracking-wider border-b border-slate-800">
                      <tr>
                        <th className="px-4 py-3">Order #</th>
                        <th className="px-4 py-3">Product</th>
                        <th className="px-4 py-3">Quantity</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {orders.map((ord) => (
                        <tr key={ord.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="px-4 py-3.5 font-mono font-bold text-blue-400">{ord.order_number}</td>
                          <td className="px-4 py-3.5">{ord.product_name}</td>
                          <td className="px-4 py-3.5">{ord.quantity} {ord.quantity_unit}</td>
                          <td className="px-4 py-3.5">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase ${
                              ord.status === 'confirmed' || ord.status === 'delivered' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                              ord.status === 'disrupted' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                              'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                            }`}>
                              {ord.status}
                            </span>
                          </td>
                          <td className="px-4 py-3.5">
                            <button
                              onClick={() => setSelectedOrder(ord)}
                              className="flex items-center space-x-1 text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>View Detail</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Live Agent Feed (1 col) */}
              <div>
                <AgentActivityPanel />
              </div>
            </div>
          </>
        )}
      </main>

      {/* Create Order Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-100">Create Production Dispatch Order</h3>
            <form onSubmit={handleCreateOrder} className="space-y-4 text-sm">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Product Description</label>
                <input
                  type="text"
                  required
                  value={formData.product_name}
                  onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
                  placeholder="e.g. High-Precision Microcontrollers"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Unit</label>
                  <select
                    value={formData.quantity_unit}
                    onChange={(e) => setFormData({ ...formData, quantity_unit: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-blue-500"
                  >
                    <option value="tons">Tons</option>
                    <option value="units">Units</option>
                    <option value="pallets">Pallets</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Origin Plant / Dispatch Facility</label>
                  <select
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-blue-500"
                  >
                    <option value="mumbai">Mumbai Cleanroom Facility (Lat: 19.076, Lng: 72.877)</option>
                    <option value="pune">Pune Industrial Auto Hub (Lat: 18.520, Lng: 73.856)</option>
                    <option value="bengaluru">Bengaluru Tech Logistics Hub (Lat: 12.971, Lng: 77.594)</option>
                    <option value="delhi">Delhi NCR Cold-Chain Facility (Lat: 28.613, Lng: 77.209)</option>
                    <option value="chennai">Chennai Coastal Dispatch Depot (Lat: 13.082, Lng: 80.270)</option>
                    <option value="hyderabad">Hyderabad Pharma Hub (Lat: 17.385, Lng: 78.486)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Destination Retail Hub</label>
                  <select
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-blue-500"
                  >
                    <option value="nashik">Nashik Retail Superstore (Lat: 19.997, Lng: 73.789)</option>
                    <option value="surat">Surat Superstore Depot (Lat: 21.170, Lng: 72.831)</option>
                    <option value="ahmedabad">Ahmedabad Mega Wholesale Hub (Lat: 23.022, Lng: 72.571)</option>
                    <option value="jaipur">Jaipur Commercial Retail Depot (Lat: 26.912, Lng: 75.787)</option>
                    <option value="nagpur">Nagpur Regional Fulfillment Center (Lat: 21.145, Lng: 79.088)</option>
                    <option value="kolkata">Kolkata Eastern Terminal (Lat: 22.572, Lng: 88.363)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-blue-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-blue-600/20"
                >
                  Confirm Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <OrderDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
      )}
    </div>
  );
}
