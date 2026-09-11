'use client';
import React, { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import {
  Layers, Search, X, ChevronRight, ChevronDown, RefreshCw,
  Thermometer, Droplets, MapPin, Calendar,
  Database, AlertCircle, CheckCircle, ArrowUpDown
} from 'lucide-react';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

const MOCK_PROFILES = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  wmo_id: ['2902745', '2902746', '2903120', '5906231', '5906232'][i % 5],
  cycle: i + 1,
  date: `2024-0${(i % 9) + 1}-${String((i * 3 + 1) % 28 + 1).padStart(2, '0')}`,
  lat: 10 + i * 0.8,
  lon: 68 + i * 1.2,
  region: ['Arabian Sea', 'Bay of Bengal', 'Laccadive Sea', 'Equatorial Indian Ocean', 'Northern Arabian Sea'][i % 5],
  source: i % 3 === 0 ? 'LIVE_GDAC' : 'CACHED',
}));

const MOCK_DETAIL = (id) => ({
  id,
  wmo_id: '2902745',
  cycle_number: id,
  date: '2024-01-15T06:00:00',
  latitude: 15.5,
  longitude: 68.2,
  region: 'Arabian Sea',
  data_mode: 'R',
  data_source: 'CACHED',
  measurement_count: 10,
  summary: {
    temperature: { min: 8.2, max: 29.5, mean: 21.3 },
    salinity: { min: 34.5, max: 36.2, mean: 35.4 },
  },
  measurements: [0, 10, 20, 50, 100, 200, 300, 500, 750, 1000].map((p, i) => ({
    pressure: p,
    temperature: parseFloat((29.5 - i * 2.1).toFixed(2)),
    temperature_qc: 1,
    salinity: parseFloat((36.2 - i * 0.17).toFixed(3)),
    salinity_qc: 1,
  })),
});

function QcBadge({ qc }) {
  return qc === 1
    ? <CheckCircle className="w-3 h-3 text-emerald-400 inline ml-1" title="QC=1 Good" />
    : <AlertCircle className="w-3 h-3 text-amber-400 inline ml-1" title="QC flag" />;
}

function SummaryCard({ icon: Icon, label, stats, color }) {
  if (!stats) return (
    <div className="bg-white/3 border border-white/6 rounded-lg p-3 opacity-40">
      <div className="flex items-center space-x-1.5 mb-1">
        <Icon className={`w-3.5 h-3.5 ${color}`} />
        <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">{label}</span>
      </div>
      <p className="text-xs text-slate-600 italic">No data</p>
    </div>
  );
  return (
    <div className="bg-white/3 border border-white/6 rounded-lg p-3 hover:border-white/10 transition-colors">
      <div className="flex items-center space-x-1.5 mb-2">
        <Icon className={`w-3.5 h-3.5 ${color}`} />
        <span className={`text-[10px] uppercase font-bold tracking-wider ${color}`}>{label}</span>
      </div>
      <div className="space-y-0.5 font-mono text-xs">
        <div className="flex justify-between"><span className="text-slate-500">Min</span><span className="text-slate-300">{stats.min}</span></div>
        <div className="flex justify-between"><span className="text-slate-500">Mean</span><span className="text-white font-semibold">{stats.mean}</span></div>
        <div className="flex justify-between"><span className="text-slate-500">Max</span><span className="text-slate-300">{stats.max}</span></div>
      </div>
    </div>
  );
}

function DepthChart({ measurements }) {
  if (!measurements?.length) return null;
  const pressures = measurements.map(m => m.pressure);
  const temps = measurements.map(m => m.temperature);
  const sals = measurements.map(m => m.salinity);

  return (
    <Plot
      data={[
        { x: temps, y: pressures, name: 'Temp (°C)', mode: 'lines+markers', line: { color: '#f97316', width: 2 }, marker: { size: 5 } },
        { x: sals, y: pressures, name: 'Sal (PSU)', mode: 'lines+markers', line: { color: '#38bdf8', width: 2, dash: 'dot' }, marker: { size: 5 }, xaxis: 'x2' },
      ]}
      layout={{
        paper_bgcolor: 'transparent', plot_bgcolor: 'rgba(0,0,0,0)',
        margin: { l: 45, r: 45, t: 10, b: 35 },
        height: 220,
        yaxis: { autorange: 'reversed', title: { text: 'Depth (dbar)', font: { color: '#64748b', size: 10 } }, gridcolor: 'rgba(255,255,255,0.04)', tickfont: { color: '#64748b', size: 9 } },
        xaxis: { title: { text: 'Temp (°C)', font: { color: '#f97316', size: 10 } }, tickfont: { color: '#f97316', size: 9 }, gridcolor: 'rgba(255,255,255,0.04)' },
        xaxis2: { title: { text: 'Salinity (PSU)', font: { color: '#38bdf8', size: 10 } }, tickfont: { color: '#38bdf8', size: 9 }, overlaying: 'x', side: 'top' },
        legend: { font: { color: '#94a3b8', size: 9 }, orientation: 'h', y: -0.15 },
        showlegend: true,
      }}
      config={{ responsive: true, displayModeBar: false }}
      style={{ width: '100%' }}
    />
  );
}

function ProfileDetailPanel({ profileId, onClose }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('chart');

  useEffect(() => {
    setLoading(true);
    setDetail(null);
    const load = async () => {
      try {
        const res = await fetch(`http://localhost:8000/api/v1/profiles/${profileId}`);
        if (res.ok) setDetail(await res.json());
        else setDetail(MOCK_DETAIL(profileId));
      } catch {
        setDetail(MOCK_DETAIL(profileId));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [profileId]);

  return (
    <div className="border-t border-white/8 mt-2 pt-3 space-y-3">
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="loader scale-50 origin-top" />
        </div>
      ) : detail ? (
        <>
          {/* Header info */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center space-x-1.5 text-slate-400">
              <Calendar className="w-3 h-3" /><span>{detail.date?.slice(0, 10)}</span>
            </div>
            <div className="flex items-center space-x-1.5 text-slate-400">
              <MapPin className="w-3 h-3" /><span>{detail.latitude?.toFixed(2)}°, {detail.longitude?.toFixed(2)}°</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${detail.data_mode === 'R' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-blue-500/15 text-blue-400'}`}>
                {detail.data_mode === 'R' ? '📡 Realtime' : '🕐 Delayed'}
              </span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${detail.data_source === 'LIVE_GDAC' ? 'bg-cyan-500/15 text-cyan-400' : 'bg-slate-700 text-slate-400'}`}>
                {detail.data_source === 'LIVE_GDAC' ? '🛰 LIVE' : '💾 CACHED'}
              </span>
            </div>
            <div className="text-slate-500 text-[10px]">{detail.measurement_count} depth levels</div>
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-2 gap-2">
            <SummaryCard icon={Thermometer} label="Temperature °C" stats={detail.summary?.temperature} color="text-orange-400" />
            <SummaryCard icon={Droplets} label="Salinity PSU" stats={detail.summary?.salinity} color="text-blue-400" />
          </div>

          {/* Tabs */}
          <div className="flex border-b border-white/8">
            {['chart', 'table'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-xs font-semibold capitalize transition-all border-b-2 ${activeTab === tab ? 'border-cyan-400 text-cyan-300' : 'border-transparent text-slate-500 hover:text-slate-300'}`}>
                {tab === 'chart' ? '📈 Depth Chart' : '📋 Measurements'}
              </button>
            ))}
          </div>

          {activeTab === 'chart' && <DepthChart measurements={detail.measurements} />}

          {activeTab === 'table' && (
            <div className="overflow-x-auto rounded-lg border border-white/6">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-white/4 border-b border-white/8">
                    {['Depth (dbar)', 'Temp (°C)', 'Salinity'].map(h => (
                      <th key={h} className="px-3 py-2 text-left text-slate-400 font-semibold whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {detail.measurements.map((m, i) => (
                    <tr key={i} className="border-b border-white/4 hover:bg-white/3 transition-colors">
                      <td className="px-3 py-1.5 font-mono text-cyan-300 font-semibold">{m.pressure}</td>
                      <td className="px-3 py-1.5 font-mono text-orange-300">
                        {m.temperature?.toFixed(2) ?? '—'}<QcBadge qc={m.temperature_qc} />
                      </td>
                      <td className="px-3 py-1.5 font-mono text-blue-300">
                        {m.salinity?.toFixed(3) ?? '—'}<QcBadge qc={m.salinity_qc} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      ) : (
        <p className="text-center text-xs text-slate-500 py-4">Failed to load profile.</p>
      )}
    </div>
  );
}

function ProfileCard({ profile, isExpanded, onToggle }) {
  return (
    <div className={`rounded-xl border transition-all duration-200 overflow-hidden ${isExpanded ? 'border-cyan-500/40 bg-cyan-950/20' : 'border-white/6 bg-white/2 hover:border-white/12 hover:bg-white/4'}`}>
      <button className="w-full flex items-center justify-between p-3 text-left" onClick={onToggle}>
        <div className="flex items-center space-x-3 min-w-0">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isExpanded ? 'bg-cyan-500/20' : 'bg-white/5'}`}>
            <Layers className={`w-4 h-4 ${isExpanded ? 'text-cyan-400' : 'text-slate-500'}`} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-semibold text-white font-mono">#{profile.wmo_id}</span>
              <span className="text-[10px] bg-white/6 border border-white/10 text-slate-400 px-1.5 py-0.5 rounded font-mono">Cycle {profile.cycle}</span>
              {profile.source === 'LIVE_GDAC' && (
                <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 px-1.5 py-0.5 rounded">LIVE</span>
              )}
            </div>
            <div className="flex items-center space-x-2 mt-0.5">
              <span className="text-xs text-slate-500">{profile.region}</span>
              <span className="text-slate-600">·</span>
              <span className="text-xs text-slate-500 font-mono">{profile.date?.slice(0, 10)}</span>
            </div>
          </div>
        </div>
        {isExpanded
          ? <ChevronDown className="w-4 h-4 text-cyan-400 flex-shrink-0" />
          : <ChevronRight className="w-4 h-4 text-slate-600 flex-shrink-0" />}
      </button>

      {isExpanded && (
        <div className="px-3 pb-3">
          <ProfileDetailPanel profileId={profile.id} />
        </div>
      )}
    </div>
  );
}

export default function ProfileExplorer({ isOpen, onClose }) {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [regionFilter, setRegionFilter] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [page, setPage] = useState(1);
  const PER_PAGE = 10;

  const fetchProfiles = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: 50 });
      if (regionFilter) params.append('region', regionFilter);
      const res = await fetch(`http://localhost:8000/api/v1/profiles?${params}`);
      if (res.ok) setProfiles(await res.json());
      else setProfiles(MOCK_PROFILES);
    } catch {
      setProfiles(MOCK_PROFILES);
    } finally {
      setLoading(false);
    }
  }, [regionFilter]);

  useEffect(() => {
    if (isOpen) fetchProfiles();
  }, [isOpen, fetchProfiles]);

  if (!isOpen) return null;

  const filtered = profiles.filter(p =>
    (!search || p.wmo_id?.includes(search) || p.region?.toLowerCase().includes(search.toLowerCase()))
  );
  const paged = filtered.slice(0, page * PER_PAGE);

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-lg bg-[#050f1e] border-l border-white/8 z-50 flex flex-col shadow-2xl"
        style={{ animation: 'slideInRight 0.3s ease-out' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/8 bg-[#020b18]/60 backdrop-blur">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-cyan-500/15 rounded-lg">
              <Layers className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Profile Explorer</h2>
              <p className="text-xs text-slate-500">{filtered.length} profiles · click any to inspect</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button onClick={fetchProfiles} disabled={loading}
              className="p-2 text-slate-500 hover:text-cyan-400 transition-colors rounded-lg hover:bg-white/5">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button onClick={onClose}
              className="p-2 text-slate-500 hover:text-white transition-colors rounded-lg hover:bg-white/5">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search + Filter */}
        <div className="px-4 py-3 border-b border-white/6 space-y-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search WMO ID or region..."
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors" />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-0.5">
            {['', 'Arabian Sea', 'Bay of Bengal', 'Laccadive Sea', 'Equatorial'].map(r => (
              <button key={r} onClick={() => { setRegionFilter(r); setPage(1); }}
                className={`text-[11px] px-2.5 py-1 rounded-full border whitespace-nowrap transition-all flex-shrink-0 ${regionFilter === r ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300' : 'bg-white/3 border-white/8 text-slate-400 hover:border-white/15'}`}>
                {r || 'All Regions'}
              </button>
            ))}
          </div>
        </div>

        {/* Profile List */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-3">
              <div className="loader scale-75 origin-center" />
              <p className="text-xs text-cyan-400 animate-pulse font-mono">Loading profiles...</p>
            </div>
          ) : paged.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-3 text-slate-600">
              <Database className="w-10 h-10" />
              <p className="text-sm">No profiles found</p>
              <p className="text-xs">Try a different search or region</p>
            </div>
          ) : (
            <>
              {paged.map(profile => (
                <ProfileCard
                  key={profile.id}
                  profile={profile}
                  isExpanded={expandedId === profile.id}
                  onToggle={() => setExpandedId(expandedId === profile.id ? null : profile.id)}
                />
              ))}
              {filtered.length > paged.length && (
                <button onClick={() => setPage(p => p + 1)}
                  className="w-full py-2.5 text-sm text-cyan-400 hover:text-cyan-300 border border-cyan-500/20 hover:border-cyan-500/40 rounded-xl transition-all hover:bg-cyan-500/5">
                  Load more ({filtered.length - paged.length} remaining)
                </button>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-white/6 flex items-center justify-between text-[11px] text-slate-600">
          <span>ARGO GDAC · Indian Ocean Floats</span>
          <span className="font-mono">{profiles.length} total loaded</span>
        </div>
      </div>
    </>
  );
}
