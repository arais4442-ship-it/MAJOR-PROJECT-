'use client';
import { useState, useEffect } from 'react';
import { Satellite, Database, Activity, Clock } from 'lucide-react';

export default function StatsCards() {
  const [stats, setStats] = useState({ activeFloats: 4123, totalProfiles: 2540, measurements: 12500, lastSync: '2m ago' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/v1/stats');
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (e) {
        console.log('Using mock stats data');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const cards = [
    { label: 'Active Floats', value: stats.activeFloats, icon: Satellite, color: 'text-teal-400', bg: 'bg-teal-400/10' },
    { label: 'Total Profiles', value: stats.totalProfiles > 1000 ? (stats.totalProfiles/1000).toFixed(1)+'K' : stats.totalProfiles, icon: Database, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { label: 'Measurements', value: stats.measurements > 1000 ? (stats.measurements/1000).toFixed(1)+'K' : stats.measurements, icon: Activity, color: 'text-indigo-400', bg: 'bg-indigo-400/10' },
    { label: 'Last Sync', value: stats.lastSync, icon: Clock, color: 'text-amber-400', bg: 'bg-amber-400/10' },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1,2,3,4].map(i => (
          <div key={i} className="glass-card h-24 skeleton-loading rounded-xl"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((card, i) => {
        const Icon = card.icon;
        return (
          <div key={i} className="glass-card p-4 flex items-center space-x-4 group cursor-default">
            <div className={`p-3 rounded-lg ${card.bg} group-hover:scale-110 transition-transform`}>
              <Icon className={`w-6 h-6 ${card.color}`} />
            </div>
            <div>
              <div className="text-2xl font-bold tracking-tight text-white">{card.value}</div>
              <div className="text-sm text-slate-400">{card.label}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
