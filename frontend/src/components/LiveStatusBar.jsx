'use client';
import { useState, useEffect } from 'react';
import { RefreshCw, Activity, Database } from 'lucide-react';

export default function LiveStatusBar() {
  const [status, setStatus] = useState({ isLive: true, lastSync: 0, activeFloats: 4000, totalProfiles: '2.5M' });
  const [syncing, setSyncing] = useState(false);

  const fetchStatus = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/v1/live/status');
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
      }
    } catch (e) {
      console.log('Using mock status data');
    }
  };

  useEffect(() => {
    fetchStatus();
    const int = setInterval(fetchStatus, 30000);
    return () => clearInterval(int);
  }, []);

  const handleSync = async () => {
    setSyncing(true);
    try {
      await fetch('http://localhost:8000/api/v1/live/sync', { method: 'POST' });
      await fetchStatus();
    } catch (e) {
      console.log('Mock sync success');
    }
    setTimeout(() => setSyncing(false), 1000);
  };

  return (
    <div className="bg-[#020b18]/80 backdrop-blur-md border-b border-white/5 py-1.5 px-4 md:px-6 text-xs md:text-sm font-mono flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${status.isLive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
          <span className={status.isLive ? 'text-emerald-400' : 'text-amber-400'}>
            {status.isLive ? 'Live Feed Active' : 'Stale Feed'}
          </span>
        </div>
        <div className="hidden md:flex items-center text-slate-400">
          <Activity className="w-3 h-3 mr-1" />
          <span>{status.activeFloats} floats | {status.totalProfiles} profiles</span>
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <span className="text-slate-400 hidden sm:inline">Last sync: {status.lastSync} mins ago</span>
        <div className="flex items-center space-x-1 bg-ocean-900/50 px-2 py-0.5 rounded text-ocean-300 border border-ocean-800">
          <Database className="w-3 h-3" />
          <span className="text-[10px] uppercase">GDAC ERDDAP</span>
        </div>
        <button 
          onClick={handleSync}
          disabled={syncing}
          className="flex items-center space-x-1 text-slate-300 hover:text-white transition-colors"
        >
          <RefreshCw className={`w-3 h-3 ${syncing ? 'animate-spin' : ''}`} />
          <span>{syncing ? 'Syncing...' : 'Sync Now'}</span>
        </button>
      </div>
    </div>
  );
}
