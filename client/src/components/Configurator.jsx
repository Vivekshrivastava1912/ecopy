import React, { useState, useEffect } from 'react';
import { Settings, FileText, Layers, Copy, Palette, Check, AlertCircle, Sparkles, Eye, Lock } from 'lucide-react';

export default function Configurator({ 
  fileData, 
  selectedKiosk, 
  onConfigChange, 
  onProceedToPayment,
  showToast 
}) {
  const [pageRangeMode, setPageRangeMode] = useState('all'); // 'all', 'custom'
  const [customRange, setCustomRange] = useState('');
  const [pagesToPrint, setPagesToPrint] = useState(fileData ? fileData.totalPages : 1);
  const [isColor, setIsColor] = useState(false);
  const [isDuplex, setIsDuplex] = useState(false);
  const [copies, setCopies] = useState(1);
  const [pageRangeError, setPageRangeError] = useState('');
  const [isLoadingPreview, setIsLoadingPreview] = useState(true);

  // Simulate PDF preview generation delay with skeleton loader
  useEffect(() => {
    setIsLoadingPreview(true);
    const timer = setTimeout(() => {
      setIsLoadingPreview(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [fileData]);

  // EDGE CASE: B&W vs Color Mismatch Check
  useEffect(() => {
    if (selectedKiosk && !selectedKiosk.supportsColor && isColor) {
      setIsColor(false);
    }
  }, [selectedKiosk, isColor]);

  // Real-time Page Range Validation
  useEffect(() => {
    if (!fileData) return;
    
    if (pageRangeMode === 'all') {
      setPagesToPrint(fileData.totalPages);
      setPageRangeError('');
    } else {
      if (!customRange.trim()) {
        setPageRangeError('Please specify page numbers (e.g. 1-3, 5)');
        setPagesToPrint(0);
        return;
      }

      let calculatedCount = 0;
      let hasError = false;
      let outOfBounds = false;

      const parts = customRange.split(',').map(s => s.trim());
      for (const part of parts) {
        if (part.includes('-')) {
          const [startStr, endStr] = part.split('-');
          const start = parseInt(startStr, 10);
          const end = parseInt(endStr, 10);

          if (isNaN(start) || isNaN(end) || start > end || start < 1) {
            hasError = true;
            break;
          }
          if (end > fileData.totalPages) {
            outOfBounds = true;
          }
          calculatedCount += (Math.min(end, fileData.totalPages) - start + 1);
        } else {
          const pageNum = parseInt(part, 10);
          if (isNaN(pageNum) || pageNum < 1) {
            hasError = true;
            break;
          }
          if (pageNum > fileData.totalPages) {
            outOfBounds = true;
          } else {
            calculatedCount += 1;
          }
        }
      }

      if (hasError) {
        setPageRangeError('Invalid format. Example valid range: 1-3 or 2,4');
        setPagesToPrint(0);
      } else if (outOfBounds) {
        setPageRangeError(`Page range out of bounds! File has total ${fileData.totalPages} pages.`);
        setPagesToPrint(0);
      } else {
        setPageRangeError('');
        setPagesToPrint(calculatedCount);
      }
    }
  }, [pageRangeMode, customRange, fileData]);

  // Calculate live dynamic price
  const ratePerPage = isColor ? 10.0 : 2.0;
  const duplexMultiplier = isDuplex ? 0.85 : 1.0;
  const totalPrice = Number((pagesToPrint * ratePerPage * copies * duplexMultiplier).toFixed(2));

  // Notify parent of updated config (Fix infinite loop by omitting function from deps)
  useEffect(() => {
    if (onConfigChange) {
      onConfigChange({
        pagesToPrint,
        pageRange: pageRangeMode === 'all' ? `1-${fileData?.totalPages}` : customRange,
        isColor,
        isDuplex,
        copies,
        totalPrice,
        hasValidationError: !!pageRangeError || pagesToPrint <= 0
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagesToPrint, pageRangeMode, customRange, isColor, isDuplex, copies, totalPrice, pageRangeError]);

  const kioskSupportsColor = selectedKiosk ? selectedKiosk.supportsColor : true;
  const isKioskOffline = selectedKiosk && selectedKiosk.status === 'OFFLINE';
  const isKioskOutPaper = selectedKiosk && (selectedKiosk.status === 'OUT_OF_PAPER' || selectedKiosk.paperLevelPercent <= 0);

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-neon" />
          <h3 className="text-base font-bold text-white">Print Configuration</h3>
        </div>
        <span className="text-xs text-slate-400 font-mono">Live Price Calculator</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Document Preview Box (Left Column) */}
        <div className="lg:col-span-5 rounded-2xl border border-dark-border bg-dark-card p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-neon" /> Document Preview
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                Page 1 of {fileData ? fileData.totalPages : 1}
              </span>
            </div>

            {/* Skeleton Loader vs Rendered Preview */}
            <div className="aspect-[3/4] w-full rounded-xl bg-dark-bg border border-dark-border overflow-hidden relative flex flex-col items-center justify-center p-4">
              {isLoadingPreview ? (
                <div className="w-full h-full flex flex-col items-center justify-center space-y-3 animate-pulse">
                  <div className="w-12 h-12 rounded-xl bg-dark-elevated flex items-center justify-center text-neon">
                    <FileText className="w-6 h-6 animate-bounce" />
                  </div>
                  <div className="h-3 bg-dark-elevated rounded w-3/4"></div>
                  <div className="h-2 bg-dark-elevated rounded w-1/2"></div>
                  <div className="h-2 bg-dark-elevated rounded w-5/6"></div>
                  <p className="text-[11px] font-mono text-neon font-semibold pt-2">Rendering HD Preview...</p>
                </div>
              ) : fileData?.isEncrypted && !fileData?.isUnlocked ? (
                <div className="text-center p-4">
                  <Lock className="w-10 h-10 text-amber-400 mx-auto mb-2 animate-bounce" />
                  <p className="text-xs font-bold text-amber-300">Preview Locked</p>
                  <p className="text-[11px] text-slate-400 mt-1">Unlock PDF password to view pages</p>
                </div>
              ) : (
                <div className="w-full h-full bg-white text-slate-900 rounded-lg p-5 shadow-2xl overflow-hidden flex flex-col justify-between text-[11px]">
                  <div>
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-3">
                      <div className="font-extrabold text-xs text-slate-900 tracking-wider">EXOPY DOCUMENT</div>
                      <div className="text-[9px] text-slate-500 font-mono">CONFIDENTIAL</div>
                    </div>
                    <h4 className="font-bold text-slate-900 text-xs mb-1 line-clamp-1">{fileData?.name}</h4>
                    <p className="text-[10px] text-slate-600 leading-snug">
                      Automated print job preview for kiosk ID <span className="font-mono font-bold text-emerald-700">{selectedKiosk?.kioskId || 'EX-01'}</span>. Ready for physical printing output.
                    </p>
                    <div className="mt-4 space-y-1.5">
                      <div className={`h-2 rounded ${isColor ? 'bg-indigo-500' : 'bg-slate-300'} w-full`}></div>
                      <div className={`h-2 rounded ${isColor ? 'bg-emerald-500' : 'bg-slate-300'} w-4/5`}></div>
                      <div className={`h-2 rounded ${isColor ? 'bg-amber-500' : 'bg-slate-300'} w-3/4`}></div>
                      <div className="h-2 bg-slate-200 rounded w-full"></div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-200 flex justify-between items-center text-[9px] text-slate-400 font-mono">
                    <span>{isColor ? 'COLOR PRINT' : 'B&W MONOCHROME'}</span>
                    <span>{isDuplex ? 'DUPLEX' : 'SINGLE SIDED'}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-3 text-center">
            <span className="text-[11px] text-slate-400">
              Selected Page Count: <span className="text-white font-bold font-mono">{pagesToPrint}</span> page(s)
            </span>
          </div>
        </div>

        {/* Configuration Controls (Right Column) */}
        <div className="lg:col-span-7 space-y-5">
          
          {/* Page Range Selection */}
          <div className="rounded-2xl border border-dark-border bg-dark-card p-4 space-y-3">
            <label className="text-xs font-bold text-slate-200 flex items-center justify-between">
              <span className="flex items-center gap-1.5"><Layers className="w-4 h-4 text-neon" /> Page Range</span>
              <span className="text-[11px] text-slate-400 font-mono">Total {fileData ? fileData.totalPages : 1} Pages</span>
            </label>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPageRangeMode('all')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
                  pageRangeMode === 'all'
                    ? 'bg-neon/15 border-neon text-neon shadow-neon-sm'
                    : 'bg-dark-bg border-dark-border text-slate-400 hover:text-slate-200'
                }`}
              >
                <Check className={`w-3.5 h-3.5 ${pageRangeMode === 'all' ? 'opacity-100' : 'opacity-0'}`} />
                All Pages (1-{fileData ? fileData.totalPages : 1})
              </button>

              <button
                type="button"
                onClick={() => setPageRangeMode('custom')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
                  pageRangeMode === 'custom'
                    ? 'bg-neon/15 border-neon text-neon shadow-neon-sm'
                    : 'bg-dark-bg border-dark-border text-slate-400 hover:text-slate-200'
                }`}
              >
                Custom Pages
              </button>
            </div>

            {/* Custom Range Input */}
            {pageRangeMode === 'custom' && (
              <div className="pt-1 space-y-1.5">
                <input
                  type="text"
                  value={customRange}
                  onChange={(e) => setCustomRange(e.target.value)}
                  placeholder={`e.g. 1-3 or 2,4 (Max ${fileData ? fileData.totalPages : 1})`}
                  className={`w-full bg-dark-bg border rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 font-mono outline-none transition-colors ${
                    pageRangeError ? 'border-red-500 bg-red-950/20' : 'border-dark-border focus:border-neon'
                  }`}
                />
                {pageRangeError && (
                  <p className="text-[11px] text-red-400 font-semibold flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    {pageRangeError}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Color Mode & Duplex Toggles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Color Mode Option */}
            <div className={`rounded-2xl border p-4 transition-all ${
              !kioskSupportsColor 
                ? 'bg-dark-bg/60 border-dark-border opacity-70' 
                : 'bg-dark-card border-dark-border'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Palette className="w-4 h-4 text-neon" /> Print Color
                </span>
                {!kioskSupportsColor && (
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    B&W Only Kiosk
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 mt-3">
                <button
                  type="button"
                  onClick={() => setIsColor(false)}
                  className={`py-2 px-2.5 rounded-xl border text-xs font-semibold transition-all ${
                    !isColor
                      ? 'bg-emerald-950/60 border-neon text-neon shadow-neon-sm'
                      : 'bg-dark-bg border-dark-border text-slate-400'
                  }`}
                >
                  B&W (₹2/pg)
                </button>

                <button
                  type="button"
                  disabled={!kioskSupportsColor}
                  onClick={() => kioskSupportsColor && setIsColor(true)}
                  className={`py-2 px-2.5 rounded-xl border text-xs font-semibold transition-all ${
                    isColor
                      ? 'bg-indigo-950/80 border-indigo-400 text-indigo-300 shadow-lg'
                      : !kioskSupportsColor
                      ? 'bg-dark-bg/40 border-dark-border/40 text-slate-600 cursor-not-allowed'
                      : 'bg-dark-bg border-dark-border text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Color (₹10/pg)
                </button>
              </div>
            </div>

            {/* Copies & Duplex Selector */}
            <div className="rounded-2xl border border-dark-border bg-dark-card p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Copy className="w-4 h-4 text-neon" /> Copies & Layout
                </span>
                <span className="text-[10px] text-emerald-400 font-mono">15% Duplex Savings</span>
              </div>

              <div className="flex items-center justify-between gap-3 bg-dark-bg p-2 rounded-xl border border-dark-border">
                <span className="text-xs text-slate-300 font-medium">Copies:</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCopies(Math.max(1, copies - 1))}
                    className="w-7 h-7 rounded-lg bg-dark-elevated border border-dark-border text-slate-200 hover:border-slate-400 font-bold text-xs"
                  >
                    -
                  </button>
                  <span className="w-6 text-center text-xs font-bold font-mono text-white">{copies}</span>
                  <button
                    type="button"
                    onClick={() => setCopies(copies + 1)}
                    className="w-7 h-7 rounded-lg bg-dark-elevated border border-dark-border text-slate-200 hover:border-slate-400 font-bold text-xs"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Duplex Toggle */}
              <button
                type="button"
                onClick={() => setIsDuplex(!isDuplex)}
                className={`w-full py-1.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all ${
                  isDuplex 
                    ? 'bg-neon/10 border-neon text-neon' 
                    : 'bg-dark-bg border-dark-border text-slate-400'
                }`}
              >
                <span>Double-Sided (Duplex)</span>
                <span className={`w-4 h-4 rounded-md border flex items-center justify-center ${isDuplex ? 'bg-neon border-neon text-black' : 'border-slate-600'}`}>
                  {isDuplex && <Check className="w-3 h-3 text-black stroke-[3]" />}
                </span>
              </button>
            </div>
          </div>

          {/* Live Price Calculator Summary Bar */}
          <div className="rounded-2xl border border-neon/30 bg-gradient-to-r from-emerald-950/40 via-dark-card to-dark-card p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] text-slate-400 font-mono">Total Estimated Cost</p>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-extrabold text-white font-mono">₹{totalPrice.toFixed(2)}</span>
                <span className="text-[11px] text-slate-400">
                  ({pagesToPrint} pgs × ₹{ratePerPage} × {copies} copy)
                </span>
              </div>
            </div>

            <button
              type="button"
              disabled={!!pageRangeError || pagesToPrint <= 0 || isKioskOffline || isKioskOutPaper}
              onClick={onProceedToPayment}
              className={`px-6 py-3 rounded-xl font-extrabold text-xs tracking-wider transition-all flex items-center gap-2 shadow-lg ${
                !!pageRangeError || pagesToPrint <= 0 || isKioskOffline || isKioskOutPaper
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                  : 'bg-gradient-to-r from-neon to-emerald-500 hover:from-emerald-400 hover:to-neon text-black shadow-neon-glow scale-105'
              }`}
            >
              <Sparkles className="w-4 h-4 fill-black" />
              <span>PAY & PRINT NOW</span>
            </button>
          </div>

          {isKioskOffline && (
            <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/50 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>Selected kiosk is currently <strong>Offline</strong>. Please choose an active online kiosk.</span>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
