import React from 'react';
import { Package, Truck, Clock, ShieldCheck, AlertOctagon, ArrowUpRight, CheckCircle2, Factory, Store, Warehouse, Activity, Zap, TrendingUp, BarChart3 } from 'lucide-react';

export default function RoleDashboard({ role, orders, activeDisruption }) {
  const getRoleConfig = () => {
    switch (role) {
      case 'MANUFACTURER':
        return {
          title: 'Manufacturer Production & Dispatch Command',
          subtitle: 'Apex Electronics Plant #4 • Manufacturing & Factory Outbound',
          icon: Factory,
          color: 'from-blue-600 to-cyan-600',
          kpis: [
            { label: 'Plant Production Rate', value: '98.4%', sub: 'Target: 95%', color: 'text-cyan-400' },
            { label: 'Outbound Microcontrollers', value: '12 Tons', sub: 'ORD-2026-8801', color: 'text-blue-400' },
            { label: 'Factory Outbound SLA', value: '100% On-Time', sub: 'Zero Bottlenecks', color: 'text-emerald-400' },
            { label: 'Supply Chain Resiliency', value: 'OPTIMAL', sub: 'AI Rerouted via Bypass', color: 'text-purple-400' },
          ],
          roleOrders: [
            {
              id: 'ORD-2026-8801',
              title: 'Automotive Microcontrollers (12 Tons)',
              stage: 'Outbound Dispatch • Disruption Rerouted',
              origin: 'Apex Plant #4 (Mumbai)',
              dest: 'Bengaluru Distribution',
              transporter: 'Vanguard Logistics',
              status: 'REROUTED & VALIDATED',
              impact: 'ETA +22m (Bypass 4B Active)'
            },
            {
              id: 'ORD-2026-8803',
              title: 'Semiconductor Wafer Batch #409',
              stage: 'Production Line #2 Packaging',
              origin: 'Apex Cleanroom (Pune)',
              dest: 'Hyderabad Assembly Depot',
              transporter: 'Express Tech Logistics',
              status: 'IN PRODUCTION',
              impact: 'On Schedule (Dispatch 14:00)'
            }
          ]
        };
      case 'DISTRIBUTOR':
        return {
          title: 'Distributor Regional Logistics Hub',
          subtitle: 'Metro Regional Fulfillment • Cross-Docking & Distribution Center',
          icon: Warehouse,
          color: 'from-purple-600 to-indigo-600',
          kpis: [
            { label: 'Warehouse Storage Capacity', value: '74.2%', sub: '2,400 m³ Available', color: 'text-purple-400' },
            { label: 'Cross-Docking Velocity', value: '45 mins', sub: 'Avg Processing Time', color: 'text-indigo-400' },
            { label: 'Inventory Buffer Reserve', value: '96.8%', sub: 'High Buffer Stock', color: 'text-emerald-400' },
            { label: 'Inbound Disruption Risk', value: 'MITIGATED', sub: 'Alternate Warehouse Assigned', color: 'text-cyan-400' },
          ],
          roleOrders: [
            {
              id: 'ORD-2026-8801',
              title: 'Automotive Microcontrollers (12 Tons)',
              stage: 'Inbound Cross-Dock Allocation',
              origin: 'Mumbai Port Center',
              dest: 'Bengaluru Regional Hub',
              transporter: 'Vanguard Logistics Hub',
              status: 'REROUTED & VALIDATED',
              impact: 'Warehouse Bay 4 Bypassed'
            },
            {
              id: 'ORD-2026-8804',
              title: 'Industrial Lithium Power Cells (8 Tons)',
              stage: 'Inventory Sorting & Palletizing',
              origin: 'Nagpur Logistics Depot',
              dest: 'Chennai Manufacturing Hub',
              transporter: 'Metro Heavy Freight',
              status: 'STOCK READY',
              impact: 'Stock Allocated to Priority Order'
            }
          ]
        };
      case 'TRANSPORTER':
        return {
          title: 'Transporter Fleet Control & Dispatch',
          subtitle: 'Vanguard Express Fleet • GPS Telematics & Route Optimization',
          icon: Truck,
          color: 'from-amber-600 to-orange-600',
          kpis: [
            { label: 'Active Fleet Vehicles', value: '42 / 45', sub: '93% Fleet Active', color: 'text-amber-400' },
            { label: 'Active Detour Navigation', value: 'NH-44 Bypass', sub: '+16.4 km Detour', color: 'text-orange-400' },
            { label: 'Transporter Reliability Score', value: '96%', sub: 'Assigned by AI Critic', color: 'text-emerald-400' },
            { label: 'Driver Safety & Fuel Index', value: '94.1%', sub: 'Fuel Consumption Optimized', color: 'text-cyan-400' },
          ],
          roleOrders: [
            {
              id: 'ORD-2026-8801',
              title: 'Automotive Microcontrollers (12 Tons)',
              stage: 'In Transit • GPS Telematics Active',
              origin: 'NH-44 Junction (Pune Expressway)',
              dest: 'Bengaluru Gateway',
              transporter: 'Truck #VH-902 (Vanguard)',
              status: 'NAVIGATING DETOUR',
              impact: 'Speed 62 km/h • Detour via Bypass 4B'
            },
            {
              id: 'ORD-2026-8802',
              title: 'Cold-Chain Vaccines (4 Tons)',
              stage: 'Refrigerated Transport In-Transit',
              origin: 'Pune Bio-Depot',
              dest: 'Hyderabad Gateway',
              transporter: 'Reefer Truck #RF-104',
              status: 'IN TRANSIT',
              impact: 'Temp: -20°C (Stable)'
            }
          ]
        };
      case 'RETAILER':
        return {
          title: 'Retailer Store Fulfillment Center',
          subtitle: 'CityMart Superstore Network • Store Stock & Customer SLA',
          icon: Store,
          color: 'from-emerald-600 to-teal-600',
          kpis: [
            { label: 'Store Shelf Fulfillment SLA', value: '99.1%', sub: 'Customer SLA Preserved', color: 'text-emerald-400' },
            { label: 'Stockout Prevention Index', value: '0 Stockouts', sub: 'Mitigated by AI Agent', color: 'text-teal-400' },
            { label: 'Estimated Inbound Delivery', value: '+22 mins', sub: 'Buffer Window Absorbed', color: 'text-cyan-400' },
            { label: 'Consumer Order SLA Risk', value: 'LOW RISK', sub: 'No Stock Outage Expected', color: 'text-blue-400' },
          ],
          roleOrders: [
            {
              id: 'ORD-2026-8801',
              title: 'Automotive Microcontrollers (12 Tons)',
              stage: 'Inbound Store Replenishment',
              origin: 'Bengaluru Distribution Center',
              dest: 'CityMart Superstore #12',
              transporter: 'Vanguard Express Logistics',
              status: 'DISPATCH CONFIRMED',
              impact: 'No Customer Order Delay'
            },
            {
              id: 'ORD-2026-8805',
              title: 'Consumer Electronics Batch #99',
              stage: 'Store Inventory Staging',
              origin: 'Chennai Logistics Hub',
              dest: 'CityMart Retail Outlet #4',
              transporter: 'Local Swift Parcel',
              status: 'DELIVERED',
              impact: 'Stock Shelved & Ready'
            }
          ]
        };
      default:
        return {
          title: 'Supply Chain Operations Dashboard',
          subtitle: 'Multi-Role Overview',
          icon: Package,
          color: 'from-cyan-600 to-blue-600',
          kpis: [],
          roleOrders: []
        };
    }
  };

  const config = getRoleConfig();
  const HeaderIcon = config.icon;

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Role Banner */}
      <div className="glass-panel rounded-2xl p-4 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className={`p-3 rounded-xl bg-gradient-to-r ${config.color} text-white shadow-lg shadow-cyan-500/10`}>
            <HeaderIcon className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold text-white tracking-tight">{config.title}</h2>
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-slate-800 text-slate-300 rounded-md border border-slate-700">
                Role View: {role}
              </span>
            </div>
            <p className="text-xs text-slate-400">{config.subtitle}</p>
          </div>
        </div>
      </div>

      {/* Role-Specific KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {config.kpis.map((kpi, idx) => (
          <div key={idx} className="glass-card rounded-xl p-3 border border-slate-800/80 bg-slate-900/60">
            <span className="text-[10px] text-slate-400 font-medium block uppercase tracking-wider">{kpi.label}</span>
            <div className={`text-base font-bold ${kpi.color} mt-0.5 font-mono`}>{kpi.value}</div>
            <span className="text-[10px] text-slate-500 block mt-0.5">{kpi.sub}</span>
          </div>
        ))}
      </div>

      {/* Role-Specific Orders & Shipments */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {config.roleOrders.map((ord, idx) => {
          const isDisrupted = ord.status.includes('REROUTED') || ord.status.includes('DETOUR');
          return (
            <div key={ord.id} className="glass-card rounded-2xl p-4 border border-slate-800/90 hover:border-cyan-500/40 transition-all duration-300 space-y-3 shadow-md">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase">{ord.id}</span>
                  <h3 className="text-sm font-bold text-white mt-0.5">{ord.title}</h3>
                  <p className="text-xs text-slate-400 font-medium">{ord.stage}</p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide border ${
                  isDisrupted
                    ? 'bg-cyan-950/90 text-cyan-300 border-cyan-700 shadow-sm shadow-cyan-500/20'
                    : 'bg-emerald-950/90 text-emerald-300 border-emerald-800'
                }`}>
                  {ord.status}
                </span>
              </div>

              {/* Transit Details */}
              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-500 font-semibold block uppercase tracking-wider">Origin Facility</span>
                  <span className="text-slate-200 font-medium text-[11px]">{ord.origin}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-semibold block uppercase tracking-wider">Destination Facility</span>
                  <span className="text-slate-200 font-medium text-[11px]">{ord.dest}</span>
                </div>
              </div>

              {/* Transporter & Live Status */}
              <div className="flex items-center justify-between pt-1 text-xs">
                <div className="flex items-center space-x-2">
                  <Truck className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-300 font-medium">{ord.transporter}</span>
                </div>
                <div className="flex items-center space-x-1.5 text-cyan-400 font-mono font-semibold text-[11px]">
                  <Clock className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{ord.impact}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
