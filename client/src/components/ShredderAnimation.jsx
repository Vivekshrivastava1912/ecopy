import React, { useEffect, useRef } from 'react';
import { ShieldCheck, Trash2, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function ShredderAnimation({ fileName, onComplete }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    // Trigger confetti particles
    try {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#00FF87', '#10B981', '#34D399', '#FFFFFF']
      });
    } catch (e) {}

    const timer = setTimeout(() => {
      if (onComplete) onComplete();
    }, 1800); // Fast 1.8s shred animation

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="w-full max-w-lg mx-auto glass-panel-glow border border-neon/40 rounded-3xl p-6 text-center relative overflow-hidden shadow-neon-glow animate-fade-in">
      <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-950/80 border border-neon/50 text-neon flex items-center justify-center mb-4">
        <ShieldCheck className="w-8 h-8 animate-bounce" />
      </div>

      <span className="text-[10px] font-mono font-bold text-neon bg-neon/10 px-2.5 py-1 rounded border border-neon/30 uppercase tracking-widest">
        PRIVACY AUTO-DELETE ENGINE
      </span>

      <h3 className="text-xl font-extrabold text-white mt-2">Permanently Shredding Document...</h3>
      <p className="text-xs text-slate-300 mt-1 max-w-xs mx-auto">
        Deleting <span className="text-neon font-mono font-semibold">{fileName}</span> from cloud storage RAM buffer.
      </p>

      {/* Shredder Graphic Box */}
      <div className="mt-6 relative w-64 mx-auto h-40 bg-dark-bg border border-dark-border rounded-2xl p-4 overflow-hidden flex flex-col items-center justify-between">
        
        {/* Paper falling into shredder teeth */}
        <div className="w-48 bg-white text-slate-900 rounded p-3 shadow-md border border-slate-300 text-[9px] text-left animate-shred origin-top">
          <div className="font-bold text-slate-900 border-b pb-1 mb-1 truncate">{fileName}</div>
          <div className="h-1 bg-slate-300 rounded w-full mb-1"></div>
          <div className="h-1 bg-slate-300 rounded w-4/5"></div>
        </div>

        {/* Shredder Blade Teeth Bar */}
        <div className="w-full bg-dark-card border-t-2 border-neon p-2 z-10 flex justify-between items-center text-[10px] font-mono text-neon">
          <div className="flex items-center gap-1">
            <Trash2 className="w-3.5 h-3.5 text-neon" />
            <span>SHREDDER ACTIVE</span>
          </div>
          <span className="animate-pulse">ZERO TRACE</span>
        </div>
      </div>

      <div className="mt-4 p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-200 text-xs flex items-center justify-center gap-2">
        <Sparkles className="w-4 h-4 text-neon" />
        <span>Document wiped cleanly! No user files stored post-print.</span>
      </div>
    </div>
  );
}
