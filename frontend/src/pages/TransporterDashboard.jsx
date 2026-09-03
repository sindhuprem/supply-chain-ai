import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useWebSocket } from '../hooks/useWebSocket';
import api from '../services/api';

import TopBar from '../components/TopBar';
import NotificationBanner from '../components/NotificationBanner';
import DisruptionResolverModal from '../components/DisruptionResolverModal';

import { Truck, AlertTriangle, CheckCircle, MapPin, RefreshCw, Upload, Navigation, ShieldAlert, ArrowUpRight, Cpu, Image, Lock } from 'lucide-react';

export default function TransporterDashboard() {
  const { user } = useAuth();
  const { lastMessage, connectionStatus } = useWebSocket();

  const [activeOrder, setActiveOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [showDisruptionModal, setShowDisruptionModal] = useState(false);
  const [showResolverModal, setShowResolverModal] = useState(false);
  const [proofUrl, setProofUrl] = useState('');

  const [disruptionData, setDisruptionData] = useState({
    disruption_type: 'road_block',
    severity: 'high',
    description: 'Highway blockade due to landslide. Detour required.',
  });

  useEffect(() => {
    fetchMyDelivery();
  }, []);

  // Listen to WebSocket events
  useEffect(() => {
    if (lastMessage && (lastMessage.type === 'order_status_changed' || lastMessage.type === 'route_updated')) {
      fetchMyDelivery();
    }
  }, [lastMessage]);

  const fetchMyDelivery = async () => {
    setLoading(true);
    try {
      const res = await api.get('/orders/my-delivery/');
      setActiveOrder(res.data);
      if (res.data?.proof_of_delivery_url) {
        setProofUrl(res.data.proof_of_delivery_url);
      }
    } catch (err) {
      console.warn("My delivery API fallback:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus, waypointId = null) => {
    if (!activeOrder) return;
    try {
      await api.patch(`/orders/${activeOrder.id}/update-status/`, {
        status: newStatus,
        waypoint_id: (waypointId && waypointId.length > 5) ? waypointId : null
      });
      fetchMyDelivery();
    } catch (err) {
      console.error("Status update error:", err);
    }
  };

  const handleReportDisruption = async (e) => {
    e.preventDefault();
    if (!activeOrder) {
      alert("No active delivery available to report disruption on.");
      return;
    }
    setReporting(true);
    try {
      const res = await api.post(`/orders/${activeOrder.id}/report-disruption/`, disruptionData);
      setShowDisruptionModal(false);
      setShowResolverModal(true);
      if (res.data?.order) {
        setActiveOrder(res.data.order);
      }
      fetchMyDelivery();
    } catch (err) {
      console.error("Report disruption error:", err);
      alert("Failed to report disruption: " + (err.response?.data?.message || err.message));
    } finally {
      setReporting(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProofUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadProof = async (e) => {
    e.preventDefault();
    if (!activeOrder) return;
    if (!allWaypointsReached) {
      alert("Please mark all route waypoints as REACHED before uploading proof of delivery.");
      return;
    }
    const targetUrl = proofUrl.trim() || 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&auto=format&fit=crop';
    try {
      await api.patch(`/orders/${activeOrder.id}/upload-proof/`, { proof_url: targetUrl });
      alert("Proof of delivery uploaded successfully!");
      setProofUrl('');
      fetchMyDelivery();
    } catch (err) {
      console.error("Upload proof error:", err);
      alert("Error uploading proof: " + (err.response?.data?.message || err.message));
    }
  };

  const activeWaypoints = (activeOrder && activeOrder.routes)
    ? (activeOrder.routes.find(r => r.is_active)?.waypoints?.length > 0
        ? activeOrder.routes.find(r => r.is_active).waypoints
        : (activeOrder.routes[0]?.waypoints?.length > 0 ? activeOrder.routes[0].waypoints : null))
    : null;

  const waypointsList = activeWaypoints || [
    { id: '1', sequence_number: 1, location_name: 'Mumbai Dispatch Cleanroom', status: 'reached' },
    { id: '2', sequence_number: 2, location_name: 'Pune Regional Logistics Hub', status: 'pending' },
    { id: '3', sequence_number: 3, location_name: 'Nashik Store Fulfillment Depot', status: 'pending' }
  ];

  const allWaypointsReached = waypointsList.length > 0 && waypointsList.every(wp => wp.status === 'reached');
  const hasProof = Boolean(activeOrder?.proof_of_delivery_url);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      <TopBar title="Transporter Fleet Control & Telematics" icon={Truck} colorClass="bg-amber-600" connectionStatus={connectionStatus} />
      <NotificationBanner lastMessage={lastMessage} />

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Disruption Alert Action Banner */}
        <div className="p-4 bg-gradient-to-r from-amber-950/80 via-slate-900 to-orange-950/80 rounded-2xl border border-amber-800/80 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-amber-200">AI Multi-Agent Rerouting Active</h2>
              <p className="text-xs text-amber-300/80">Report any route obstacles directly to trigger autonomous multi-agent rerouting.</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {activeOrder?.status === 'rerouted' && (
              <button
                onClick={() => setShowResolverModal(true)}
                className="flex items-center space-x-1.5 px-3.5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-purple-600/30 transition-all cursor-pointer"
              >
                <Cpu className="w-4 h-4" />
                <span>View AI Reroute Plan</span>
              </button>
            )}

            <button
              disabled={!activeOrder || ['delivered', 'confirmed'].includes(activeOrder.status)}
              onClick={() => setShowDisruptionModal(true)}
              className={`flex items-center space-x-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeOrder && !['delivered', 'confirmed'].includes(activeOrder.status)
                  ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30 cursor-pointer'
                  : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-50'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
              <span>
                {activeOrder && ['delivered', 'confirmed'].includes(activeOrder.status)
                  ? 'Disruption Reporting Inactive'
                  : 'Report Disruption'}
              </span>
            </button>
          </div>
        </div>

        {/* Active Order & Telematics */}
        {activeOrder ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Order Card & Status Actions (2 cols) */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-6 space-y-4 shadow-xl">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-xs font-bold text-cyan-400 uppercase">{activeOrder.order_number}</span>
                    <h2 className="text-lg font-bold text-white mt-1">{activeOrder.product_name}</h2>
                    <p className="text-xs text-slate-400">{activeOrder.quantity} {activeOrder.quantity_unit} • Priority: <span className="text-amber-400 font-bold uppercase">{activeOrder.priority}</span></p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                    activeOrder.status === 'disrupted' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                    activeOrder.status === 'rerouted' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                    'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}>
                    {activeOrder.status}
                  </span>
                </div>

                {/* Progress Workflow Buttons */}
                <div className="grid grid-cols-3 gap-3 pt-2">
                  <button
                    onClick={() => handleStatusUpdate('picked_up')}
                    className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-600/20 cursor-pointer"
                  >
                    Mark Picked Up
                  </button>
                  <button
                    onClick={() => handleStatusUpdate('in_transit')}
                    className="px-3 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-purple-600/20 cursor-pointer"
                  >
                    In Transit
                  </button>
                  <button
                    disabled={!hasProof || !allWaypointsReached}
                    onClick={() => handleStatusUpdate('delivered')}
                    title={!hasProof ? "Please upload proof of delivery photo first" : "Mark shipment as delivered"}
                    className={`px-3 py-2 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center space-x-1 ${
                      hasProof && allWaypointsReached
                        ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20 cursor-pointer'
                        : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-60'
                    }`}
                  >
                    {(!hasProof || !allWaypointsReached) && <Lock className="w-3 h-3 mr-1" />}
                    <span>{hasProof ? 'Mark Delivered' : 'Mark Delivered (Proof Required)'}</span>
                  </button>
                </div>

                {/* Proof of Delivery Upload Section */}
                <div className="pt-4 border-t border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                      <Image className="w-4 h-4 text-emerald-400" />
                      <span>Proof of Delivery (Photo Receipt)</span>
                    </span>
                    {activeOrder.proof_of_delivery_url ? (
                      <span className="text-[11px] font-bold text-emerald-400 flex items-center space-x-1 bg-emerald-950 px-2 py-0.5 rounded-md border border-emerald-800">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Proof Saved</span>
                      </span>
                    ) : !allWaypointsReached ? (
                      <span className="text-[11px] font-bold text-amber-400 flex items-center space-x-1 bg-amber-950/80 px-2 py-0.5 rounded-md border border-amber-800">
                        <Lock className="w-3 h-3" />
                        <span>Locked (Reach all waypoints first)</span>
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold text-cyan-400 flex items-center space-x-1 bg-cyan-950 px-2 py-0.5 rounded-md border border-cyan-800">
                        <span>Ready to Upload</span>
                      </span>
                    )}
                  </div>

                  <form onSubmit={handleUploadProof} className="space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <label className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                        allWaypointsReached
                          ? 'bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 cursor-pointer'
                          : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-50'
                      }`}>
                        <Upload className="w-3.5 h-3.5" />
                        <span>Choose Photo File</span>
                        <input
                          type="file"
                          accept="image/*"
                          disabled={!allWaypointsReached}
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </label>
                      <span className="text-xs text-slate-500 font-medium">OR</span>
                      <input
                        type="text"
                        disabled={!allWaypointsReached}
                        value={proofUrl}
                        onChange={(e) => setProofUrl(e.target.value)}
                        placeholder={allWaypointsReached ? "Paste image URL..." : "Locked until all waypoints reached"}
                        className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                      <button
                        type="submit"
                        disabled={!allWaypointsReached}
                        className={`px-4 py-2 text-white rounded-xl text-xs font-bold shadow-lg flex items-center space-x-1.5 ${
                          allWaypointsReached
                            ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20 cursor-pointer'
                            : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-50'
                        }`}
                      >
                        <Upload className="w-3.5 h-3.5 text-white" />
                        <span>Upload Proof</span>
                      </button>
                    </div>

                    {/* Image Preview Box */}
                    {(proofUrl || activeOrder.proof_of_delivery_url) && (
                      <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center space-x-3">
                        <img
                          src={proofUrl || activeOrder.proof_of_delivery_url}
                          alt="Delivery Proof Receipt"
                          className="w-16 h-12 object-cover rounded-lg border border-slate-700 shadow-md"
                          onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=300&auto=format&fit=crop'; }}
                        />
                        <div className="overflow-hidden">
                          <p className="text-xs font-semibold text-slate-200">Active Delivery Receipt Preview</p>
                          <p className="text-[10px] text-slate-400 truncate max-w-sm">{proofUrl || activeOrder.proof_of_delivery_url}</p>
                        </div>
                      </div>
                    )}
                  </form>
                </div>
              </div>

              {/* Waypoints List */}
              <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-4 space-y-3 shadow-xl">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
                    <Navigation className="w-4 h-4 text-amber-400" />
                    <span>Assigned Waypoints & Telematics Sequence</span>
                  </h3>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {waypointsList.filter(wp => wp.status === 'reached').length}/{waypointsList.length} Reached
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Sequential highway checkpoints calculated by AI Route Executor. Mark each stop as reached as your truck arrives.
                </p>

                <div className="space-y-2 pt-1">
                  {waypointsList.map((wp) => (
                    <div key={wp.id} className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-3">
                        <span className="w-6 h-6 rounded-full bg-amber-950 text-amber-400 border border-amber-700 flex items-center justify-center font-mono font-bold text-xs">
                          {wp.sequence_number}
                        </span>
                        <span className="font-semibold text-slate-200">{wp.location_name}</span>
                      </div>
                      <button
                        onClick={() => handleStatusUpdate(activeOrder.status, wp.id)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer ${
                          wp.status === 'reached' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-slate-800 text-slate-300 hover:bg-amber-600 hover:text-white'
                        }`}
                      >
                        {wp.status === 'reached' ? 'Reached' : 'Mark Reached'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Simulated Live Route Map View (1 col) */}
            <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-4 space-y-3 shadow-xl">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-cyan-400" />
                <span>Live Route Telematics Map</span>
              </h3>
              <div className="w-full h-80 bg-slate-950 rounded-xl border border-slate-800 relative overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]" />
                <div className="z-10 text-center space-y-2 p-4">
                  <Truck className="w-10 h-10 text-cyan-400 mx-auto animate-bounce" />
                  <p className="text-xs font-bold text-slate-200 font-mono">GPS Telematics Active: NH-48 Expressway</p>
                  <p className="text-[11px] text-slate-400">Lat: 18.5204 • Lng: 73.8567 • Speed: 62 km/h</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-12 text-center bg-slate-900/80 rounded-2xl border border-slate-800">
            <Truck className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-300">No active delivery assigned to your transporter fleet.</p>
          </div>
        )}
      </main>

      {/* Report Disruption Modal */}
      {showDisruptionModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-slate-100">
            <h3 className="text-base font-bold text-rose-400 flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5" />
              <span>Report Traffic Disruption</span>
            </h3>
            <form onSubmit={handleReportDisruption} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Disruption Type</label>
                <select
                  value={disruptionData.disruption_type}
                  onChange={(e) => setDisruptionData({ ...disruptionData, disruption_type: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-rose-500"
                >
                  <option value="road_block">Road Blockade / Landslide</option>
                  <option value="vehicle_breakdown">Vehicle Breakdown</option>
                  <option value="accident">Accident / Collision</option>
                  <option value="weather">Severe Weather Condition</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Severity Level</label>
                <select
                  value={disruptionData.severity}
                  onChange={(e) => setDisruptionData({ ...disruptionData, severity: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-rose-500"
                >
                  <option value="low">Low Impact</option>
                  <option value="medium">Medium Detour Needed</option>
                  <option value="high">High SLA Impact (Immediate Reroute)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Detailed Description</label>
                <textarea
                  rows="3"
                  value={disruptionData.description}
                  onChange={(e) => setDisruptionData({ ...disruptionData, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDisruptionModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reporting}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl shadow-lg shadow-rose-600/30 cursor-pointer disabled:opacity-50"
                >
                  {reporting ? 'Agents Executing...' : 'Submit & Trigger Agents'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Disruption Resolver Modal */}
      {showResolverModal && (
        <DisruptionResolverModal order={activeOrder} onClose={() => setShowResolverModal(false)} />
      )}
    </div>
  );
}
