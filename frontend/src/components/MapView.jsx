'use client';
import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Map, Navigation, Layers, ZoomIn } from 'lucide-react';

const MapContainer = dynamic(() => import('react-leaflet').then(m => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(m => m.TileLayer), { ssr: false });
const CircleMarker = dynamic(() => import('react-leaflet').then(m => m.CircleMarker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(m => m.Popup), { ssr: false });
const Polyline = dynamic(() => import('react-leaflet').then(m => m.Polyline), { ssr: false });

const TILE_LAYERS = {
  dark: { url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', attr: '© CARTO' },
  light: { url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', attr: '© CARTO' },
  satellite: { url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', attr: '© Esri' },
};

function getMarkerColor(lastSeen) {
  if (!lastSeen) return '#6b7280';
  const days = (Date.now() - new Date(lastSeen).getTime()) / 86400000;
  if (days < 1) return '#10b981';
  if (days < 7) return '#f59e0b';
  return '#f43f5e';
}

export default function MapView({ mapPoints }) {
  const [mounted, setMounted] = useState(false);
  const [liveFloats, setLiveFloats] = useState([]);
  const [tileLayer, setTileLayer] = useState('dark');
  const [showLayerControl, setShowLayerControl] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const fetchFloats = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/v1/live/floats');
        if (res.ok) setLiveFloats(await res.json());
      } catch {}
    };
    if (mounted) {
      fetchFloats();
      const interval = setInterval(fetchFloats, 60000);
      return () => clearInterval(interval);
    }
  }, [mounted]);

  if (!mounted) {
    return (
      <div className="glass-card h-64 flex items-center justify-center text-cyan-300/60 text-sm">
        <div className="text-center space-y-2">
          <Map className="w-8 h-8 text-cyan-500/40 mx-auto" />
          <p>Loading Spatial Engine...</p>
        </div>
      </div>
    );
  }

  const displayPoints = mapPoints?.length ? mapPoints : liveFloats;
  const defaultCenter = [12.0, 75.0];

  return (
    <div className="glass-card overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
        <div className="flex items-center space-x-2">
          <Navigation className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-semibold text-cyan-100">ARGO Float Positions</h3>
          <span className={`text-[10px] px-2 py-0.5 rounded-full border font-mono ${liveFloats.length > 0 ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>
            {liveFloats.length > 0 ? '🔴 LIVE' : 'CACHED'}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs font-mono bg-white/5 px-2 py-1 rounded text-cyan-300">{displayPoints?.length || 0} floats</span>
          <div className="relative">
            <button onClick={() => setShowLayerControl(!showLayerControl)}
              className="p-1.5 text-slate-500 hover:text-cyan-400 transition-colors rounded-lg hover:bg-white/5">
              <Layers className="w-4 h-4" />
            </button>
            {showLayerControl && (
              <div className="absolute right-0 top-8 bg-[#0a1628] border border-white/10 rounded-lg shadow-2xl z-50 p-2 min-w-[120px]">
                {Object.entries(TILE_LAYERS).map(([key]) => (
                  <button key={key} onClick={() => { setTileLayer(key); setShowLayerControl(false); }}
                    className={`w-full text-left text-xs px-3 py-2 rounded capitalize transition-colors ${tileLayer === key ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
                    {key}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="h-64 relative">
        <MapContainer center={defaultCenter} zoom={4} scrollWheelZoom style={{ height: '100%', width: '100%' }}>
          <TileLayer url={TILE_LAYERS[tileLayer].url} attribution={TILE_LAYERS[tileLayer].attr} />
          {displayPoints?.map((pt, idx) => (
            <CircleMarker key={`${pt.wmo_id}-${idx}`}
              center={[pt.lat, pt.lon]} radius={7}
              pathOptions={{ fillColor: getMarkerColor(pt.last_seen), fillOpacity: 0.9, color: '#fff', weight: 1.5 }}>
              <Popup>
                <div className="text-xs font-sans p-1 space-y-1 min-w-[140px]">
                  <p className="font-bold text-slate-800">WMO: {pt.wmo_id}</p>
                  <p className="text-slate-600">{pt.region || pt.location || 'Indian Ocean'}</p>
                  <p className="text-slate-600">Last seen: {pt.last_seen || 'Unknown'}</p>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${pt.data_source === 'LIVE_GDAC' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                    {pt.data_source || 'CACHED'}
                  </span>
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>

        {/* Legend */}
        <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur rounded-lg px-3 py-2 z-[1000] text-[10px] space-y-1">
          <div className="flex items-center space-x-1.5"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500" /><span className="text-slate-300">&lt; 1 day</span></div>
          <div className="flex items-center space-x-1.5"><div className="w-2.5 h-2.5 rounded-full bg-amber-500" /><span className="text-slate-300">1–7 days</span></div>
          <div className="flex items-center space-x-1.5"><div className="w-2.5 h-2.5 rounded-full bg-rose-500" /><span className="text-slate-300">&gt; 7 days</span></div>
        </div>
      </div>
    </div>
  );
}
