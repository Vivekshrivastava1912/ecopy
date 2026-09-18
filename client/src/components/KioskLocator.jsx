import React, { useState } from 'react';
import { MapPin, Navigation, Wifi, WifiOff, AlertTriangle, CheckCircle2, ArrowRight, ShieldAlert } from 'lucide-react';

export default function KioskLocator({ kiosks, selectedKiosk, onSelectKiosk, userDistanceMeters, setUserDistanceMeters }) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredKiosks = kiosks.filter(k => 
    k.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    k.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status, paperLevel) => {
    if (status === 'OFFLINE') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-red-950/80 text-red-400 border border-red-500/40">
          <WifiOff className="w-2.5 h-2.5" /> OFFLINE
        </span>
      );
    }
    if (paperLevel <= 5 || status === 'OUT_OF_PAPER') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950/80 text-amber-400 border border-amber-500/40">
          <AlertTriangle className="w-2.5 h-2.5" /> OUT OF PAPER
        </span>
      );
    }
    if (status === 'LOW_PAPER') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950/60 text-amber-300 border border-amber-500/30">
          <AlertTriangle className="w-2.5 h-2.5" /> LOW PAPER ({paperLevel}%)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950/80 text-neon border border-neon/40">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-neon"></span>
        </span>
        READY
      </span>
    );
  };

  // Find nearest online kiosk recommendation if current is offline
  const nearestOnline = kiosks.find(k => k.status === 'ONLINE');

  return (
    <div className="w-full space-y-5">
      
      {/* Top Search & Simulated GPS Radius Control */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl border border-dark-border bg-dark-card">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <MapPin className="w-5 h-5 text-neon" />
            Indore Kiosk Locator & Status
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">Real-time telemetry, paper/toner sensors, and proximity checks</p>
        </div>

        {/* Distance Proximity Simulation Control */}
        <div className="w-full sm:w-auto flex items-center gap-3 bg-dark-bg px-3 py-2 rounded-xl border border-dark-border">
          <Navigation className="w-4 h-4 text-neon shrink-0 animate-pulse" />
          <div className="text-left">
            <p className="text-[10px] text-slate-400 font-mono">Your Simulated Distance</p>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="5"
                max="200"
                value={userDistanceMeters}
                onChange={(e) => setUserDistanceMeters(Number(e.target.value))}
                className="w-24 accent-neon cursor-pointer"
              />
              <span className={`text-xs font-mono font-bold ${userDistanceMeters <= 50 ? 'text-neon' : 'text-amber-400'}`}>
                {userDistanceMeters}m {userDistanceMeters <= 50 ? '(Within 50m)' : '(Too Far)'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 50 Meter Proximity Alert Banner */}
      {userDistanceMeters > 50 && (
        <div className="p-3.5 rounded-xl bg-amber-950/50 border border-amber-500/50 text-amber-200 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>Location Restriction:</strong> You are currently {userDistanceMeters}m away. The kiosk engine requires you to be within <strong>50 meters</strong> to authorize paper release.
            </span>
          </div>
          <button
            onClick={() => setUserDistanceMeters(25)}
            className="px-2.5 py-1 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold text-[11px] whitespace-nowrap hover:bg-amber-500/30"
          >
            Set 25m
          </button>
        </div>
      )}

      {/* Offline Warning & Nearest Recommendation (EDGE CASE 3) */}
      {selectedKiosk && selectedKiosk.status === 'OFFLINE' && nearestOnline && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/50 text-red-200 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start gap-2">
            <WifiOff className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-red-300 text-sm">Selected Kiosk is Currently Offline!</p>
              <p className="text-slate-300 mt-0.5">
                Hardware connectivity lost at {selectedKiosk.name}. Switch to the nearest available kiosk below.
              </p>
            </div>
          </div>
          <button
            onClick={() => onSelectKiosk(nearestOnline)}
            className="px-3.5 py-2 rounded-xl bg-neon hover:bg-neon-hover text-black font-extrabold text-xs flex items-center gap-1.5 shadow-neon-sm whitespace-nowrap shrink-0"
          >
            <span>Switch to {nearestOnline.name}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Kiosks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredKiosks.map((kiosk) => {
          const isSelected = selectedKiosk && selectedKiosk.kioskId === kiosk.kioskId;
          const isOffline = kiosk.status === 'OFFLINE';

          return (
            <div
              key={kiosk.kioskId}
              onClick={() => !isOffline && onSelectKiosk(kiosk)}
              className={`rounded-2xl border p-4 transition-all duration-200 relative cursor-pointer ${
                isSelected
                  ? 'bg-dark-card border-neon shadow-neon-glow scale-[1.01]'
                  : isOffline
                  ? 'bg-dark-bg/40 border-red-900/40 opacity-75 cursor-not-allowed'
                  : 'bg-dark-card/80 border-dark-border hover:border-slate-500 hover:bg-dark-elevated'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-neon bg-neon/10 px-2 py-0.5 rounded border border-neon/30">
                      {kiosk.kioskId}
                    </span>
                    <h4 className="font-bold text-sm text-white">{kiosk.name}</h4>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-1">{kiosk.location}</p>
                </div>

                {getStatusBadge(kiosk.status, kiosk.paperLevelPercent)}
              </div>

              {/* Hardware Specs Bar */}
              <div className="mt-4 grid grid-cols-3 gap-2 pt-3 border-t border-dark-border/80 text-[11px] text-slate-300">
                <div>
                  <span className="text-[10px] text-slate-400 block font-mono">COLOR SUPPORT</span>
                  <span className={`font-bold ${kiosk.supportsColor ? 'text-neon' : 'text-amber-400'}`}>
                    {kiosk.supportsColor ? 'B&W + Color' : 'B&W Only'}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 block font-mono">PAPER LEVEL</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <div className="w-full bg-dark-bg rounded-full h-1.5 overflow-hidden border border-dark-border">
                      <div
                        className={`h-1.5 rounded-full ${
                          kiosk.paperLevelPercent > 30 ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'
                        }`}
                        style={{ width: `${kiosk.paperLevelPercent}%` }}
                      ></div>
                    </div>
                    <span className="font-mono text-[10px]">{kiosk.paperLevelPercent}%</span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 block font-mono">DISTANCE</span>
                  <span className="font-mono font-bold text-white">{kiosk.distanceMeters}m away</span>
                </div>
              </div>

              {/* Selection Indicator Footer */}
              <div className="mt-3 flex items-center justify-between pt-2">
                <span className="text-[10px] text-slate-400 font-mono">
                  Queue: <strong className="text-slate-200">{kiosk.queueCount} user(s) ahead</strong>
                </span>
                
                {isSelected ? (
                  <span className="text-xs font-extrabold text-neon flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-neon" />
                    <span className="hidden sm:inline">Selected Kiosk</span>
                    <span className="sm:hidden font-mono">Selected</span>
                  </span>
                ) : isOffline ? (
                  <span className="text-xs font-semibold text-red-400">Offline</span>
                ) : (
                  <button
                    type="button"
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neon/10 border border-neon/30 text-neon hover:bg-neon hover:text-black font-bold text-xs transition-colors"
                  >
                    {/* Pulsing green dot badge on mobile */}
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-neon"></span>
                    </span>
                    <span className="hidden sm:inline">Select Kiosk</span>
                    <ArrowRight className="w-3 h-3 hidden sm:inline" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
