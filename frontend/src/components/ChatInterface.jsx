'use client';
import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, Sparkles, MessageSquare, Bot, User, Star, Clock, Trash2, Copy, 
  ThumbsUp, ThumbsDown, Cpu, Zap, Shield, Radio, Check
} from 'lucide-react';
import { cyberAudio } from '../utils/cyberAudio';

const SUGGESTED_PROMPTS = [
  "Show temperature trends in Arabian Sea",
  "Compare surface vs deep pressure profiles",
  "Show float profiles in Bay of Bengal",
  "Temperature anomalies this year",
  "Salinity in equatorial Indian Ocean",
];

function parseMarkdown(text) {
  if (!text) return text;
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-bold">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em class="text-cyan-300 font-semibold">$1</em>');
}

export default function ChatInterface({ 
  onExecuteQuery, 
  loading, 
  currentAnswer, 
  currentQuery, 
  filters,
  faction = 'autobot'
}) {
  const [inputText, setInputText] = useState('');
  const [history, setHistory] = useState([]);
  const [saved, setSaved] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [aiEngine, setAiEngine] = useState('ollama'); // 'ollama' | 'optimus' | 'gemini'
  const inputRef = useRef(null);

  const isAutobot = faction === 'autobot';

  useEffect(() => {
    const storedHistory = JSON.parse(localStorage.getItem('oceaniq_history') || '[]');
    const storedSaved = JSON.parse(localStorage.getItem('oceaniq_saved') || '[]');
    setHistory(storedHistory);
    setSaved(storedSaved);
  }, []);

  useEffect(() => {
    if (currentAnswer && !loading) {
      cyberAudio.playQueryLock();
    }
  }, [currentAnswer, loading]);

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!inputText.trim() || loading) return;
    submitQuery(inputText);
  };

  const submitQuery = (query) => {
    cyberAudio.playEnergonCharge();
    const newHistory = [query, ...history.filter(h => h !== query)].slice(0, 10);
    setHistory(newHistory);
    localStorage.setItem('oceaniq_history', JSON.stringify(newHistory));
    onExecuteQuery(query, { ...filters, aiEngine });
    setInputText('');
  };

  const toggleSave = (query) => {
    cyberAudio.playClick();
    const newSaved = saved.includes(query) ? saved.filter(s => s !== query) : [query, ...saved];
    setSaved(newSaved);
    localStorage.setItem('oceaniq_saved', JSON.stringify(newSaved));
  };

  const copyAnswer = () => {
    if (currentAnswer) {
      cyberAudio.playClick();
      navigator.clipboard.writeText(currentAnswer);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const clearHistory = () => {
    cyberAudio.playClick();
    setHistory([]);
    localStorage.removeItem('oceaniq_history');
  };

  return (
    <div className={`glass-card flex flex-col border ${isAutobot ? 'border-cyan-500/30' : 'border-fuchsia-500/30'} relative overflow-hidden`} style={{ minHeight: '440px' }}>
      <div className="energon-scanline" />

      {/* Header Bar */}
      <div className="flex items-center justify-between p-3.5 border-b border-white/8 bg-black/40">
        <div className="flex items-center space-x-2">
          <div className={`p-1.5 rounded-lg border ${isAutobot ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300' : 'bg-fuchsia-500/20 border-fuchsia-400 text-fuchsia-300'}`}>
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-orbitron font-bold text-white tracking-wider">CYBERTRON QUERY CONSOLE</h2>
            <span className="text-[10px] text-cyan-400/80 font-rajdhani">Local Ollama AI + ARGO Telemetry Engine</span>
          </div>
        </div>

        {/* AI Engine Switcher */}
        <div className="flex items-center space-x-1 bg-white/5 p-1 rounded-xl border border-white/10">
          {[
            { id: 'ollama', label: '🦙 Ollama Local', desc: 'Local AI (Ollama - Free & Private)' },
            { id: 'optimus', label: '⚡ Hybrid Core', desc: 'Ollama AI + Telemetry SQL' },
            { id: 'gemini', label: '🌌 Gemini Cloud', desc: 'Google Gemini API' },
          ].map(eng => (
            <button
              key={eng.id}
              onClick={() => { cyberAudio.playClick(); setAiEngine(eng.id); }}
              title={eng.desc}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-orbitron font-bold transition-all ${
                aiEngine === eng.id
                  ? isAutobot 
                    ? 'bg-cyan-500/30 text-cyan-200 border border-cyan-400/40 shadow-sm' 
                    : 'bg-fuchsia-500/30 text-fuchsia-200 border border-fuchsia-400/40 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {eng.label}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-1">
          <button 
            onClick={() => { cyberAudio.playClick(); setShowSaved(!showSaved); setShowHistory(false); }}
            className={`p-1.5 rounded-lg transition-colors ${showSaved ? 'bg-amber-500/20 text-amber-400' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`} 
            title="Saved queries"
          >
            <Star className="w-4 h-4" />
          </button>
          <button 
            onClick={() => { cyberAudio.playClick(); setShowHistory(!showHistory); setShowSaved(false); }}
            className={`p-1.5 rounded-lg transition-colors ${showHistory ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`} 
            title="Query history"
          >
            <Clock className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* History Panel */}
      {showHistory && history.length > 0 && (
        <div className="border-b border-white/8 p-3 space-y-1 bg-black/60">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-orbitron font-bold text-slate-400 uppercase tracking-wider">Recent Cyber Queries</span>
            <button onClick={clearHistory} className="text-xs text-rose-400 hover:text-rose-300 flex items-center space-x-1">
              <Trash2 className="w-3 h-3" /><span>Clear</span>
            </button>
          </div>
          {history.map((q, i) => (
            <div key={i} className="flex items-center justify-between group">
              <button onClick={() => submitQuery(q)} className="flex-1 text-left text-xs font-rajdhani text-slate-300 hover:text-cyan-300 truncate py-1 px-2 rounded hover:bg-white/5 transition-colors">{q}</button>
              <button onClick={() => toggleSave(q)} className={`p-1 opacity-0 group-hover:opacity-100 transition-all ${saved.includes(q) ? 'text-amber-400' : 'text-slate-500 hover:text-amber-400'}`}>
                <Star className="w-3 h-3" fill={saved.includes(q) ? 'currentColor' : 'none'} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Saved Panel */}
      {showSaved && saved.length > 0 && (
        <div className="border-b border-white/8 p-3 space-y-1 bg-black/60">
          <span className="text-[10px] font-orbitron font-bold text-amber-400 uppercase tracking-wider block mb-2">Saved Neural Vault</span>
          {saved.map((q, i) => (
            <div key={i} className="flex items-center justify-between group">
              <button onClick={() => submitQuery(q)} className="flex-1 text-left text-xs font-rajdhani text-amber-300 hover:text-amber-200 truncate py-1 px-2 rounded hover:bg-white/5 transition-colors">{q}</button>
              <button onClick={() => toggleSave(q)} className="p-1 text-amber-400 hover:text-rose-400">
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Main Console Output */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[180px] max-h-[320px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-10 space-y-3">
            <div className="loader" />
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-amber-400 animate-bounce" />
              <p className="text-xs text-cyan-400 font-orbitron font-bold tracking-wider animate-pulse">
                CHARGING ENERGON CORE & EXECUTING QUERY...
              </p>
            </div>
          </div>
        ) : currentQuery ? (
          <>
            {/* User Input bubble */}
            <div className="flex items-start space-x-3 bg-white/4 border border-white/8 p-3 rounded-xl">
              <div className={`p-1.5 rounded-xl mt-0.5 flex-shrink-0 border ${isAutobot ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300' : 'bg-fuchsia-500/20 border-fuchsia-400 text-fuchsia-300'}`}>
                <User className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[10px] text-cyan-400 font-orbitron font-bold uppercase tracking-wider block mb-1">
                  Explorer Input ({aiEngine.toUpperCase()} ENGINE)
                </span>
                <p className="text-sm font-rajdhani font-semibold text-slate-100">{currentQuery}</p>
              </div>
              <button 
                onClick={() => toggleSave(currentQuery)} 
                className={`flex-shrink-0 p-1 transition-colors ${saved.includes(currentQuery) ? 'text-amber-400' : 'text-slate-600 hover:text-amber-400'}`}
              >
                <Star className="w-4 h-4" fill={saved.includes(currentQuery) ? 'currentColor' : 'none'} />
              </button>
            </div>

            {/* AI Response Output */}
            {currentAnswer && (
              <div className={`p-4 rounded-xl border ${isAutobot ? 'bg-cyan-950/20 border-cyan-500/30' : 'bg-fuchsia-950/20 border-fuchsia-500/30'}`}>
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center space-x-2">
                    <div className={`p-1.5 rounded-xl font-orbitron font-bold text-xs ${isAutobot ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-black' : 'bg-gradient-to-r from-fuchsia-600 to-purple-800 text-white'}`}>
                      {isAutobot ? '🤖 OPTIMUS' : '🔊 SOUNDWAVE'}
                    </div>
                    <span className="text-[10px] font-orbitron font-bold text-cyan-300 uppercase tracking-wider">
                      CYBERTRON DATA RESPONSE
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button 
                      onClick={copyAnswer} 
                      className="p-1.5 text-slate-400 hover:text-cyan-300 transition-colors" 
                      title="Copy response"
                    >
                      {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                {copied && <span className="text-xs text-emerald-400 mb-1 block font-rajdhani font-bold">✓ Copied to clipboard</span>}
                <div 
                  className="text-sm font-rajdhani text-slate-200 leading-relaxed space-y-2 whitespace-pre-line"
                  dangerouslySetInnerHTML={{ __html: parseMarkdown(currentAnswer) }} 
                />
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 text-center space-y-3.5">
            <div className="relative">
              <img src="/images/argo-schematic.png" alt="ARGO Telemetry Schematic" className="w-[150px] h-[100px] object-cover rounded-xl border border-cyan-500/20 shadow-lg shadow-cyan-500/10" />
              <div className="absolute -bottom-1 -right-1 bg-cyan-900/90 border border-cyan-400/40 text-cyan-300 text-[8px] font-orbitron font-bold px-1.5 py-0.5 rounded-md animate-pulse">
                SYS_ONLINE
              </div>
            </div>
            <div>
              <p className="text-xs font-orbitron font-bold text-white tracking-widest uppercase">CYBERTRON COMMAND CONSOLE ONLINE</p>
              <p className="text-[11px] text-slate-400 max-w-sm mx-auto font-rajdhani mt-1">
                Execute natural language queries for ARGO float temperature, salinity, and depth profiles.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Console Input Bar */}
      <div className="p-3.5 border-t border-white/8 bg-black/40 space-y-2.5">
        {/* Chips */}
        <div className="flex overflow-x-auto gap-2 pb-1 scrollbar-none">
          {SUGGESTED_PROMPTS.map((prompt, idx) => (
            <button 
              key={idx} 
              onClick={() => submitQuery(prompt)} 
              disabled={loading}
              className="text-xs font-rajdhani font-semibold bg-white/4 hover:bg-white/10 border border-white/10 hover:border-cyan-400/40 text-slate-300 hover:text-white px-3 py-1 rounded-xl transition-all whitespace-nowrap flex-shrink-0"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="relative flex items-center">
          <input 
            ref={inputRef} 
            type="text" 
            value={inputText} 
            onChange={e => setInputText(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) handleSubmit(e); }}
            placeholder="Ask about ocean temperature, salinity, or depth..."
            disabled={loading}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 transition-all pr-12 font-rajdhani" 
          />
          <button 
            type="submit" 
            disabled={loading || !inputText.trim()}
            className={`absolute right-2 text-white p-2 rounded-lg transition-all shadow-lg ${
              isAutobot 
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-cyan-500/25' 
                : 'bg-gradient-to-r from-fuchsia-600 to-purple-800 hover:from-fuchsia-500 hover:to-purple-700 shadow-fuchsia-500/25'
            } disabled:opacity-30`}
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
