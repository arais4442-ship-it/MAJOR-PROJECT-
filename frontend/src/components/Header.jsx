'use client';
import React, { useState, useEffect } from 'react';
import { Waves, ShieldCheck, Cpu, Moon, Sun, Radio, LogIn, Volume2, VolumeX, Zap, UserCheck, Sparkles, User } from 'lucide-react';
import AuthModal from './AuthModal';
import UserProfileMenu from './UserProfileMenu';
import AccountSpaceModal from './AccountSpaceModal';
import { cyberAudio } from '../utils/cyberAudio';

export default function Header({ faction = 'autobot', setFaction, onRunQuery }) {
  const [showAuth, setShowAuth] = useState(false);
  const [authTab, setAuthTab] = useState('login');
  const [showAccountSpace, setShowAccountSpace] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    const u = localStorage.getItem('oceaniq_user');
    const t = localStorage.getItem('oceaniq_token');
    if (u && t) { 
      try { setUser(JSON.parse(u)); } catch {}
      setToken(t); 
    }
    setMuted(cyberAudio.isMuted());
  }, []);

  const handleAuthSuccess = (u, t) => { 
    cyberAudio.playQueryLock();
    setUser(u); 
    setToken(t); 
  };

  const handleLogout = async () => {
    cyberAudio.playClick();
    if (token) {
      try { await fetch('http://localhost:8000/api/v1/auth/logout', { method: 'POST', headers: { Authorization: `Bearer ${token}` } }); } catch {}
    }
    localStorage.removeItem('oceaniq_token');
    localStorage.removeItem('oceaniq_user');
    setUser(null); 
    setToken(null);
  };

  const handleToggleAudio = () => {
    const isMuted = cyberAudio.toggleMute();
    setMuted(isMuted);
  };

  const handleToggleFaction = () => {
    const nextFaction = faction === 'autobot' ? 'decepticon' : 'autobot';
    cyberAudio.playFactionShift(nextFaction);
    setFaction(nextFaction);
  };

  const isAutobot = faction === 'autobot';

  return (
    <>
      <header className={`relative border-b text-white px-6 py-4 flex items-center justify-between sticky top-0 z-50 overflow-hidden backdrop-blur-xl transition-colors ${
        isAutobot ? 'bg-[#030a17]/90 border-cyan-500/30 shadow-lg shadow-cyan-500/10' : 'bg-[#0b0317]/90 border-fuchsia-500/30 shadow-lg shadow-fuchsia-500/10'
      }`}>
        {/* Animated Cybertron Scanline */}
        <div className="energon-scanline" />

        {/* Brand Logo & Cybertron Insignia */}
        <div className="flex items-center space-x-3 relative">
          <div className={`p-2.5 rounded-xl border shadow-lg flex items-center justify-center transition-all ${
            isAutobot ? 'bg-gradient-to-tr from-cyan-500 to-blue-600 border-cyan-300 shadow-cyan-500/30' : 'bg-gradient-to-tr from-fuchsia-600 to-purple-800 border-fuchsia-400 shadow-fuchsia-500/30'
          }`}>
            <span className="text-lg font-orbitron font-black">{isAutobot ? '🤖' : '🔊'}</span>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-orbitron font-black tracking-wider text-gradient">
                OceanIQ
              </h1>
              <span className={`text-[9px] font-orbitron font-bold uppercase px-2 py-0.5 rounded-full border ${
                isAutobot ? 'bg-cyan-500/10 border-cyan-400/40 text-cyan-300' : 'bg-fuchsia-500/10 border-fuchsia-400/40 text-fuchsia-300'
              }`}>
                {isAutobot ? 'AUTOBOT CORE v2.5' : 'DECEPTICON INTEL v2.5'}
              </span>
            </div>
            <p className="text-[11px] text-cyan-400/80 font-rajdhani tracking-wide">
              ARGO Cybertronian Telemetry System · Hybrid ML & LSTM Engine
            </p>
          </div>
        </div>

        {/* Right Command & Auth Actions */}
        <div className="flex items-center space-x-2 sm:space-x-3 relative">
          {/* Audio Synthesizer Toggle */}
          <button 
            onClick={handleToggleAudio}
            className={`p-2 rounded-xl border transition-all ${
              !muted 
                ? isAutobot ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300' : 'bg-fuchsia-500/20 border-fuchsia-400 text-fuchsia-300'
                : 'bg-white/5 border-white/10 text-slate-500'
            }`}
            title={muted ? 'Unmute Cyber SFX' : 'Mute Cyber SFX'}
          >
            {!muted ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Faction Shift Button */}
          <button
            onClick={handleToggleFaction}
            className={`hidden md:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs font-orbitron font-bold transition-all ${
              isAutobot 
                ? 'bg-cyan-500/10 hover:bg-cyan-500/20 border-cyan-500/40 text-cyan-300' 
                : 'bg-fuchsia-500/10 hover:bg-fuchsia-500/20 border-fuchsia-500/40 text-fuchsia-300'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isAutobot ? 'AUTOBOT MODE' : 'DECEPTICON MODE'}</span>
          </button>

          {/* Live Indicator */}
          <div className="hidden sm:flex items-center space-x-1.5 bg-rose-950/60 border border-rose-500/40 px-3 py-1.5 rounded-full text-xs font-orbitron font-bold text-rose-300 animate-pulse">
            <Radio className="w-3 h-3 text-rose-400" />
            <span>GDAC LIVE</span>
          </div>

          {/* Account Space / Auth Section */}
          {user ? (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => { cyberAudio.playClick(); setShowAccountSpace(true); }}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl border text-xs font-orbitron font-bold shadow-lg transition-all ${
                  isAutobot 
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-700 border-cyan-300 text-white shadow-cyan-500/20 hover:from-cyan-500 hover:to-blue-600' 
                    : 'bg-gradient-to-r from-fuchsia-600 to-purple-800 border-fuchsia-300 text-white shadow-fuchsia-500/20 hover:from-fuchsia-500 hover:to-purple-700'
                }`}
              >
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">Account Space</span>
              </button>
              <UserProfileMenu 
                user={user} 
                token={token} 
                onLogout={handleLogout} 
                onOpenAccountSpace={() => setShowAccountSpace(true)} 
              />
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => { cyberAudio.playClick(); setAuthTab('login'); setShowAuth(true); }}
                className="flex items-center space-x-1.5 text-xs font-orbitron font-bold text-slate-200 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-400/40 px-3 py-2 rounded-xl transition-all"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
              <button 
                onClick={() => { cyberAudio.playClick(); setAuthTab('register'); setShowAuth(true); }}
                className={`text-xs font-orbitron font-bold text-white px-3.5 py-2 rounded-xl transition-all shadow-lg ${
                  isAutobot 
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-cyan-500/25' 
                    : 'bg-gradient-to-r from-fuchsia-600 to-purple-800 hover:from-fuchsia-500 hover:to-purple-700 shadow-fuchsia-500/25'
                }`}
              >
                Create Account
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuth}
        onClose={() => setShowAuth(false)}
        onSuccess={handleAuthSuccess}
        defaultTab={authTab}
        faction={faction}
      />

      {/* Account Space Modal */}
      <AccountSpaceModal
        isOpen={showAccountSpace}
        onClose={() => setShowAccountSpace(false)}
        user={user}
        token={token}
        faction={faction}
        setFaction={setFaction}
        onRunQuery={onRunQuery}
      />
    </>
  );
}
