'use client';
import { useState } from 'react';
import { ChevronDown, ChevronUp, SlidersHorizontal, RotateCcw } from 'lucide-react';

const REGIONS = [
  { label: 'Arabian Sea', value: 'arabian sea' },
  { label: 'Bay of Bengal', value: 'bay of bengal' },
  { label: 'Laccadive Sea', value: 'laccadive sea' },
  { label: 'Equatorial IO', value: 'equatorial indian ocean' },
  { label: 'Red Sea', value: 'red sea' },
  { label: 'All Indian Ocean', value: 'indian ocean' },
];

const PARAMETERS = [
  { label: 'Temperature', value: 'temperature', color: 'text-orange-400', bg: 'bg-orange-400/10 border-orange-400/30' },
  { label: 'Salinity', value: 'salinity', color: 'text-blue-400', bg: 'bg-blue-400/10 border-blue-400/30' },
  { label: 'Dissolved O₂', value: 'dissolved_oxygen', color: 'text-green-400', bg: 'bg-green-400/10 border-green-400/30' },
  { label: 'Chlorophyll-a', value: 'chlorophyll', color: 'text-emerald-400', bg: 'bg-emerald-400/10 border-emerald-400/30' },
];

export default function FilterPanel({ onFilterChange }) {
  const [open, setOpen] = useState(false);
  const [parameter, setParameter] = useState('temperature');
  const [region, setRegion] = useState('arabian sea');
  const [startDate, setStartDate] = useState('2023-01-01');
  const [endDate, setEndDate] = useState('2024-12-31');
  const [minDepth, setMinDepth] = useState(0);
  const [maxDepth, setMaxDepth] = useState(1000);

  const handleApply = () => {
    onFilterChange && onFilterChange({ parameter, region, startDate, endDate, minDepth, maxDepth });
  };

  const handleReset = () => {
    setParameter('temperature'); setRegion('arabian sea');
    setStartDate('2023-01-01'); setEndDate('2024-12-31');
    setMinDepth(0); setMaxDepth(1000);
    onFilterChange && onFilterChange({ parameter: 'temperature', region: 'arabian sea', startDate: '2023-01-01', endDate: '2024-12-31', minDepth: 0, maxDepth: 1000 });
  };

  return (
    <div className="glass-card overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between p-4 text-sm font-semibold text-cyan-100 hover:bg-white/5 transition-colors">
        <div className="flex items-center space-x-2">
          <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
          <span>Query Filters</span>
          <span className="text-xs bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded-full font-mono">{parameter} · {REGIONS.find(r=>r.value===region)?.label}</span>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-4 border-t border-white/5">
          {/* Parameter */}
          <div>
            <label className="text-xs text-slate-400 uppercase tracking-wider font-bold block mb-2 mt-3">Parameter</label>
            <div className="grid grid-cols-2 gap-2">
              {PARAMETERS.map(p => (
                <button key={p.value} onClick={() => setParameter(p.value)}
                  className={`text-xs px-3 py-2 rounded-lg border font-medium transition-all ${parameter === p.value ? p.bg + ' ' + p.color : 'bg-white/3 border-white/10 text-slate-400 hover:border-white/20'}`}>
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Region */}
          <div>
            <label className="text-xs text-slate-400 uppercase tracking-wider font-bold block mb-2">Ocean Region</label>
            <div className="flex flex-wrap gap-1.5">
              {REGIONS.map(r => (
                <button key={r.value} onClick={() => setRegion(r.value)}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-all ${region === r.value ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300' : 'bg-white/3 border-white/10 text-slate-400 hover:border-white/20'}`}>
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400 uppercase tracking-wider font-bold block mb-1">Start Date</label>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-400 transition-colors" />
            </div>
            <div>
              <label className="text-xs text-slate-400 uppercase tracking-wider font-bold block mb-1">End Date</label>
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-400 transition-colors" />
            </div>
          </div>

          {/* Depth Range */}
          <div>
            <label className="text-xs text-slate-400 uppercase tracking-wider font-bold block mb-2">
              Depth Range: <span className="text-cyan-300 font-mono">{minDepth} — {maxDepth} dbar</span>
            </label>
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <span className="text-xs text-slate-500 w-8">Min</span>
                <input type="range" min={0} max={2000} step={10} value={minDepth} onChange={e => setMinDepth(Number(e.target.value))}
                  className="flex-1 h-1.5 bg-white/10 rounded-full accent-cyan-400" />
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-xs text-slate-500 w-8">Max</span>
                <input type="range" min={0} max={2000} step={10} value={maxDepth} onChange={e => setMaxDepth(Number(e.target.value))}
                  className="flex-1 h-1.5 bg-white/10 rounded-full accent-cyan-400" />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-3 pt-1">
            <button onClick={handleApply}
              className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-sm font-semibold py-2.5 rounded-lg transition-all shadow-lg shadow-cyan-500/20">
              Apply Filters
            </button>
            <button onClick={handleReset} className="flex items-center space-x-1 text-slate-400 hover:text-white text-sm transition-colors px-3 py-2.5 rounded-lg hover:bg-white/5">
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
