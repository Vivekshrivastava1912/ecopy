import React, { useEffect } from 'react';
import { AlertCircle, CheckCircle2, AlertTriangle, X } from 'lucide-react';

export default function Toast({ toast, onClose }) {
  if (!toast) return null;

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  const typeStyles = {
    error: 'bg-red-950/90 border-red-500/50 text-red-200 shadow-red-glow',
    warning: 'bg-amber-950/90 border-amber-500/50 text-amber-200 shadow-amber-glow',
    success: 'bg-emerald-950/90 border-neon/50 text-emerald-200 shadow-neon-glow'
  };

  const icons = {
    error: <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />,
    success: <CheckCircle2 className="w-5 h-5 text-neon shrink-0" />
  };

  return (
    <div className={`fixed bottom-6 right-6 z-50 max-w-md w-full p-4 rounded-xl border backdrop-blur-md shadow-xl flex items-start gap-3 transition-all transform animate-bounce-short ${typeStyles[toast.type] || typeStyles.error}`}>
      {icons[toast.type] || icons.error}
      <div className="flex-1 text-xs sm:text-sm">
        <h4 className="font-semibold capitalize tracking-wide">{toast.title || toast.type}</h4>
        <p className="mt-0.5 opacity-90 leading-relaxed">{toast.message}</p>
        {toast.actionText && (
          <button 
            onClick={toast.onAction}
            className="mt-2 px-3 py-1 bg-white/10 hover:bg-white/20 rounded-md font-medium text-xs border border-white/20 transition-colors"
          >
            {toast.actionText}
          </button>
        )}
      </div>
      <button 
        onClick={onClose} 
        className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
