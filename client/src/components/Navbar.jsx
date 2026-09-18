import React from 'react';
import { Printer, MapPin, History, ShieldAlert } from 'lucide-react';

export default function Navbar({ selectedKiosk, onOpenHistory, onOpenKioskSelector, sessionMinutesLeft, isSessionExpired }) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-dark-border/80 glass-panel">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Logo */}
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => window.location.reload()}>
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-neon to-emerald-600 flex items-center justify-center shadow-neon-sm text-black font-black">
            <Printer className="w-5 h-5 text-black" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg sm:text-xl font-extrabold tracking-tight text-white font-mono">EXOPY</span>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-semibold bg-neon/10 text-neon border border-neon/30">
                INDORE
              </span>
            </div>
            <p className="text-[9px] sm:text-[10px] text-slate-400 font-medium hidden xs:block">Automated Kiosk Network</p>
          </div>
        </div>

        {/* Selected Kiosk Pill & Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Active Kiosk Status Badge with Pulse Dot */}
          {selectedKiosk ? (
            <button
              onClick={onOpenKioskSelector}
              className={`flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                selectedKiosk.status === 'ONLINE'
                  ? 'bg-slate-900/80 border-neon/40 text-slate-200 hover:border-neon'
                  : 'bg-red-950/40 border-red-500/40 text-red-300 hover:border-red-400'
              }`}
            >
              {/* Glowing Pulse Dot Icon */}
              <span className="relative flex h-2.5 w-2.5 shrink-0">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  selectedKiosk.status === 'ONLINE' ? 'bg-neon' : 'bg-red-500'
                }`}></span>
                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                  selectedKiosk.status === 'ONLINE' ? 'bg-neon' : 'bg-red-500'
                }`}></span>
              </span>

              {/* Text for desktop / compact token ID for mobile */}
              <div className="text-left">
                <span className="font-mono font-bold text-white text-[11px] block sm:hidden">{selectedKiosk.kioskId}</span>
                <p className="font-semibold text-white truncate max-w-[120px] sm:max-w-[180px] hidden sm:block">{selectedKiosk.name}</p>
                <p className="text-[10px] text-slate-400 hidden sm:block">{selectedKiosk.distanceMeters}m away • {selectedKiosk.supportsColor ? 'B&W + Color' : 'B&W Only'}</p>
              </div>
            </button>
          ) : (
            <button
              onClick={onOpenKioskSelector}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-neon/10 border border-neon/30 text-neon hover:bg-neon/20 text-xs font-semibold"
            >
              {/* Pulse Dot Button on Mobile */}
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-neon"></span>
              </span>
              <MapPin className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Select Kiosk</span>
            </button>
          )}

          {/* Session Privacy Timer Indicator */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-dark-bg border border-dark-border text-[11px] text-slate-400" title="Security Timeout: Uploaded documents automatically clear after 30m of inactivity">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            <span>Session: <span className="font-mono font-medium text-white">{sessionMinutesLeft}m</span></span>
          </div>

          {/* Print History Button */}
          <button
            onClick={onOpenHistory}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-dark-elevated border border-dark-border hover:border-slate-500 text-xs text-slate-200 font-medium transition-colors"
          >
            <History className="w-4 h-4 text-neon" />
            <span className="hidden sm:inline">Print History</span>
          </button>
        </div>

      </div>
    </header>
  );
}
