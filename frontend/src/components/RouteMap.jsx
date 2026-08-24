import React, { useEffect, useRef } from 'react';
import { MapPin, Navigation, AlertOctagon, ShieldCheck } from 'lucide-react';

export default function RouteMap({ activeOrder, activeDisruption }) {
  const mapRef = useRef(null);
  const leafletMap = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    import('leaflet').then((L) => {
      if (!mapRef.current) return;

      if (!leafletMap.current) {
        // Initialize map centered around Mumbai-Pune corridor
        leafletMap.current = L.map(mapRef.current).setView([18.8000, 75.0000], 6);

        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
          maxZoom: 19,
        }).addTo(leafletMap.current);
      }

      const map = leafletMap.current;

      // Clear previous layers
      map.eachLayer((layer) => {
        if (!layer._url) {
          map.removeLayer(layer);
        }
      });

      // Default polyline coordinates
      const origCoords = [
        [19.0760, 72.8777], // Mumbai Port
        [18.5204, 73.8567], // Pune Disruption Point
        [12.9716, 77.5946]  // Bengaluru
      ];

      const detourCoords = activeDisruption?.response_payload?.route_proposal?.rerouted_polyline || [
        [19.0760, 72.8777],
        [18.9000, 73.2000],
        [17.6599, 75.9064],
        [12.9716, 77.5946]
      ];

      // Draw original polyline (dashed red/slate)
      L.polyline(origCoords, {
        color: '#ef4444',
        weight: 3,
        dashArray: '6, 8',
        opacity: 0.7
      }).addTo(map);

      // Draw rerouted polyline (glowing cyan)
      L.polyline(detourCoords, {
        color: '#06b6d4',
        weight: 5,
        opacity: 0.95
      }).addTo(map);

      // Custom Icon Builders
      const createCustomIcon = (bgColor, iconChar) => L.divIcon({
        className: 'custom-leaflet-icon',
        html: `<div style="background-color: ${bgColor}; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; border: 2px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.5);">${iconChar}</div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      // Add Origin Marker (Mumbai)
      L.marker([19.0760, 72.8777], { icon: createCustomIcon('#3b82f6', 'A') })
        .addTo(map)
        .bindPopup("<b>Origin Warehouse</b><br/>Mumbai Port Logistics Hub");

      // Add Destination Marker (Bengaluru)
      L.marker([12.9716, 77.5946], { icon: createCustomIcon('#10b981', 'B') })
        .addTo(map)
        .bindPopup("<b>Destination Depot</b><br/>Bengaluru Distribution Center");

      // Add Disruption Roadblock Marker (Pune)
      const roadBlockIcon = L.divIcon({
        className: 'disruption-icon',
        html: `<div style="background: #dc2626; width: 34px; height: 34px; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; border: 2px solid white; box-shadow: 0 0 16px rgba(220,38,38,0.8); animate: pulse 2s infinite;">⛔</div>`,
        iconSize: [34, 34],
        iconAnchor: [17, 17]
      });

      L.marker([18.5204, 73.8567], { icon: roadBlockIcon })
        .addTo(map)
        .bindPopup("<b>Disruption Alert</b><br/>NH-44 Road Blockade & Vehicle Breakdown");

      // Adjust map bounds
      map.fitBounds(L.polyline(detourCoords).getBounds(), { padding: [40, 40] });
    });
  }, [activeOrder, activeDisruption]);

  return (
    <div className="glass-panel rounded-2xl p-4 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col h-full min-h-[420px]">
      {/* Map Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center space-x-2">
          <Navigation className="w-5 h-5 text-cyan-400" />
          <h2 className="text-sm font-semibold text-white">Live Geospatial Spatial Rerouting Engine</h2>
        </div>
        <div className="flex items-center space-x-3 text-xs">
          <span className="flex items-center space-x-1.5 text-rose-400">
            <span className="w-2.5 h-0.5 bg-rose-500 inline-block border-b border-dashed"></span>
            <span>Blocked Route</span>
          </span>
          <span className="flex items-center space-x-1.5 text-cyan-400 font-medium">
            <span className="w-3 h-1 bg-cyan-400 inline-block rounded-full"></span>
            <span>Validated Detour Path</span>
          </span>
        </div>
      </div>

      {/* Leaflet Map Div */}
      <div ref={mapRef} className="w-full flex-1 rounded-xl overflow-hidden border border-slate-800 shadow-inner min-h-[340px]" />
    </div>
  );
}
