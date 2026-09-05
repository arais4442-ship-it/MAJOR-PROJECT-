'use client';
import React, { useState, useEffect } from 'react';
import Header from './Header';
import LiveStatusBar from './LiveStatusBar';
import CyberHUDBar from './CyberHUDBar';

export default function ClientShell({ children }) {
  const [faction, setFaction] = useState('autobot');

  useEffect(() => {
    const savedFaction = localStorage.getItem('cyber_faction');
    if (savedFaction) {
      setFaction(savedFaction);
    }
  }, []);

  const handleSetFaction = (newFaction) => {
    setFaction(newFaction);
    localStorage.setItem('cyber_faction', newFaction);
  };

  const isAutobot = faction === 'autobot';

  return (
    <div className={`min-h-screen ${isAutobot ? 'theme-autobot' : 'theme-decepticon'} cyber-grid-bg flex flex-col antialiased text-slate-100 transition-colors`}>
      <Header faction={faction} setFaction={handleSetFaction} />
      <LiveStatusBar />
      <div className="max-w-7xl w-full mx-auto px-4 md:px-6 pt-3">
        <CyberHUDBar 
          faction={faction} 
          onSelectPreset={(query) => {
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('oceaniq_run_preset', { detail: { query } }));
            }
          }} 
        />
      </div>
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6">
        {React.cloneElement(children, { faction, setFaction: handleSetFaction })}
      </main>
    </div>
  );
}
