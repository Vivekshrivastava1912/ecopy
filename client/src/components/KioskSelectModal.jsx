import React from 'react';
import { MapPin, Wifi, WifiOff, AlertTriangle, CheckCircle2, X } from 'lucide-react';

export default function KioskSelectModal({ isOpen, onClose, kiosks, selectedKiosk, onSelectKiosk }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      <div className="max-w-xl w-full glass-panel border border-dark-border rounded-2xl sm:rounded-3xl p-4 sm:p-6 relative overflow-hidden shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
        
        <div className="flex items-center justify-between border-b border-dark-border pb-3 shrink-0">
          <div className="flex items-center gap-2 font-sans">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-neon/10 border border-neon/30 text-neon flex items-center justify-center">
              <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-lg font-bold text-white">Select Smart Kiosk (Indore)</h3>
              <p className="text-[10px] sm:text-xs text-slate-400">Choose active printing kiosk near your location</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-xl border border-transparent hover:border-dark-border"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Kiosks List */}
        <div className="space-y-2.5 overflow-y-auto pr-1 flex-1">
          {kiosks.map((kiosk) => {
            const isSelected = selectedKiosk && selectedKiosk.kioskId === kiosk.kioskId;
            const isOffline = kiosk.status === 'OFFLINE';

            return (
              <div
                key={kiosk.kioskId}
                onClick={() => {
                  if (!isOffline) {
                    onSelectKiosk(kiosk);
                    onClose();
                  }
                }}
                className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border transition-all duration-200 cursor-pointer flex items-center justify-between gap-3 ${
                  isSelected
                    ? 'bg-dark-card border-neon shadow-neon-glow'
                    : isOffline
                    ? 'bg-dark-bg/40 border-red-950/40 opacity-70 cursor-not-allowed'
                    : 'bg-dark-bg border-dark-border hover:border-slate-500 hover:bg-dark-elevated'
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[10px] font-bold text-neon bg-neon/10 px-1.5 py-0.5 rounded border border-neon/30">
                      {kiosk.kioskId}
                    </span>
                    <h4 className="font-bold text-xs sm:text-sm text-white truncate">{kiosk.name}</h4>
                  </div>
                  <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5 truncate">{kiosk.location}</p>
                  <div className="flex items-center gap-2 mt-1 text-[10px] font-mono text-slate-300">
                    <span>{kiosk.distanceMeters}m away</span>
                    <span>•</span>
                    <span className={kiosk.supportsColor ? 'text-neon font-semibold' : 'text-amber-400 font-semibold'}>
                      {kiosk.supportsColor ? 'B&W + Color' : 'B&W Only'}
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  {isOffline ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[9px] font-bold bg-red-950/80 text-red-400 border border-red-500/40">
                      <WifiOff className="w-2.5 h-2.5" /> OFFLINE
                    </span>
                  ) : isSelected ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[9px] font-bold bg-neon/10 text-neon border border-neon/40">
                      <CheckCircle2 className="w-3 h-3 text-neon" /> Selected
                    </span>
                  ) : (
                    <button
                      type="button"
                      className="px-2.5 py-1 rounded-lg bg-neon/10 border border-neon/30 text-neon font-bold text-[11px] hover:bg-neon hover:text-black transition-colors"
                    >
                      Select
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-1 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-dark-elevated hover:bg-dark-hover border border-dark-border text-slate-200 text-xs font-semibold"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
