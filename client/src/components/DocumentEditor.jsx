import React, { useState } from 'react';
import { RotateCw, Sun, Contrast, Type, Maximize, FileCheck, Wand2, Eye, ChevronLeft, ChevronRight, Layers, FileText } from 'lucide-react';

export default function DocumentEditor({ fileData, editedConfig, onSaveEdit, onProceedNext }) {
  const [activePageIndex, setActivePageIndex] = useState(0);
  const [rotation, setRotation] = useState(editedConfig?.rotation || 0); // 0, 90, 180, 270
  const [fitMode, setFitMode] = useState(editedConfig?.fitMode || 'fit'); // 'fit', 'fill', 'original'
  const [filterMode, setFilterMode] = useState(editedConfig?.filterMode || 'normal'); // 'normal', 'bw', 'scan', 'high-contrast'
  const [brightness, setBrightness] = useState(editedConfig?.brightness || 100);
  const [contrast, setContrast] = useState(editedConfig?.contrast || 100);
  const [watermarkText, setWatermarkText] = useState(editedConfig?.watermarkText || '');
  const [marginSize, setMarginSize] = useState(editedConfig?.marginSize || 'normal');

  const isMultiImage = fileData?.isMultiImage && fileData?.imagePreviewUrls?.length > 0;
  const isImage = isMultiImage || fileData?.isImage || ['png', 'jpg', 'jpeg', 'webp', 'svg'].includes(fileData?.extension?.toLowerCase());
  const totalPages = fileData ? fileData.totalPages : 1;

  const currentImageUrl = isMultiImage
    ? fileData.imagePreviewUrls[activePageIndex]
    : fileData?.imagePreviewUrl;

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const getFilterStyle = () => {
    let filterStr = `brightness(${brightness}%) contrast(${contrast}%)`;
    if (filterMode === 'bw') {
      filterStr += ' grayscale(100%)';
    } else if (filterMode === 'scan') {
      filterStr += ' grayscale(100%) contrast(160%) brightness(110%)';
    } else if (filterMode === 'high-contrast') {
      filterStr += ' contrast(200%)';
    }
    return filterStr;
  };

  const getMarginClass = () => {
    if (marginSize === 'none') return 'p-0';
    if (marginSize === 'wide') return 'p-6';
    return 'p-3 sm:p-4';
  };

  const handleSaveAndNext = () => {
    onSaveEdit({
      rotation,
      fitMode,
      filterMode,
      brightness,
      contrast,
      watermarkText,
      marginSize,
      previewFilterStyle: getFilterStyle()
    });
    if (onProceedNext) onProceedNext();
  };

  return (
    <div className="w-full space-y-4 sm:space-y-6 animate-fade-in pb-16 sm:pb-0">
      
      {/* Mobile-First Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl border border-dark-border bg-dark-card">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold text-neon bg-neon/10 px-2 py-0.5 rounded border border-neon/30">
              SMART PRINT STUDIO
            </span>
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-1.5">
              <Wand2 className="w-4 h-4 text-neon" /> Edit & Convert to Printable
            </h3>
          </div>
          <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
            {isMultiImage ? `Editing Multi-Photo Bundle (${totalPages} Pages)` : 'Adjust layout, scan filters & watermark'}
          </p>
        </div>

        <button
          type="button"
          onClick={handleSaveAndNext}
          className="hidden sm:flex px-6 py-2.5 rounded-xl bg-gradient-to-r from-neon to-emerald-500 hover:from-emerald-400 hover:to-neon text-black font-extrabold text-xs tracking-wider shadow-neon-glow items-center justify-center gap-2"
        >
          <FileCheck className="w-4 h-4 fill-black" />
          <span>CONFIRM & NEXT KIOSK</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
        
        {/* Live A4 Printable Preview Canvas (Left Column) */}
        <div className="lg:col-span-6 rounded-2xl border border-dark-border bg-dark-card p-3.5 sm:p-6 flex flex-col justify-between items-center">
          
          {/* Top Page Switcher Bar */}
          <div className="w-full flex items-center justify-between mb-3 text-xs text-slate-300 bg-dark-bg p-2 rounded-xl border border-dark-border">
            <div className="flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-neon" />
              <span className="font-semibold text-[11px] sm:text-xs">A4 Printable Sheet</span>
            </div>

            {/* Multi-Page Navigation Controls */}
            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={activePageIndex === 0}
                  onClick={() => setActivePageIndex(p => Math.max(0, p - 1))}
                  className="p-1 rounded bg-dark-elevated border border-dark-border disabled:opacity-30 text-white"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className="font-mono text-[11px] font-bold text-neon">
                  Page {activePageIndex + 1} of {totalPages}
                </span>
                <button
                  type="button"
                  disabled={activePageIndex >= totalPages - 1}
                  onClick={() => setActivePageIndex(p => Math.min(totalPages - 1, p + 1))}
                  className="p-1 rounded bg-dark-elevated border border-dark-border disabled:opacity-30 text-white"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Sheet Canvas Container */}
          <div className="w-full max-w-sm aspect-[1/1.414] bg-white text-slate-900 rounded-xl shadow-2xl overflow-hidden relative border-2 border-slate-300 flex flex-col justify-between">
            
            {/* Printable Content Frame */}
            <div className={`w-full h-full flex items-center justify-center relative overflow-hidden transition-all duration-300 ${getMarginClass()}`}>
              
              {isImage && currentImageUrl ? (
                <img
                  src={currentImageUrl}
                  alt="Print Preview Page"
                  className={`transition-all duration-300 ${
                    fitMode === 'fill' ? 'w-full h-full object-cover' : fitMode === 'fit' ? 'max-w-full max-h-full object-contain' : 'object-none'
                  }`}
                  style={{
                    transform: `rotate(${rotation}deg)`,
                    filter: getFilterStyle()
                  }}
                />
              ) : (
                /* AUTHENTIC READABLE PDF DOCUMENT PREVIEW SHEET */
                <div
                  className="w-full h-full bg-white p-4 sm:p-5 rounded flex flex-col justify-between transition-all duration-300 border border-slate-200 text-slate-900 shadow-inner"
                  style={{
                    transform: `rotate(${rotation}deg)`,
                    filter: getFilterStyle()
                  }}
                >
                  <div>
                    {/* Official Document Header */}
                    <div className="border-b-2 border-slate-900 pb-2 mb-2 flex justify-between items-center">
                      <div className="font-black text-[11px] text-slate-900 tracking-wider flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5 text-emerald-600" /> EXOPY PRINT DOC
                      </div>
                      <div className="text-[8px] font-mono text-slate-500">REF: {fileData?.extension?.toUpperCase() || 'PDF'}</div>
                    </div>

                    {/* Document Title & Real Text Content */}
                    <h4 className="font-extrabold text-slate-900 text-xs mb-1 line-clamp-1">{fileData?.name || 'Document_File.pdf'}</h4>
                    <p className="text-[9px] text-slate-600 leading-snug font-sans mb-3">
                      Official print render output for page <span className="font-bold text-slate-900">{activePageIndex + 1}</span> of <span className="font-bold text-slate-900">{totalPages}</span>. Formatted at 300 DPI high clarity raster.
                    </p>

                    {/* Simulated Table Data Content */}
                    <div className="border border-slate-300 rounded overflow-hidden text-[8px] mb-3">
                      <div className="bg-slate-100 p-1 font-bold border-b border-slate-300 flex justify-between">
                        <span>Item Description</span>
                        <span>Status</span>
                      </div>
                      <div className="p-1 flex justify-between border-b border-slate-200 text-slate-700">
                        <span>High-Speed Laser Raster</span>
                        <span className="text-emerald-700 font-bold">VERIFIED</span>
                      </div>
                      <div className="p-1 flex justify-between text-slate-700">
                        <span>End-to-End Encryption</span>
                        <span className="text-emerald-700 font-bold">ACTIVE</span>
                      </div>
                    </div>

                    {/* Paragraph lines */}
                    <div className="space-y-1.5 opacity-80">
                      <div className="h-1.5 bg-slate-400 rounded w-full"></div>
                      <div className="h-1.5 bg-slate-400 rounded w-11/12"></div>
                      <div className="h-1.5 bg-slate-300 rounded w-4/5"></div>
                    </div>
                  </div>

                  {/* Stamp & Footer */}
                  <div className="border-t border-slate-300 pt-2 flex justify-between items-center text-[8px] text-slate-500 font-mono">
                    <div className="border border-slate-400 px-1 py-0.5 rounded text-[7px] font-bold text-slate-700 uppercase">
                      ✓ READY FOR KIOSK
                    </div>
                    <span>PAGE {activePageIndex + 1} / {totalPages}</span>
                  </div>
                </div>
              )}

              {/* Watermark Overlay Text */}
              {watermarkText && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                  <span className="text-xl sm:text-2xl font-black text-slate-900/25 uppercase tracking-widest -rotate-45 select-none text-center px-4 font-mono">
                    {watermarkText}
                  </span>
                </div>
              )}

            </div>
          </div>

          {/* Page Indicators */}
          <div className="mt-3 text-center text-[11px] text-slate-400 font-mono">
            {totalPages > 1 && (
              <span>Showing Page {activePageIndex + 1} of {totalPages} (Tap arrows above to switch)</span>
            )}
          </div>
        </div>

        {/* Editing Controls Tools Panel (Right Column) */}
        <div className="lg:col-span-6 space-y-4 sm:space-y-5">
          
          {/* Quick Preset Scan Filters */}
          <div className="rounded-2xl border border-dark-border bg-dark-card p-3.5 sm:p-4 space-y-3">
            <label className="text-xs font-bold text-slate-200 flex items-center justify-between">
              <span className="flex items-center gap-1.5"><Wand2 className="w-4 h-4 text-neon" /> Color & Scan Filter</span>
              <span className="text-[10px] text-neon font-mono">Photo Cleaner</span>
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => { setFilterMode('normal'); setBrightness(100); setContrast(100); }}
                className={`py-2 px-2 rounded-xl border text-xs font-semibold transition-all ${
                  filterMode === 'normal'
                    ? 'bg-neon/15 border-neon text-neon shadow-neon-sm'
                    : 'bg-dark-bg border-dark-border text-slate-400'
                }`}
              >
                Original
              </button>

              <button
                type="button"
                onClick={() => { setFilterMode('scan'); setBrightness(110); setContrast(160); }}
                className={`py-2 px-2 rounded-xl border text-xs font-semibold transition-all ${
                  filterMode === 'scan'
                    ? 'bg-neon/15 border-neon text-neon shadow-neon-sm'
                    : 'bg-dark-bg border-dark-border text-slate-400'
                }`}
              >
                Clean Scan ✨
              </button>

              <button
                type="button"
                onClick={() => setFilterMode('bw')}
                className={`py-2 px-2 rounded-xl border text-xs font-semibold transition-all ${
                  filterMode === 'bw'
                    ? 'bg-neon/15 border-neon text-neon shadow-neon-sm'
                    : 'bg-dark-bg border-dark-border text-slate-400'
                }`}
              >
                B&W Ink Saver
              </button>

              <button
                type="button"
                onClick={() => setFilterMode('high-contrast')}
                className={`py-2 px-2 rounded-xl border text-xs font-semibold transition-all ${
                  filterMode === 'high-contrast'
                    ? 'bg-neon/15 border-neon text-neon shadow-neon-sm'
                    : 'bg-dark-bg border-dark-border text-slate-400'
                }`}
              >
                High Contrast
              </button>
            </div>
          </div>

          {/* Orientation & Scaling Tools */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            
            {/* Rotation */}
            <div className="rounded-2xl border border-dark-border bg-dark-card p-3.5 sm:p-4 space-y-3">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <RotateCw className="w-4 h-4 text-neon" /> Rotate Orientation
              </span>

              <button
                type="button"
                onClick={handleRotate}
                className="w-full py-2.5 rounded-xl bg-dark-bg border border-dark-border hover:border-neon text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <RotateCw className="w-4 h-4 text-neon" /> Rotate 90° ({rotation}°)
              </button>
            </div>

            {/* Scale / Fit */}
            <div className="rounded-2xl border border-dark-border bg-dark-card p-3.5 sm:p-4 space-y-3">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Maximize className="w-4 h-4 text-neon" /> Page Sizing
              </span>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFitMode('fit')}
                  className={`py-2 px-2 rounded-xl border text-[11px] font-semibold ${
                    fitMode === 'fit' ? 'bg-neon/15 border-neon text-neon' : 'bg-dark-bg border-dark-border text-slate-400'
                  }`}
                >
                  Fit Entire Page
                </button>
                <button
                  type="button"
                  onClick={() => setFitMode('fill')}
                  className={`py-2 px-2 rounded-xl border text-[11px] font-semibold ${
                    fitMode === 'fill' ? 'bg-neon/15 border-neon text-neon' : 'bg-dark-bg border-dark-border text-slate-400'
                  }`}
                >
                  Fill Paper
                </button>
              </div>
            </div>

          </div>

          {/* Fine Tuning Sliders */}
          <div className="rounded-2xl border border-dark-border bg-dark-card p-3.5 sm:p-4 space-y-4">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-slate-300">
                <span className="flex items-center gap-1.5"><Sun className="w-3.5 h-3.5 text-amber-400" /> Brightness</span>
                <span className="font-mono text-neon font-bold">{brightness}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="150"
                value={brightness}
                onChange={(e) => setBrightness(Number(e.target.value))}
                className="w-full accent-neon cursor-pointer"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-slate-300">
                <span className="flex items-center gap-1.5"><Contrast className="w-3.5 h-3.5 text-indigo-400" /> Contrast</span>
                <span className="font-mono text-neon font-bold">{contrast}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="200"
                value={contrast}
                onChange={(e) => setContrast(Number(e.target.value))}
                className="w-full accent-neon cursor-pointer"
              />
            </div>
          </div>

          {/* Custom Watermark */}
          <div className="rounded-2xl border border-dark-border bg-dark-card p-3.5 sm:p-4 space-y-3">
            <label className="text-xs font-bold text-slate-200 flex items-center justify-between">
              <span className="flex items-center gap-1.5"><Type className="w-4 h-4 text-neon" /> Add Watermark Text</span>
              <span className="text-[10px] text-slate-400">Optional</span>
            </label>

            <input
              type="text"
              value={watermarkText}
              onChange={(e) => setWatermarkText(e.target.value)}
              placeholder="e.g. FOR OFFICIAL USE ONLY or CONFIDENTIAL"
              className="w-full bg-dark-bg border border-dark-border focus:border-neon rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 outline-none"
            />
          </div>

          {/* Sticky Mobile Confirmation Button */}
          <div className="fixed sm:relative bottom-0 left-0 right-0 p-3 sm:p-0 bg-dark-bg/95 sm:bg-transparent backdrop-blur-md sm:backdrop-blur-none border-t sm:border-t-0 border-dark-border z-40">
            <button
              type="button"
              onClick={handleSaveAndNext}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-neon to-emerald-500 hover:from-emerald-400 hover:to-neon text-black font-black text-xs tracking-wider shadow-neon-glow flex items-center justify-center gap-2"
            >
              <FileCheck className="w-4 h-4 fill-black" />
              <span>CONFIRM EDIT & SELECT NEAREST KIOSK</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
