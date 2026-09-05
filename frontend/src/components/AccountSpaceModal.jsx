'use client';
import React, { useState, useEffect } from 'react';
import { 
  Shield, Zap, Star, Key, Settings, Download, Trash2, Copy, 
  Check, RefreshCw, Plus, Bell, X, Sparkles, Cpu, Award, ExternalLink,
  ChevronRight, Radio, Database, Lock, AlertTriangle
} from 'lucide-react';
import { cyberAudio } from '../utils/cyberAudio';

export default function AccountSpaceModal({ 
  isOpen, 
  onClose, 
  user, 
  token, 
  faction = 'autobot', 
  setFaction,
  onRunQuery 
}) {
  const [activeTab, setActiveTab] = useState('overview');
  const [savedQueries, setSavedQueries] = useState([]);
  const [loadingQueries, setLoadingQueries] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  // Custom Float Alerts State
  const [alerts, setAlerts] = useState([
    { id: 'alt-1', name: 'Arabian Sea Temp Spike', region: 'Arabian Sea', parameter: 'Temperature', threshold: '> 29.5 °C', status: 'ACTIVE' },
    { id: 'alt-2', name: 'Bay of Bengal Salinity Drop', region: 'Bay of Bengal', parameter: 'Salinity', threshold: '< 32.0 PSU', status: 'ACTIVE' },
  ]);
  const [newAlertName, setNewAlertName] = useState('');
  const [newAlertRegion, setNewAlertRegion] = useState('Arabian Sea');
  const [newAlertParam, setNewAlertParam] = useState('Temperature');
  const [newAlertVal, setNewAlertVal] = useState('30.0');

  // API Keys State
  const [apiKeys, setApiKeys] = useState([
    { id: 'key-1', name: 'OceanIQ Core Telemetry Key', key: 'cyber_sk_live_99a8b7c6d5e4f3a210', created: '2026-08-10' }
  ]);

  // Profile Edit State
  const [editName, setEditName] = useState(user?.name || '');
  const [editBio, setEditBio] = useState(user?.bio || 'Cybertronian Deep Sea Data Specialist');
  const [editInstitution, setEditInstitution] = useState(user?.institution || 'INCOIS / ARGO GDAC Unit');
  const [saveStatus, setSaveStatus] = useState('');

  // Audio State
  const [isAudioMuted, setIsAudioMuted] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsAudioMuted(cyberAudio.isMuted());
    }
  }, []);

  useEffect(() => {
    if (user) {
      setEditName(user.name || '');
      setEditBio(user.bio || 'Cybertronian Deep Sea Data Specialist');
      setEditInstitution(user.institution || 'INCOIS / ARGO GDAC Unit');
    }
  }, [user]);

  // Load Saved Queries from Backend / Local Storage
  const loadSavedQueries = async () => {
    setLoadingQueries(true);
    try {
      if (token) {
        const res = await fetch('http://localhost:8000/api/v1/users/me/queries', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setSavedQueries(data);
          setLoadingQueries(false);
          return;
        }
      }
    } catch {}

    // Fallback local saved queries
    const local = localStorage.getItem('oceaniq_saved_queries');
    if (local) {
      setSavedQueries(JSON.parse(local));
    } else {
      setSavedQueries([
        { id: 1, query_text: 'Arabian Sea monsoon temperature profile 2023', intent: 'trend', parameter: 'Temperature', region: 'Arabian Sea', created_at: '2026-08-15' },
        { id: 2, query_text: 'Compare Bay of Bengal salinity vs Indian Ocean', intent: 'comparison', parameter: 'Salinity', region: 'Bay of Bengal', created_at: '2026-08-14' },
        { id: 3, query_text: 'LSTM 30-day forecast for surface temperature', intent: 'forecast', parameter: 'Temperature', region: 'Global ARGO', created_at: '2026-08-12' }
      ]);
    }
    setLoadingQueries(false);
  };

  useEffect(() => {
    if (isOpen && activeTab === 'queries') {
      loadSavedQueries();
    }
  }, [isOpen, activeTab]);

  if (!isOpen) return null;

  const handleCopy = (text, id) => {
    cyberAudio.playClick();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDeleteQuery = async (id) => {
    cyberAudio.playClick();
    if (token) {
      try {
        await fetch(`http://localhost:8000/api/v1/users/me/queries/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch {}
    }
    const updated = savedQueries.filter(q => q.id !== id);
    setSavedQueries(updated);
    localStorage.setItem('oceaniq_saved_queries', JSON.stringify(updated));
  };

  const handleAddAlert = (e) => {
    e.preventDefault();
    cyberAudio.playEnergonCharge();
    if (!newAlertName) return;
    const newObj = {
      id: `alt-${Date.now()}`,
      name: newAlertName,
      region: newAlertRegion,
      parameter: newAlertParam,
      threshold: `> ${newAlertVal} ${newAlertParam === 'Temperature' ? '°C' : 'PSU'}`,
      status: 'ACTIVE'
    };
    setAlerts([newObj, ...alerts]);
    setNewAlertName('');
  };

  const handleDeleteAlert = (id) => {
    cyberAudio.playClick();
    setAlerts(alerts.filter(a => a.id !== id));
  };

  const handleGenerateApiKey = () => {
    cyberAudio.playEnergonCharge();
    const rand = Math.random().toString(36).substring(2, 12) + Math.random().toString(36).substring(2, 12);
    const newKey = {
      id: `key-${Date.now()}`,
      name: `Cyber Matrix Access Token #${apiKeys.length + 1}`,
      key: `cyber_sk_live_${rand}`,
      created: new Date().toISOString().split('T')[0]
    };
    setApiKeys([...apiKeys, newKey]);
  };

  const handleSaveProfile = () => {
    cyberAudio.playQueryLock();
    const updatedUser = {
      ...(user || {}),
      name: editName,
      bio: editBio,
      institution: editInstitution
    };
    localStorage.setItem('oceaniq_user', JSON.stringify(updatedUser));
    setSaveStatus('Cybertronian credentials updated!');
    setTimeout(() => setSaveStatus(''), 3000);
  };

  const handleToggleFaction = () => {
    const nextFaction = faction === 'autobot' ? 'decepticon' : 'autobot';
    cyberAudio.playFactionShift(nextFaction);
    setFaction(nextFaction);
  };

  const handleExportJSON = () => {
    cyberAudio.playClick();
    const exportData = {
      user: user || { name: 'Cyber Explorer' },
      faction,
      saved_queries: savedQueries,
      telemetry_alerts: alerts,
      exported_at: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `OceanIQ_Cybertron_Vault_${Date.now()}.json`;
    a.click();
  };

  const filteredQueries = savedQueries.filter(q => 
    q.query_text?.toLowerCase().includes(searchFilter.toLowerCase()) ||
    q.region?.toLowerCase().includes(searchFilter.toLowerCase()) ||
    q.parameter?.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const isAutobot = faction === 'autobot';

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6" onClick={onClose}>
      <div 
        className={`w-full max-w-4xl max-h-[90vh] bg-[#040b17] border ${isAutobot ? 'border-cyan-500/30 shadow-cyan-500/20' : 'border-fuchsia-500/30 shadow-fuchsia-500/20'} rounded-2xl shadow-2xl overflow-hidden flex flex-col`}
        onClick={e => e.stopPropagation()}
        style={{ animation: 'slideInUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}
      >
        {/* Header Cyber Bar */}
        <div className={`relative px-6 py-5 border-b border-white/10 flex items-center justify-between ${isAutobot ? 'bg-gradient-to-r from-cyan-950/60 via-blue-950/40 to-slate-950/80' : 'bg-gradient-to-r from-fuchsia-950/60 via-purple-950/40 to-slate-950/80'}`}>
          <div className="flex items-center space-x-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-orbitron font-black text-xl shadow-lg border ${isAutobot ? 'bg-gradient-to-tr from-cyan-500 to-blue-600 text-black border-cyan-300 shadow-cyan-500/30' : 'bg-gradient-to-tr from-fuchsia-600 to-purple-800 text-white border-fuchsia-400 shadow-fuchsia-500/30'}`}>
              {isAutobot ? '🤖' : '🔊'}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-orbitron font-bold text-white tracking-wide">
                  Account Space & Cyber Vault
                </h2>
                <span className={`text-[10px] font-orbitron uppercase px-2 py-0.5 rounded-full border ${isAutobot ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-300' : 'bg-fuchsia-500/10 border-fuchsia-500/40 text-fuchsia-300'}`}>
                  {isAutobot ? 'AUTOBOT MATRIX' : 'DECEPTICON INTEL'}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-rajdhani tracking-wide mt-0.5">
                Cybertronian Ocean Data Command Hub · WMO Telemetry Node
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button 
              onClick={handleToggleFaction}
              className={`px-3 py-1.5 rounded-xl border text-xs font-orbitron font-bold transition-all ${isAutobot ? 'bg-cyan-500/10 hover:bg-cyan-500/20 border-cyan-400/40 text-cyan-300' : 'bg-fuchsia-500/10 hover:bg-fuchsia-500/20 border-fuchsia-400/40 text-fuchsia-300'}`}
              title="Toggle Faction Theme"
            >
              Shift Faction
            </button>
            <button 
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Workspace Body */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Navigation Sidebar */}
          <div className="w-full md:w-64 bg-slate-950/70 border-b md:border-b-0 md:border-r border-white/8 p-3 flex md:flex-col space-x-2 md:space-x-0 md:space-y-1.5 overflow-x-auto md:overflow-x-visible">
            {[
              { id: 'overview', label: 'Tactical Overview', icon: Shield },
              { id: 'queries', label: 'Saved Neural Vault', icon: Star, badge: savedQueries.length },
              { id: 'alerts', label: 'Telemetry Alerts', icon: Bell, badge: alerts.length },
              { id: 'apikeys', label: 'API Matrix Keys', icon: Key, badge: apiKeys.length },
              { id: 'settings', label: 'Cyber Grid Config', icon: Settings },
              { id: 'export', label: 'Vault Exporter', icon: Download },
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => { cyberAudio.playClick(); setActiveTab(tab.id); }}
                  className={`flex-1 md:flex-none flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-rajdhani font-semibold transition-all whitespace-nowrap ${
                    isActive 
                      ? isAutobot 
                        ? 'bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 shadow-md shadow-cyan-500/10' 
                        : 'bg-fuchsia-500/20 border border-fuchsia-400/40 text-fuchsia-300 shadow-md shadow-fuchsia-500/10'
                      : 'text-slate-400 hover:bg-white/5 hover:text-slate-200 border border-transparent'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? (isAutobot ? 'text-cyan-400' : 'text-fuchsia-400') : 'text-slate-500'}`} />
                  <span className="text-sm">{tab.label}</span>
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span className={`ml-auto px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isActive ? (isAutobot ? 'bg-cyan-500/30 text-cyan-200' : 'bg-fuchsia-500/30 text-fuchsia-200') : 'bg-white/10 text-slate-400'
                    }`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Tab Content Panel */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* User Cyber Badge Card */}
                <div className={`glass-card p-6 border ${isAutobot ? 'border-cyan-500/30' : 'border-fuchsia-500/30'} relative overflow-hidden`}>
                  <div className="energon-scanline" />
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center space-x-4">
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-orbitron font-black text-white shadow-xl ${isAutobot ? 'bg-gradient-to-br from-cyan-500 to-blue-700 shadow-cyan-500/30' : 'bg-gradient-to-br from-fuchsia-600 to-purple-900 shadow-fuchsia-500/30'}`}>
                        {user?.name ? user.name.slice(0, 2).toUpperCase() : 'CY'}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="text-lg font-bold text-white font-orbitron">{user?.name || 'Cybertron Explorer'}</h3>
                          <span className="bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-orbitron font-bold px-2.5 py-0.5 rounded-full flex items-center space-x-1">
                            <Award className="w-3 h-3" />
                            <span>RANK: MATRIX VECTOR PRIME</span>
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 font-rajdhani mt-0.5">{user?.email || 'explorer@cybertron.argo'}</p>
                        <p className="text-xs text-cyan-400/80 mt-1 flex items-center space-x-1">
                          <Database className="w-3.5 h-3.5" />
                          <span>{editInstitution}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end">
                      <span className="text-[10px] uppercase font-orbitron text-slate-400">Energon Power</span>
                      <div className="flex items-center space-x-1.5 mt-1">
                        <Zap className="w-4 h-4 text-amber-400 fill-amber-400 animate-pulse" />
                        <span className="text-lg font-orbitron font-bold text-amber-400">100% ONLINE</span>
                      </div>
                    </div>
                  </div>

                  {/* Profile Edit Form */}
                  <div className="mt-6 pt-5 border-t border-white/8 space-y-4">
                    <h4 className="text-xs uppercase font-orbitron font-bold text-slate-400 tracking-wider">Cyber Credentials</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[11px] font-rajdhani font-semibold text-slate-400 block mb-1">Explorer Identifier Name</label>
                        <input
                          type="text"
                          value={editName}
                          onChange={e => setEditName(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-400 transition-colors"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-rajdhani font-semibold text-slate-400 block mb-1">Institution / Research Base</label>
                        <input
                          type="text"
                          value={editInstitution}
                          onChange={e => setEditInstitution(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-400 transition-colors"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="text-[11px] font-rajdhani font-semibold text-slate-400 block mb-1">Research Bio & Mission Parameters</label>
                        <textarea
                          rows={2}
                          value={editBio}
                          onChange={e => setEditBio(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-400 transition-colors resize-none"
                        />
                      </div>
                    </div>
                    {saveStatus && <p className="text-xs text-emerald-400 font-semibold">{saveStatus}</p>}
                    <button
                      onClick={handleSaveProfile}
                      className={`px-4 py-2.5 rounded-xl text-xs font-orbitron font-bold text-white shadow-lg transition-all ${isAutobot ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-cyan-500/20' : 'bg-gradient-to-r from-fuchsia-600 to-purple-800 hover:from-fuchsia-500 hover:to-purple-700 shadow-fuchsia-500/20'}`}
                    >
                      Update Cyber Identity
                    </button>
                  </div>
                </div>

                {/* Tactical Stats Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: 'Saved Queries', val: savedQueries.length, icon: Star, color: 'text-amber-400' },
                    { label: 'Active Alerts', val: alerts.length, icon: Bell, color: 'text-cyan-400' },
                    { label: 'API Keys', val: apiKeys.length, icon: Key, color: 'text-purple-400' },
                    { label: 'Signal Latency', val: '1.2 ms', icon: Radio, color: 'text-emerald-400' },
                  ].map(stat => {
                    const Icon = stat.icon;
                    return (
                      <div key={stat.label} className="glass-card p-4 flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] uppercase font-orbitron text-slate-400">{stat.label}</span>
                          <Icon className={`w-4 h-4 ${stat.color}`} />
                        </div>
                        <span className="text-xl font-orbitron font-bold text-white mt-2">{stat.val}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* SAVED NEURAL VAULT TAB */}
            {activeTab === 'queries' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <h3 className="text-base font-orbitron font-bold text-white flex items-center space-x-2">
                    <Star className="w-4 h-4 text-amber-400" />
                    <span>Saved Neural Query Vault</span>
                  </h3>
                  <input
                    type="text"
                    placeholder="Search queries by region or parameter..."
                    value={searchFilter}
                    onChange={e => setSearchFilter(e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                  />
                </div>

                {filteredQueries.length === 0 ? (
                  <div className="glass-card p-8 text-center space-y-3">
                    <Database className="w-8 h-8 text-slate-600 mx-auto animate-bounce" />
                    <p className="text-sm font-rajdhani text-slate-400">No saved queries match your search.</p>
                    <p className="text-xs text-slate-500">Run any query in the main dashboard and click "Save to Profile".</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredQueries.map(q => (
                      <div key={q.id} className="glass-card p-4 hover:border-cyan-500/40 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 group">
                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-semibold text-white group-hover:text-cyan-300 transition-colors truncate">
                              {q.query_text}
                            </span>
                          </div>
                          <div className="flex items-center space-x-3 text-[11px] font-rajdhani text-slate-400">
                            {q.parameter && <span className="text-cyan-400 font-bold uppercase">{q.parameter}</span>}
                            {q.region && <span className="text-slate-300">{q.region}</span>}
                            <span className="text-slate-500">{q.created_at?.slice(0, 10)}</span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 self-end sm:self-center">
                          <button
                            onClick={() => {
                              onClose();
                              if (onRunQuery) onRunQuery(q.query_text);
                            }}
                            className="flex items-center space-x-1 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-3 py-1.5 rounded-xl text-xs font-orbitron font-bold transition-all"
                          >
                            <RefreshCw className="w-3 h-3" />
                            <span>Re-Run</span>
                          </button>
                          <button
                            onClick={() => handleCopy(q.query_text, q.id)}
                            className="p-2 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl transition-colors border border-white/10"
                            title="Copy query text"
                          >
                            {copiedId === q.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            onClick={() => handleDeleteQuery(q.id)}
                            className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl transition-colors border border-rose-500/20"
                            title="Delete query"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TELEMETRY ALERTS TAB */}
            {activeTab === 'alerts' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-orbitron font-bold text-white flex items-center space-x-2">
                    <Bell className="w-4 h-4 text-cyan-400" />
                    <span>Cyber Float Telemetry Alerts</span>
                  </h3>
                </div>

                {/* Add Alert Form */}
                <form onSubmit={handleAddAlert} className="glass-card p-4 space-y-3 border-cyan-500/30">
                  <h4 className="text-xs uppercase font-orbitron font-bold text-cyan-400">Configure New Alert Sensor</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <input
                      type="text"
                      placeholder="Alert Label (e.g. Temp Anomaly)"
                      value={newAlertName}
                      onChange={e => setNewAlertName(e.target.value)}
                      required
                      className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                    />
                    <select
                      value={newAlertRegion}
                      onChange={e => setNewAlertRegion(e.target.value)}
                      className="bg-[#050f1e] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                    >
                      <option value="Arabian Sea">Arabian Sea</option>
                      <option value="Bay of Bengal">Bay of Bengal</option>
                      <option value="Indian Ocean">Indian Ocean</option>
                      <option value="Equatorial Pacific">Equatorial Pacific</option>
                    </select>
                    <select
                      value={newAlertParam}
                      onChange={e => setNewAlertParam(e.target.value)}
                      className="bg-[#050f1e] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                    >
                      <option value="Temperature">Temperature (°C)</option>
                      <option value="Salinity">Salinity (PSU)</option>
                      <option value="Pressure">Pressure (dbar)</option>
                      <option value="Dissolved Oxygen">Dissolved Oxygen (µmol/kg)</option>
                    </select>
                    <button
                      type="submit"
                      className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-orbitron font-bold text-xs py-2 rounded-xl shadow-lg shadow-cyan-500/20 flex items-center justify-center space-x-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Arm Alert</span>
                    </button>
                  </div>
                </form>

                {/* Active Alerts List */}
                <div className="space-y-3">
                  {alerts.map(alt => (
                    <div key={alt.id} className="glass-card p-4 flex items-center justify-between border-cyan-500/20">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-bold text-white font-rajdhani">{alt.name}</span>
                          <span className="text-[9px] font-orbitron uppercase bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 px-2 py-0.5 rounded-full flex items-center space-x-1">
                            <Radio className="w-2.5 h-2.5 animate-pulse text-emerald-400" />
                            <span>ARMED</span>
                          </span>
                        </div>
                        <p className="text-xs text-slate-400">
                          Target: <strong className="text-white">{alt.region}</strong> · Parameter: <strong className="text-cyan-400">{alt.parameter}</strong> · Threshold: <strong className="text-amber-400">{alt.threshold}</strong>
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteAlert(alt.id)}
                        className="p-2 text-slate-500 hover:text-rose-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* API MATRIX KEYS TAB */}
            {activeTab === 'apikeys' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-orbitron font-bold text-white flex items-center space-x-2">
                      <Key className="w-4 h-4 text-purple-400" />
                      <span>Cybertronian API Matrix Keys</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">Use these secret keys to query ARGO float data via Python or REST API.</p>
                  </div>
                  <button
                    onClick={handleGenerateApiKey}
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-orbitron font-bold text-xs px-3.5 py-2 rounded-xl shadow-lg shadow-purple-500/20 flex items-center space-x-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Generate Key</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {apiKeys.map(k => (
                    <div key={k.id} className="glass-card p-4 space-y-2 border-purple-500/30">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-orbitron font-bold text-white">{k.name}</span>
                        <span className="text-[10px] font-mono text-slate-500">Issued: {k.created}</span>
                      </div>
                      <div className="flex items-center space-x-2 bg-black/40 p-2.5 rounded-xl border border-white/10">
                        <code className="flex-1 font-mono text-xs text-purple-300 truncate">{k.key}</code>
                        <button
                          onClick={() => handleCopy(k.key, k.id)}
                          className="p-1.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-lg transition-colors"
                        >
                          {copiedId === k.id ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CYBER GRID CONFIG TAB */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <h3 className="text-base font-orbitron font-bold text-white flex items-center space-x-2">
                  <Settings className="w-4 h-4 text-cyan-400" />
                  <span>Cyber Grid System Configuration</span>
                </h3>

                <div className="space-y-4">
                  {/* Faction Switcher Card */}
                  <div className="glass-card p-5 space-y-3 border-cyan-500/30">
                    <h4 className="text-xs uppercase font-orbitron font-bold text-white">Faction Matrix Theme</h4>
                    <p className="text-xs text-slate-400">Switch between Matrix Cyan (Autobots) and Dark Energon Violet (Decepticons) UI styles.</p>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => { cyberAudio.playFactionShift('autobot'); setFaction('autobot'); }}
                        className={`p-4 rounded-xl border text-center font-orbitron font-bold transition-all ${isAutobot ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-lg shadow-cyan-500/20' : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'}`}
                      >
                        🤖 AUTOBOT MATRIX
                      </button>
                      <button
                        onClick={() => { cyberAudio.playFactionShift('decepticon'); setFaction('decepticon'); }}
                        className={`p-4 rounded-xl border text-center font-orbitron font-bold transition-all ${!isAutobot ? 'bg-fuchsia-500/20 border-fuchsia-400 text-fuchsia-300 shadow-lg shadow-fuchsia-500/20' : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'}`}
                      >
                        🔊 DECEPTICON INTEL
                      </button>
                    </div>
                  </div>

                  {/* SFX Audio Synthesizer */}
                  <div className="glass-card p-5 flex items-center justify-between border-cyan-500/30">
                    <div>
                      <h4 className="text-xs uppercase font-orbitron font-bold text-white">Web Audio SFX Synthesizer</h4>
                      <p className="text-xs text-slate-400 mt-0.5">Interactive Transformers mechanical click and energon charge audio effects.</p>
                    </div>
                    <button
                      onClick={() => {
                        const muted = cyberAudio.toggleMute();
                        setIsAudioMuted(muted);
                      }}
                      className={`px-4 py-2 rounded-xl border text-xs font-orbitron font-bold transition-all ${!isAudioMuted ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300' : 'bg-rose-500/20 border-rose-400 text-rose-300'}`}
                    >
                      {!isAudioMuted ? '🔊 SFX ENABLED' : '🔇 SFX MUTED'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* EXPORT VAULT TAB */}
            {activeTab === 'export' && (
              <div className="space-y-6">
                <h3 className="text-base font-orbitron font-bold text-white flex items-center space-x-2">
                  <Download className="w-4 h-4 text-emerald-400" />
                  <span>Vault Data Exporter</span>
                </h3>

                <div className="glass-card p-6 text-center space-y-4 border-emerald-500/30">
                  <Sparkles className="w-10 h-10 text-emerald-400 mx-auto animate-pulse" />
                  <div className="space-y-1">
                    <h4 className="text-base font-orbitron font-bold text-white">Export Cyber Vault Telemetry</h4>
                    <p className="text-xs text-slate-400 max-w-md mx-auto">
                      Download all saved queries, telemetry alerts, and profile credentials as a standalone Cybertronian JSON data package.
                    </p>
                  </div>
                  <button
                    onClick={handleExportJSON}
                    className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-orbitron font-bold text-xs px-6 py-3 rounded-xl shadow-lg shadow-emerald-500/20 inline-flex items-center space-x-2 hover:from-emerald-400 hover:to-teal-500 transition-all"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Cyber Vault (.JSON)</span>
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
