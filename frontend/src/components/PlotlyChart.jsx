'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

export default function PlotlyChart({ chartData, forecastData }) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient || !chartData) {
    return (
      <div className="h-64 flex items-center justify-center bg-ocean-900/40 rounded-xl border border-ocean-800/40 text-cyan-300/60 text-sm">
        Loading Visualization Engine...
      </div>
    );
  }

  const isDepth = chartData.type === 'depth_profile';
  
  const trace1 = {
    x: chartData.x,
    y: chartData.y,
    mode: 'lines+markers',
    type: 'scatter',
    name: `${chartData.parameter} (${chartData.unit})`,
    line: { color: '#06b6d4', width: 2.5 },
    marker: { size: 6, color: '#38bdf8' }
  };

  const traces = [trace1];

  if (forecastData && forecastData.forecast_series) {
    const lastX = chartData.x[chartData.x.length - 1] || '2024-12-31';
    const futureX = Array.from({ length: forecastData.steps }, (_, i) => `Forecast Step +${i+1}`);
    
    traces.push({
      x: futureX,
      y: forecastData.forecast_series,
      mode: 'lines+markers',
      type: 'scatter',
      name: 'LSTM Prediction',
      line: { color: '#f59e0b', width: 3, dash: 'dot' },
      marker: { size: 7, color: '#fbbf24' }
    });
  }

  const layout = {
    autosize: true,
    paper_bgcolor: 'transparent',
    plot_bgcolor: 'transparent',
    margin: { l: 50, r: 30, t: 30, b: 40 },
    xaxis: {
      title: { text: chartData.x_label, font: { color: '#94a3b8' } },
      gridcolor: '#1e293b',
      tickfont: { color: '#cbd5e1' }
    },
    yaxis: {
      title: { text: chartData.y_label, font: { color: '#94a3b8' } },
      autorange: isDepth ? 'reversed' : true, // Depth profile pressure increases downwards
      gridcolor: '#1e293b',
      tickfont: { color: '#cbd5e1' }
    },
    legend: {
      font: { color: '#e2e8f0' },
      orientation: 'h',
      y: 1.15
    }
  };

  return (
    <div className="w-full bg-ocean-950/60 border border-ocean-800/60 rounded-xl p-4 shadow-xl">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-cyan-200">
          {isDepth ? 'Vertical Depth Profile' : 'Temporal Parameter Trend'}
        </h3>
        <span className="text-xs px-2 py-0.5 rounded bg-cyan-950 border border-cyan-500/40 text-cyan-300 font-mono">
          {chartData.parameter}
        </span>
      </div>
      <div className="w-full h-72">
        <Plot
          data={traces}
          layout={layout}
          useResizeHandler={true}
          style={{ width: '100%', height: '100%' }}
          config={{ responsive: true, displayModeBar: false }}
        />
      </div>
    </div>
  );
}
