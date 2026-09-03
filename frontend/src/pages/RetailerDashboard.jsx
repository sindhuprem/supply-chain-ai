import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useWebSocket } from '../hooks/useWebSocket';
import api from '../services/api';

import TopBar from '../components/TopBar';
import NotificationBanner from '../components/NotificationBanner';

import { Store, CheckCircle, AlertOctagon, RefreshCw, Clock, Package, Eye, X, ZoomIn } from 'lucide-react';

export default function RetailerDashboard() {
  const { user } = useAuth();
  const { lastMessage, connectionStatus } = useWebSocket();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [disputeOrderId, setDisputeOrderId] = useState(null);
  const [disputeReason, setDisputeReason] = useState('');
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    fetchIncomingOrders();
  }, []);

  // Listen to WebSocket events
  useEffect(() => {
    if (lastMessage && (lastMessage.type === 'order_status_changed' || lastMessage.type === 'route_updated')) {
      fetchIncomingOrders();
    }
  }, [lastMessage]);

  const fetchIncomingOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get('/orders/incoming/');
      setOrders(res.data || []);
    } catch (err) {
      console.warn("Incoming orders API fallback:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDelivery = async (orderId) => {
    try {
      await api.post(`/orders/${orderId}/confirm/`);
      fetchIncomingOrders();
    } catch (err) {
      console.error("Confirm delivery error:", err);
    }
  };

  const handleDisputeDelivery = async (e) => {
    e.preventDefault();
    if (!disputeOrderId || !disputeReason) return;
    try {
      await api.post(`/orders/${disputeOrderId}/dispute/`, { reason: disputeReason });
      setDisputeOrderId(null);
      setDisputeReason('');
      fetchIncomingOrders();
    } catch (err) {
      console.error("Dispute error:", err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      <TopBar title="Retailer Store Fulfillment Center" icon={Store} colorClass="bg-teal-600" connectionStatus={connectionStatus} />
      <NotificationBanner lastMessage={lastMessage} />

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Stat KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-medium">Store Fulfillment Rate</p>
              <p className="text-2xl font-bold text-emerald-400 mt-1">99.1%</p>
            </div>
            <button onClick={fetchIncomingOrders} className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs flex items-center space-x-1 cursor-pointer">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800">
            <p className="text-xs text-slate-400 font-medium">Total Incoming Orders</p>
            <p className="text-2xl font-bold text-teal-400 mt-1">{orders.length}</p>
          </div>

          <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800">
            <p className="text-xs text-slate-400 font-medium">Customer Stockout Index</p>
            <p className="text-2xl font-bold text-cyan-400 mt-1">0 Stockouts</p>
          </div>
        </div>

        {/* Incoming Shipments Table */}
        <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-4 space-y-4 shadow-xl">
          <h2 className="text-base font-semibold text-slate-200">Incoming Store Replenishment Shipments</h2>
          
          <div className="space-y-3">
            {orders.map((ord) => (
              <div key={ord.id} className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-sm font-bold text-teal-400">{ord.order_number}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full uppercase font-bold ${
                      ord.status === 'confirmed' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                      ord.status === 'disputed' ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-slate-800 text-slate-300'
                    }`}>
                      {ord.status}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-slate-200 mt-1">{ord.product_name} ({ord.quantity} {ord.quantity_unit})</p>
                  <p className="text-xs text-slate-400 mt-0.5">Manufacturer: <span className="text-slate-200 font-semibold">{ord.manufacturer_name || 'Apex Electronics'}</span></p>

                  {ord.proof_of_delivery_url && (
                    <div className="mt-2.5 flex items-center space-x-3 p-2 bg-slate-900 rounded-lg border border-slate-800">
                      <div 
                        onClick={() => setPreviewImage(ord.proof_of_delivery_url)}
                        className="relative group cursor-pointer"
                      >
                        <img
                          src={ord.proof_of_delivery_url}
                          alt="Delivery Receipt Proof"
                          className="w-14 h-11 object-cover rounded border border-slate-700 shadow-sm group-hover:opacity-80 transition-all"
                          onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=300&auto=format&fit=crop'; }}
                        />
                        <div className="absolute inset-0 bg-slate-950/40 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <ZoomIn className="w-4 h-4 text-white" />
                        </div>
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold text-emerald-300 flex items-center space-x-1">
                          <CheckCircle className="w-3 h-3 text-emerald-400" />
                          <span>Driver Proof of Delivery Photo attached</span>
                        </p>
                        <button
                          type="button"
                          onClick={() => setPreviewImage(ord.proof_of_delivery_url)}
                          className="text-[11px] font-bold text-cyan-400 hover:text-cyan-300 flex items-center space-x-1 mt-0.5 cursor-pointer"
                        >
                          <Eye className="w-3 h-3" />
                          <span>View Full Photo Receipt 🔍</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  {ord.status === 'delivered' ? (
                    <>
                      <button
                        onClick={() => handleConfirmDelivery(ord.id)}
                        className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-emerald-600/20 flex items-center space-x-1 cursor-pointer"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Confirm Delivery</span>
                      </button>
                      <button
                        onClick={() => setDisputeOrderId(ord.id)}
                        className="px-3.5 py-2 bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800 rounded-xl text-xs font-semibold flex items-center space-x-1 cursor-pointer"
                      >
                        <AlertOctagon className="w-4 h-4" />
                        <span>Dispute</span>
                      </button>
                    </>
                  ) : ord.status === 'confirmed' ? (
                    <span className="text-xs text-emerald-400 font-bold flex items-center space-x-1">
                      <CheckCircle className="w-4 h-4" />
                      <span>Delivery Verified & Stock Shelved</span>
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400 font-mono">In Transit</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Fullscreen Photo Lightbox Modal */}
      {previewImage && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full p-6 shadow-2xl space-y-4 text-slate-100 relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-emerald-400 flex items-center space-x-2">
                <CheckCircle className="w-4 h-4" />
                <span>Verified Driver Proof of Delivery Photo</span>
              </h3>
              <button 
                onClick={() => setPreviewImage(null)}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center justify-center bg-slate-950 rounded-xl border border-slate-800 p-2 max-h-[70vh] overflow-hidden">
              <img
                src={previewImage}
                alt="Full Delivery Receipt"
                className="max-h-[65vh] w-auto object-contain rounded-lg shadow-2xl"
                onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&auto=format&fit=crop'; }}
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dispute Modal */}
      {disputeOrderId && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-slate-100">
            <h3 className="text-base font-bold text-rose-400">Raise Delivery Dispute</h3>
            <form onSubmit={handleDisputeDelivery} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Reason for Dispute</label>
                <textarea
                  required
                  rows="4"
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  placeholder="Describe damage, missing items, or delivery issues..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-rose-500"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDisputeOrderId(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl cursor-pointer"
                >
                  Submit Dispute
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
