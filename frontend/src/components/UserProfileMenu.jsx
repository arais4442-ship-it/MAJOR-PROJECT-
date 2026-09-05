'use client';
import React, { useState } from 'react';
import { User, LogOut, Star, ChevronDown, Trash2, Settings, BookOpen, Activity, Key, Shield, Award } from 'lucide-react';
import { cyberAudio } from '../utils/cyberAudio';

export default function UserProfileMenu({ user, token, onLogout, onOpenAccountSpace }) {
  const [open, setOpen] = useState(false);

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'CY';

  return (
    <div className="relative">
      <button 
        onClick={() => { cyberAudio.playClick(); setOpen(!open); }}
        className="flex items-center space-x-2 bg-white/5 hover:bg-white/10 border border-cyan-500/30 hover:border-cyan-400 rounded-xl px-3 py-1.5 transition-all group"
      >
        <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-xs font-orbitron font-bold text-black shadow-md">
          {initials}
        </div>
        <span className="text-xs font-orbitron font-bold text-slate-200 hidden sm:block max-w-[110px] truncate">
          {user?.name?.split(' ')[0]}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-cyan-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div 
            className="absolute right-0 top-12 w-72 bg-[#040c1a] border border-cyan-500/40 rounded-2xl shadow-2xl z-50 overflow-hidden"
            style={{ animation: 'slideInUp 0.2s cubic-bezier(0.16, 1, 0.3, 1)' }}
          >
            {/* User Badge Info */}
            <div className="px-5 py-4 border-b border-white/8 bg-gradient-to-br from-cyan-950/60 to-blue-950/40">
              <div className="flex items-center space-x-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-base font-orbitron font-black text-black shadow-lg flex-shrink-0">
                  {initials}
                </div>
                <div className="min-w-0">
                  <p className="font-orbitron font-bold text-sm text-white truncate">{user?.name}</p>
                  <p className="text-xs text-slate-400 font-rajdhani truncate">{user?.email}</p>
                  <span className="text-[9px] font-orbitron uppercase bg-amber-500/20 border border-amber-500/40 px-2 py-0.5 rounded-full text-amber-300 mt-1 inline-block">
                    RANK: MATRIX VECTOR PRIME
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="p-2 space-y-1">
              <button
                onClick={() => {
                  cyberAudio.playClick();
                  setOpen(false);
                  if (onOpenAccountSpace) onOpenAccountSpace();
                }}
                className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-orbitron font-bold text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 transition-colors"
              >
                <Shield className="w-4 h-4 text-cyan-400" />
                <span>Open Account Space</span>
              </button>

              <button
                onClick={() => {
                  cyberAudio.playClick();
                  setOpen(false);
                  if (onOpenAccountSpace) onOpenAccountSpace();
                }}
                className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-rajdhani font-semibold text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
              >
                <Star className="w-4 h-4 text-amber-400" />
                <span>Saved Neural Vault</span>
              </button>

              <button
                onClick={() => {
                  cyberAudio.playClick();
                  setOpen(false);
                  if (onOpenAccountSpace) onOpenAccountSpace();
                }}
                className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-rajdhani font-semibold text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
              >
                <Key className="w-4 h-4 text-purple-400" />
                <span>API Matrix Keys</span>
              </button>

              <div className="border-t border-white/8 pt-1">
                <button
                  onClick={() => {
                    setOpen(false);
                    onLogout();
                  }}
                  className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-orbitron font-bold text-rose-400 hover:bg-rose-500/10 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out Cybertron</span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
