'use client';
import { useState, useCallback } from 'react';

let toastId = 0;

// Global toast state management
let globalSetToasts = null;

export function useToast() {
  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    if (!globalSetToasts) return;
    const id = ++toastId;
    globalSetToasts(prev => [...prev, { id, message, type, duration }]);
    setTimeout(() => {
      globalSetToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  return {
    success: (msg) => addToast(msg, 'success'),
    error: (msg) => addToast(msg, 'error'),
    warning: (msg) => addToast(msg, 'warning'),
    info: (msg) => addToast(msg, 'info'),
  };
}

const TOAST_STYLES = {
  success: 'border-emerald-500/50 bg-emerald-950/80 text-emerald-300',
  error: 'border-rose-500/50 bg-rose-950/80 text-rose-300',
  warning: 'border-amber-500/50 bg-amber-950/80 text-amber-300',
  info: 'border-cyan-500/50 bg-cyan-950/80 text-cyan-300',
};

const TOAST_ICONS = {
  success: '✓',
  error: '✗',
  warning: '⚠',
  info: 'ℹ',
};

export default function ToastContainer() {
  const [toasts, setToasts] = useState([]);
  globalSetToasts = setToasts;

  if (!toasts.length) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col space-y-2 pointer-events-none">
      {toasts.map(toast => (
        <div key={toast.id}
          className={`flex items-center space-x-3 px-4 py-3 rounded-xl border backdrop-blur-xl shadow-2xl text-sm font-medium pointer-events-auto animate-slide-in ${TOAST_STYLES[toast.type]}`}
          style={{ animation: 'slideInRight 0.3s ease-out' }}>
          <span className="text-lg leading-none">{TOAST_ICONS[toast.type]}</span>
          <span>{toast.message}</span>
          <button onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
            className="ml-2 opacity-60 hover:opacity-100 transition-opacity text-xs">✕</button>
        </div>
      ))}
    </div>
  );
}
