import React from 'react';
import { Palette, Type, Layers, Copy, Check, AlertCircle } from 'lucide-react';

export default function PrintConfig({
  totalPages = 1,
  isColor,
  setIsColor,
  watermark,
  setWatermark,
  pageMode,
  setPageMode,
  customRange,
  setCustomRange,
  pagesToPrint,
  isDuplex,
  setIsDuplex,
  copies,
  setCopies,
  totalPrice,
  rangeError,
  onProceedToPayment
}) {
  const ratePerPage = isColor ? 10.0 : 2.0;

  return (
    <div className="bg-white border border-gray-200 rounded p-4 space-y-5">
      
      <div className="flex items-center justify-between border-b border-gray-100 pb-2">
        <h2 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
          <span className="w-5 h-5 rounded-full bg-gray-900 text-white flex items-center justify-center text-xs">2</span>
          Print Settings & Options
        </h2>
        <span className="text-xs text-gray-500">Customize Output</span>
      </div>

      {/* Feature 1: Black & White vs Color */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-gray-800 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Palette className="w-4 h-4 text-gray-700" /> Color Mode
          </span>
          <span className="text-xs text-gray-500 font-normal">
            {isColor ? '₹10 per page' : '₹2 per page'}
          </span>
        </label>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setIsColor(false)}
            className={`p-2.5 rounded border text-left transition-all ${
              !isColor
                ? 'bg-gray-900 text-white border-gray-900 shadow-sm'
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs">Black & White</span>
              <span className="text-[11px] opacity-80">₹2 / page</span>
            </div>
            <p className="text-[10px] mt-0.5 opacity-80">Best for notes & regular documents</p>
          </button>

          <button
            type="button"
            onClick={() => setIsColor(true)}
            className={`p-2.5 rounded border text-left transition-all ${
              isColor
                ? 'bg-gray-900 text-white border-gray-900 shadow-sm'
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs">Full Color</span>
              <span className="text-[11px] opacity-80">₹10 / page</span>
            </div>
            <p className="text-[10px] mt-0.5 opacity-80">Best for certificates, photos & charts</p>
          </button>
        </div>
      </div>

      {/* Feature 2: Watermark */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
            <Type className="w-4 h-4 text-gray-700" /> Watermark Text
          </label>
          <span className="text-xs text-gray-400 font-normal">Optional</span>
        </div>

        <input
          type="text"
          value={watermark}
          onChange={(e) => setWatermark(e.target.value)}
          placeholder="e.g. CONFIDENTIAL, DRAFT, or Your Name"
          className="w-full bg-white border border-gray-200 focus:border-gray-900 rounded px-3 py-2 text-xs text-gray-900 placeholder-gray-400 outline-none transition-colors"
        />

        {/* Quick presets */}
        <div className="flex items-center gap-1.5 pt-0.5">
          <span className="text-[10px] text-gray-400">Presets:</span>
          {['CONFIDENTIAL', 'ORIGINAL', 'DRAFT', 'STUDENT COPY'].map(preset => (
            <button
              key={preset}
              type="button"
              onClick={() => setWatermark(watermark === preset ? '' : preset)}
              className={`px-2 py-0.5 rounded text-[10px] font-mono border transition-colors ${
                watermark === preset
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
              }`}
            >
              {preset}
            </button>
          ))}
        </div>
      </div>

      {/* Feature 3: Page Selection (All vs Custom e.g. 1-5, 8, 40) */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-gray-700" /> Page Range to Print
          </label>
          <span className="text-xs text-gray-500 font-mono">
            Total {totalPages} Pages
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setPageMode('all')}
            className={`p-2 rounded border text-xs font-semibold text-left transition-all ${
              pageMode === 'all'
                ? 'bg-gray-900 text-white border-gray-900 shadow-sm'
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
            }`}
          >
            All Pages (1-{totalPages})
          </button>

          <button
            type="button"
            onClick={() => setPageMode('custom')}
            className={`p-2 rounded border text-xs font-semibold text-left transition-all ${
              pageMode === 'custom'
                ? 'bg-gray-900 text-white border-gray-900 shadow-sm'
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
            }`}
          >
            Custom Range (e.g. 1-5, 8)
          </button>
        </div>

        {pageMode === 'custom' && (
          <div className="pt-1 space-y-1">
            <input
              type="text"
              value={customRange}
              onChange={(e) => setCustomRange(e.target.value)}
              placeholder={`Enter page numbers e.g. 1-3, 5, 8 (Max ${totalPages})`}
              className={`w-full bg-white border rounded px-3 py-1.5 text-xs text-gray-900 placeholder-gray-400 font-mono outline-none ${
                rangeError ? 'border-red-500 bg-red-50 text-red-900' : 'border-gray-200 focus:border-gray-900'
              }`}
            />
            {rangeError && (
              <p className="text-[11px] text-red-600 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {rangeError}
              </p>
            )}
            <p className="text-[10px] text-gray-400">
              Selected: <strong className="text-gray-800">{pagesToPrint}</strong> page(s)
            </p>
          </div>
        )}
      </div>

      {/* Feature 4: Double-Sided (Duplex) & Copies */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-gray-100">
        
        {/* Duplex Toggle */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-800">Print Sides</label>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={() => setIsDuplex(false)}
              className={`py-1.5 px-2 rounded border text-xs font-semibold ${
                !isDuplex ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-200'
              }`}
            >
              Single-Sided
            </button>
            <button
              type="button"
              onClick={() => setIsDuplex(true)}
              className={`py-1.5 px-2 rounded border text-xs font-semibold ${
                isDuplex ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-200'
              }`}
            >
              Double-Sided (Duplex)
            </button>
          </div>
        </div>

        {/* Copies Counter */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-800">Number of Copies</label>
          <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded px-3 py-1">
            <span className="text-xs text-gray-600 font-medium">Copies:</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCopies(Math.max(1, copies - 1))}
                className="w-6 h-6 rounded bg-white border border-gray-200 text-gray-700 font-bold text-xs hover:bg-gray-100"
              >
                -
              </button>
              <span className="w-6 text-center text-xs font-bold text-gray-900">{copies}</span>
              <button
                type="button"
                onClick={() => setCopies(copies + 1)}
                className="w-6 h-6 rounded bg-white border border-gray-200 text-gray-700 font-bold text-xs hover:bg-gray-100"
              >
                +
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Feature 5: Live Price Breakdown & Proceed */}
      <div className="pt-3 border-t border-gray-200 space-y-3">
        <div className="flex items-center justify-between text-xs text-gray-600">
          <span>Cost Calculation:</span>
          <span className="font-mono text-gray-800">
            {pagesToPrint} page(s) × ₹{ratePerPage} × {copies} copy {isDuplex ? '(15% Duplex Off)' : ''}
          </span>
        </div>

        <div className="flex items-center justify-between p-3 rounded bg-gray-900 text-white">
          <div>
            <span className="text-[10px] text-gray-300 uppercase block font-medium">Total Amount to Pay</span>
            <span className="text-2xl font-black font-mono">₹{totalPrice.toFixed(2)}</span>
          </div>

          <button
            type="button"
            disabled={pagesToPrint <= 0 || !!rangeError}
            onClick={onProceedToPayment}
            className="px-6 py-2.5 rounded bg-white hover:bg-gray-100 text-gray-900 font-bold text-xs transition-colors shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Pay ₹{totalPrice.toFixed(2)} & Print
          </button>
        </div>
      </div>

    </div>
  );
}
