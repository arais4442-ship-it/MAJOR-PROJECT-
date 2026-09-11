'use client';
import React from 'react';
import { Radio, Zap, Shield, Cpu, Activity, Sparkles, Compass } from 'lucide-react';
import { cyberAudio } from '../utils/cyberAudio';

export default function CyberHUDBar({ faction = 'autobot', onSelectPreset }) {
  const isAutobot = faction === 'autobot';

  const presets = [
    { label: 'Arabian Sea Monsoon 2023', query: 'Show me temperature trends in the Arabian Sea during monsoon 2023', tag: 'TEMP' },
    { label: 'Bay of Bengal Salinity', query: 'Compare salinity profiles across Bay of Bengal vs Indian Ocean', tag: 'SAL' },
    { label: 'Deep Ocean Thermal (>1000m)', query: 'What is the deep ocean temperature profile below 1000m depth?', tag: 'DEPTH' },
  ];

  return (
    <div className={`w-full glass-card p-3 border ${isAutobot ? 'border-cyan-500/30 bg-cyan-950/20' : 'border-fuchsia-500/30 bg-fuchsia-950/20'} space-y-2.5 overflow-hidden`}>
      {/* Top Telemetry Ticker Row */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/8 pb-2 text-xs font-rajdhani">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 font-orbitron font-bold text-emerald-400">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span className="text-[11px] uppercase tracking-wider">CYBERTRON UPLINK</span>
          </div>
          <span className="text-slate-600">|</span>
          <div className="flex items-center space-x-1 text-slate-300 text-[11px]">
            <Activity className="w-3 h-3 text-cyan-400" />
            <span>3,942 ARGO FLOATS ACTIVE</span>
          </div>
          <span className="hidden sm:inline text-slate-600">|</span>
          <div className="hidden sm:flex items-center space-x-1 text-amber-300 text-[11px] font-orbitron">
            <Zap className="w-3 h-3 text-amber-400 fill-amber-400" />
            <span>ENERGON GRID: 99.8%</span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1 text-slate-400 text-[11px]">
            <Shield className="w-3 h-3 text-indigo-400" />
            <span>ZERO-HALLUCINATION RETRIEVAL</span>
          </div>
          <span className="text-slate-600">|</span>
          <div className="flex items-center space-x-1 text-cyan-300 text-[11px]">
            <Cpu className="w-3 h-3 text-cyan-400" />
            <span>ML + GEMINI CORE</span>
          </div>
        </div>
      </div>

      {/* Preset Quick Chips */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
        <div className="flex items-center space-x-1 text-[10px] font-orbitron uppercase text-slate-400 font-bold pr-1 flex-shrink-0">
          <Sparkles className="w-3 h-3 text-amber-400" />
          <span>CYBER COMMANDS:</span>
        </div>
        {presets.map((p, idx) => (
          <button
            key={idx}
            onClick={() => {
              cyberAudio.playEnergonCharge();
              if (onSelectPreset) onSelectPreset(p.query);
            }}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs font-rajdhani font-semibold transition-all whitespace-nowrap group ${
              isAutobot 
                ? 'bg-cyan-500/10 hover:bg-cyan-500/20 border-cyan-500/30 hover:border-cyan-400 text-cyan-300 hover:text-white shadow-sm hover:shadow-cyan-500/20' 
                : 'bg-fuchsia-500/10 hover:bg-fuchsia-500/20 border-fuchsia-500/30 hover:border-fuchsia-400 text-fuchsia-300 hover:text-white shadow-sm hover:shadow-fuchsia-500/20'
            }`}
          >
            <span className={`text-[9px] font-orbitron font-bold px-1.5 py-0.2 rounded ${
              isAutobot ? 'bg-cyan-500/20 text-cyan-200' : 'bg-fuchsia-500/20 text-fuchsia-200'
            }`}>
              {p.tag}
            </span>
            <span className="group-hover:translate-x-0.5 transition-transform">{p.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
