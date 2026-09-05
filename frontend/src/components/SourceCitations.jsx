'use client';
import React from 'react';
import { Database, Award, CheckCircle2, Info, Download, AlertTriangle, ArrowRight } from 'lucide-react';

export default function SourceCitations({ citations, confidence }) {
  if (!citations) return null;

  const score = confidence?.score || 0;
  const rating = confidence?.quality_rating || 'Low';
  const qualityColor = rating === 'High' ? 'text-emerald-400 border-emerald-500/40 bg-emerald-950/40'
    : rating === 'Medium' ? 'text-amber-400 border-amber-500/40 bg-amber-950/40'
    : 'text-rose-400 border-rose-500/40 bg-rose-950/40';

  const isLive = citations.data_source === 'LIVE_GDAC';

  const handleExport = async () => {
    try {
      const param = citations.parameter?.toLowerCase().replace('-a', '') || 'temperature';
      const region = citations.region || '';
      const url = `http://localhost:8000/api/v1/export/csv?parameter=${param}&region=${encodeURIComponent(region)}`;
      const a = document.createElement('a');
      a.href = url;
      a.download = `oceaniq_${param}.csv`;
      a.click();
    } catch {}
  };

  return (
    <div className="glass-card p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/5 pb-3">
        <div className="flex items-center space-x-2">
          <Database className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-semibold text-cyan-100">Data Provenance</h3>
          <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${isLive ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>
            {isLive ? '🛰 LIVE GDAC' : '💾 CACHED'}
          </span>
        </div>
        {confidence && (
          <div className={`flex items-center space-x-1 border px-2.5 py-0.5 rounded-full text-xs font-semibold ${qualityColor}`}>
            <Award className="w-3 h-3" />
            <span>{rating}</span>
          </div>
        )}
      </div>

      {/* Confidence Gauge */}
      {confidence && (
        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-slate-400">Confidence Score</span>
            <span className="font-mono text-white">{Math.round(score * 100)}%</span>
          </div>
          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-700 ${rating === 'High' ? 'bg-emerald-500' : rating === 'Medium' ? 'bg-amber-500' : 'bg-rose-500'}`}
              style={{ width: `${score * 100}%` }} />
          </div>
        </div>
      )}

      {/* Meta Grid */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        {[
          { label: 'Region', value: citations.region },
          { label: 'Parameter', value: citations.parameter },
          { label: 'Depth Scope', value: citations.depth_range },
          { label: 'QC Status', value: '✓ QC=1 Good', green: true },
        ].map(({ label, value, green }) => (
          <div key={label} className="bg-white/3 border border-white/5 p-2.5 rounded-lg">
            <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider mb-0.5">{label}</span>
            <span className={`font-semibold ${green ? 'text-emerald-400' : 'text-cyan-200'}`}>{value}</span>
          </div>
        ))}
      </div>

      {/* Data Flow Timeline */}
      <div className="flex items-center space-x-1 text-[10px] text-slate-500 overflow-x-auto">
        {['ARGO Float', 'Iridium Satellite', 'GDAC', 'OceanIQ'].map((step, i, arr) => (
          <React.Fragment key={step}>
            <span className="bg-white/5 border border-white/8 px-2 py-1 rounded text-slate-400 whitespace-nowrap">{step}</span>
            {i < arr.length - 1 && <ArrowRight className="w-3 h-3 flex-shrink-0" />}
          </React.Fragment>
        ))}
      </div>

      {/* WMO IDs */}
      {citations.wmo_ids?.length > 0 && (
        <div>
          <span className="text-xs text-slate-400 block mb-1.5 font-semibold">Cited Float IDs</span>
          <div className="flex flex-wrap gap-1.5">
            {citations.wmo_ids.map((id, i) => (
              <span key={i} className="text-[11px] font-mono bg-cyan-950/50 border border-cyan-500/30 text-cyan-300 px-2 py-0.5 rounded">
                {id}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Export */}
      <div className="flex items-center justify-between pt-1 border-t border-white/5">
        <p className="text-[10px] text-slate-500 flex items-start space-x-1">
          <Info className="w-3 h-3 text-cyan-500 flex-shrink-0 mt-0.5" />
          <span>{citations.data_provenance}</span>
        </p>
        <button onClick={handleExport}
          className="flex items-center space-x-1 text-xs text-cyan-400 hover:text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 px-2.5 py-1.5 rounded-lg transition-all flex-shrink-0 ml-2">
          <Download className="w-3 h-3" />
          <span>CSV</span>
        </button>
      </div>
    </div>
  );
}
