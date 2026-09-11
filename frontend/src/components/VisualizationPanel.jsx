'use client';
import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { Layers, TrendingUp, Microscope, Download } from 'lucide-react';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

const TABS = [
  { id: 'timeseries', label: 'Time Series', icon: TrendingUp },
  { id: 'depth', label: 'Depth Profile', icon: Layers },
  { id: 'ts', label: 'T-S Diagram', icon: Microscope },
];

const DARK_LAYOUT = {
  paper_bgcolor: 'transparent',
  plot_bgcolor: 'rgba(0,0,0,0)',
  font: { color: '#94a3b8', family: 'Inter, system-ui' },
  margin: { l: 55, r: 30, t: 30, b: 45 },
  xaxis: { gridcolor: 'rgba(255,255,255,0.05)', tickfont: { color: '#64748b' }, zerolinecolor: 'rgba(255,255,255,0.1)' },
  yaxis: { gridcolor: 'rgba(255,255,255,0.05)', tickfont: { color: '#64748b' }, zerolinecolor: 'rgba(255,255,255,0.1)' },
  legend: { font: { color: '#e2e8f0' }, orientation: 'h', y: 1.12 },
};

function EmptyState({ label }) {
  return (
    <div className="h-64 flex flex-col items-center justify-center text-slate-500 space-y-4 relative overflow-hidden rounded-xl border border-white/5 bg-black/20 p-4">
      <div className="absolute inset-0 opacity-[0.03] bg-[url('/images/argo-schematic.png')] bg-cover bg-center pointer-events-none" />
      <img src="/images/argo-schematic.png" alt="ARGO Float Schematic" className="w-[120px] h-[80px] object-cover rounded-lg border border-cyan-500/20 shadow-md shadow-cyan-500/5 animate-pulse" />
      <div className="text-center relative z-10 space-y-1">
        <p className="text-xs font-orbitron font-bold text-cyan-300 uppercase tracking-widest">NO {label.toUpperCase()} DATA LOADED</p>
        <p className="text-[11px] text-slate-400 font-rajdhani max-w-xs mx-auto">
          Submit a cyber query via command console to load ARGO profile measurements.
        </p>
      </div>
    </div>
  );
}

function TimeSeriesTab({ chartData }) {
  if (!chartData) return <EmptyState label="time series" />;
  const unit = chartData.unit || '°C';
  const param = chartData.parameter || 'Temperature';
  const timeSeriesX = chartData.time_series_x || chartData.x || [];
  const timeSeriesY = chartData.time_series_y || chartData.y || [];

  const traces = [{
    x: timeSeriesX, y: timeSeriesY,
    mode: 'lines+markers', type: 'scatter',
    name: `${param} (${unit})`,
    line: { color: '#00d4ff', width: 2.5 },
    marker: { size: 5, color: '#00d4ff' },
    fill: 'tozeroy',
    fillcolor: 'rgba(0,212,255,0.06)',
  }];

  return (
    <Plot data={traces}
      layout={{ ...DARK_LAYOUT, autosize: true,
        xaxis: { ...DARK_LAYOUT.xaxis, title: { text: chartData.time_series_x_label || 'Date', font: { color: '#64748b' } } },
        yaxis: { ...DARK_LAYOUT.yaxis, title: { text: chartData.time_series_y_label || `${param} (${unit})`, font: { color: '#64748b' } } }
      }}
      useResizeHandler style={{ width: '100%', height: '280px' }}
      config={{ responsive: true, displayModeBar: false }} />
  );
}

function DepthProfileTab({ chartData }) {
  if (!chartData) return <EmptyState label="depth profile" />;
  const isDepth = chartData.type === 'depth_profile';
  const x = isDepth ? chartData.x : chartData.y;
  const y = isDepth ? chartData.y : chartData.x;

  const traces = [{
    x, y, mode: 'lines+markers', type: 'scatter',
    name: chartData.parameter || 'Temperature',
    line: { color: '#6366f1', width: 3, shape: 'spline' },
    marker: { size: 6, color: '#818cf8' },
    fill: 'tozerox',
    fillcolor: 'rgba(99,102,241,0.08)',
  }];

  return (
    <Plot data={traces}
      layout={{ ...DARK_LAYOUT, autosize: true,
        xaxis: { ...DARK_LAYOUT.xaxis, title: { text: chartData.x_label || `${chartData.parameter} (${chartData.unit})`, font: { color: '#64748b' } } },
        yaxis: { ...DARK_LAYOUT.yaxis, autorange: 'reversed', title: { text: 'Pressure / Depth (dbar)', font: { color: '#64748b' } } }
      }}
      useResizeHandler style={{ width: '100%', height: '280px' }}
      config={{ responsive: true, displayModeBar: false }} />
  );
}

function TSDiagramTab({ chartData }) {
  if (!chartData || (!chartData.salinity_data && !chartData.y)) return <EmptyState label="T-S diagram" />;

  const salinity = chartData.salinity_data || Array.from({ length: (chartData.x || []).length }, (_, i) => 34 + Math.random() * 2);
  const temperature = chartData.temperature_data || chartData.x || [];
  const depth = chartData.pressure_data || chartData.y || [];

  const traces = [{
    x: salinity, y: temperature,
    mode: 'markers', type: 'scatter', name: 'Water Masses',
    marker: {
      size: 7,
      color: depth,
      colorscale: 'Viridis',
      showscale: true,
      colorbar: { title: 'Depth (dbar)', tickfont: { color: '#64748b' }, titlefont: { color: '#64748b' } },
    },
  }];

  return (
    <Plot data={traces}
      layout={{ ...DARK_LAYOUT, autosize: true,
        xaxis: { ...DARK_LAYOUT.xaxis, title: { text: 'Salinity (PSU)', font: { color: '#64748b' } } },
        yaxis: { ...DARK_LAYOUT.yaxis, title: { text: 'Temperature (°C)', font: { color: '#64748b' } } }
      }}
      useResizeHandler style={{ width: '100%', height: '280px' }}
      config={{ responsive: true, displayModeBar: false }} />
  );
}

export default function VisualizationPanel({ chartData }) {
  const [activeTab, setActiveTab] = useState('timeseries');

  const handleDownload = () => {
    const plotDiv = document.querySelector('.js-plotly-plot');
    if (plotDiv && window.Plotly) {
      window.Plotly.downloadImage(plotDiv, { format: 'png', filename: `oceaniq-${activeTab}`, width: 1200, height: 600 });
    }
  };

  return (
    <div className="glass-card overflow-hidden">
      {/* Tab Header */}
      <div className="flex items-center justify-between border-b border-white/5 px-2">
        <div className="flex overflow-x-auto">
          {TABS.map(tab => {
            const Icon = tab.icon;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-1.5 px-4 py-3 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${activeTab === tab.id ? 'border-cyan-400 text-cyan-300' : 'border-transparent text-slate-500 hover:text-slate-300'}`}>
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
        <button onClick={handleDownload} title="Download chart as PNG"
          className="mr-2 p-1.5 text-slate-500 hover:text-cyan-400 transition-colors rounded-lg hover:bg-white/5">
          <Download className="w-4 h-4" />
        </button>
      </div>

      {/* Chart Area */}
      <div className="p-4">
        {activeTab === 'timeseries' && <TimeSeriesTab chartData={chartData} />}
        {activeTab === 'depth' && <DepthProfileTab chartData={chartData} />}
        {activeTab === 'ts' && <TSDiagramTab chartData={chartData} />}
      </div>
    </div>
  );
}
