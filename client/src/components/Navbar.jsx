import React from 'react';

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Professional Black & White SVG Logo */}
        <div 
          className="flex items-center gap-3 cursor-pointer group select-none" 
          onClick={() => window.location.reload()}
        >
          {/* Professional Monochrome Vector SVG Logo */}
          <div className="w-9 h-9 rounded-md bg-black text-white flex items-center justify-center shadow-sm">
            <svg 
              className="w-5 h-5" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              {/* Modern geometric printer icon */}
              <polyline points="6 9 6 2 18 2 18 9"></polyline>
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
              <rect x="6" y="14" width="12" height="8" rx="1"></rect>
              <circle cx="18" cy="13" r="1" fill="currentColor"></circle>
            </svg>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-black tracking-tight text-slate-950 font-mono">ECOPY</span>
              <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200 uppercase tracking-wide">
                Cloud
              </span>
            </div>
            <p className="text-[10px] text-slate-500 font-medium">Smart Automated Print Engine</p>
          </div>
        </div>

        {/* Minimal Right Indicator */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700">
            <span className="w-2 h-2 rounded-full bg-black"></span>
            <span className="text-[11px] font-mono font-semibold">ONLINE</span>
          </div>
        </div>

      </div>
    </header>
  );
}


