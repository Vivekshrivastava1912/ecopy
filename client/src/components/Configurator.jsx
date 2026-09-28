import React, { useState, useEffect } from 'react';
import { Settings, FileText, Layers, Copy, Palette, Check, AlertCircle, Sparkles, Eye, ChevronLeft, ChevronRight } from 'lucide-react';

export default function Configurator({ 
  fileData, 
  editedConfig,
  onConfigChange, 
  onProceedToPayment
}) {
  const [pageRangeMode, setPageRangeMode] = useState('all'); // 'all', 'custom'
  const [customRange, setCustomRange] = useState('');
  const [pagesToPrint, setPagesToPrint] = useState(fileData ? fileData.totalPages : 1);
  const [isColor, setIsColor] = useState(false);
  const [isDuplex, setIsDuplex] = useState(false);
  const [copies, setCopies] = useState(1);
  const [pageRangeError, setPageRangeError] = useState('');
  const [isLoadingPreview, setIsLoadingPreview] = useState(true);
  const [previewPageIndex, setPreviewPageIndex] = useState(0);

  const pagePreviewsList = fileData?.pagePreviews || fileData?.imagePreviewUrls || [];

  useEffect(() => {
    setIsLoadingPreview(true);
    setPreviewPageIndex(0);
    const timer = setTimeout(() => {
      setIsLoadingPreview(false);
    }, 200);
    return () => clearTimeout(timer);
  }, [fileData]);

  // Real-time Page Range Validation
  useEffect(() => {
    if (!fileData) return;
    
    if (pageRangeMode === 'all') {
      setPagesToPrint(fileData.totalPages);
      setPageRangeError('');
    } else {
      if (!customRange.trim()) {
        setPageRangeError('Specify page numbers (e.g. 1-3 or 2, 4)');
        setPagesToPrint(0);
        return;
      }

      let calculatedCount = 0;
      let hasError = false;
      let outOfBounds = false;

      const parts = customRange.split(',').map(s => s.trim());
      for (const part of parts) {
        if (!part) continue;
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
        setPageRangeError('Invalid format. Example valid: 1-3 or 2, 4');
        setPagesToPrint(0);
      } else if (outOfBounds) {
        setPageRangeError(`Exceeds document limit! (Total: ${fileData.totalPages} pages)`);
        setPagesToPrint(0);
      } else {
        setPageRangeError('');
        setPagesToPrint(calculatedCount);
      }
    }
  }, [pageRangeMode, customRange, fileData]);

  const ratePerPage = isColor ? 10.0 : 2.0;
  const duplexMultiplier = isDuplex ? 0.85 : 1.0;
  const totalPrice = Number((pagesToPrint * ratePerPage * copies * duplexMultiplier).toFixed(2));

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
  }, [pagesToPrint, pageRangeMode, customRange, isColor, isDuplex, copies, totalPrice, pageRangeError]);

  return (
    <div className="w-full space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings className="w-4 h-4 text-black" />
          <h3 className="text-sm sm:text-base font-bold text-slate-900">Print Configuration & Options</h3>
        </div>
        <span className="text-xs text-slate-500 font-mono">Live Cost Calculator</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Document Preview Box (Left Column) */}
        <div className="lg:col-span-5 rounded-lg border border-slate-200 bg-white p-4 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-black" /> Live Preview
              </span>
              <span className="text-[10px] font-mono text-slate-800 font-bold bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                {editedConfig?.rotation || 0}°
              </span>
            </div>

            {/* Skeleton Loader vs Rendered Preview */}
            <div className="aspect-[3/4] w-full rounded-md bg-slate-50 border border-slate-200 overflow-hidden relative flex flex-col items-center justify-center p-3">
              {isLoadingPreview ? (
                <div className="w-full h-full flex flex-col items-center justify-center space-y-2 animate-pulse">
                  <div className="w-8 h-8 rounded-md bg-slate-200 flex items-center justify-center text-slate-600">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="h-2 bg-slate-200 rounded w-1/2"></div>
                </div>
              ) : (pagePreviewsList[previewPageIndex] || fileData?.imagePreviewUrl || (fileData?.cloudinaryUrl ? (fileData.cloudinaryUrl.endsWith('.pdf') ? fileData.cloudinaryUrl.replace(/\.pdf$/i, '.jpg') : fileData.cloudinaryUrl) : null)) ? (
                /* Crisp Responsive Document Preview (Works on Mobile & Desktop) */
                <div className="w-full h-full flex flex-col items-center justify-center overflow-hidden relative">
                  <img
                    src={pagePreviewsList[previewPageIndex] || fileData?.imagePreviewUrl || (fileData?.cloudinaryUrl ? (fileData.cloudinaryUrl.endsWith('.pdf') ? fileData.cloudinaryUrl.replace(/\.pdf$/i, '.jpg') : fileData.cloudinaryUrl) : '')}
                    alt={`Document Page ${previewPageIndex + 1}`}
                    className="max-w-full max-h-full object-contain rounded shadow-sm select-none transition-all duration-200"
                    style={{
                      transform: `rotate(${editedConfig?.rotation || 0}deg)`,
                      filter: isColor ? 'none' : 'grayscale(100%) contrast(120%)'
                    }}
                  />
                  {/* Page Navigation Controls if multi-page */}
                  {pagePreviewsList.length > 1 && (
                    <div className="absolute bottom-2 inset-x-2 flex items-center justify-between pointer-events-none">
                      <button
                        type="button"
                        disabled={previewPageIndex === 0}
                        onClick={(e) => { e.stopPropagation(); setPreviewPageIndex(prev => Math.max(0, prev - 1)); }}
                        className="pointer-events-auto p-1.5 rounded-full bg-black/75 hover:bg-black text-white disabled:opacity-20 shadow-md backdrop-blur-xs transition-opacity cursor-pointer"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </button>
                      <span className="pointer-events-auto px-2.5 py-0.5 rounded-full bg-black/75 text-white text-[10px] font-mono shadow-md backdrop-blur-xs">
                        Page {previewPageIndex + 1} of {pagePreviewsList.length}
                      </span>
                      <button
                        type="button"
                        disabled={previewPageIndex >= pagePreviewsList.length - 1}
                        onClick={(e) => { e.stopPropagation(); setPreviewPageIndex(prev => Math.min(pagePreviewsList.length - 1, prev + 1)); }}
                        className="pointer-events-auto p-1.5 rounded-full bg-black/75 hover:bg-black text-white disabled:opacity-20 shadow-md backdrop-blur-xs transition-opacity cursor-pointer"
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              ) : (fileData?.extension?.toLowerCase() === 'pdf' || fileData?.name?.toLowerCase().endsWith('.pdf')) ? (
                /* Fallback Native PDF Viewer */
                <div 
                  className="w-full h-full flex items-center justify-center overflow-hidden bg-white rounded transition-all duration-200 relative"
                  style={{
                    filter: isColor ? 'none' : 'grayscale(100%) contrast(120%)'
                  }}
                >
                  <iframe
                    src={`${fileData.dataUrl || fileData.cloudinaryUrl || fileData.imagePreviewUrl}#page=${previewPageIndex + 1}&view=Fit&toolbar=0&navpanes=0&scrollbar=0`}
                    className="w-full h-full rounded shadow-sm border-0"
                    style={{
                      filter: isColor ? 'none' : 'grayscale(100%) contrast(120%)'
                    }}
                    title="PDF Live Preview"
                  />
                </div>
              ) : (
                <div className="w-full h-full bg-white text-slate-900 rounded-sm p-4 shadow-sm overflow-hidden flex flex-col justify-between text-[11px] border border-slate-200">
                  <div>
                    <div className="flex items-center justify-between border-b border-slate-200 pb-1.5 mb-2">
                      <div className="font-bold text-[10px] text-slate-900 tracking-wider">ECOPY CLOUD DOC</div>
                      <div className="text-[8px] font-mono text-slate-400">READY</div>
                    </div>
                    <h4 className="font-bold text-slate-900 text-xs mb-1 line-clamp-1">{fileData?.name}</h4>
                    <p className="text-[10px] text-slate-500 leading-snug">
                      Configured for <span className="font-bold text-slate-900">{pagesToPrint} page(s)</span>.
                    </p>
                    <div className="mt-3 space-y-1.5 opacity-60">
                      <div className="h-1.5 bg-slate-300 rounded w-full"></div>
                      <div className="h-1.5 bg-slate-200 rounded w-4/5"></div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-[9px] text-slate-500 font-mono">
                    <span className="font-bold">{isColor ? 'COLOR PRINT' : 'B&W MONOCHROME'}</span>
                    <span>{isDuplex ? 'DUPLEX' : 'SINGLE SIDED'}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-2 text-center">
            <span className="text-[11px] text-slate-500">
              Selected Pages: <span className="text-slate-900 font-bold font-mono">{pagesToPrint}</span> of {fileData?.totalPages || 1}
            </span>
          </div>
        </div>

        {/* Configuration Controls (Right Column) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Page Range Selection (Custom Page option) */}
          <div className="rounded-lg border border-slate-200 bg-white p-4 space-y-3 shadow-sm">
            <label className="text-xs font-bold text-slate-900 flex items-center justify-between">
              <span className="flex items-center gap-1.5"><Layers className="w-4 h-4 text-black" /> Page Selection</span>
              <span className="text-[11px] text-slate-500 font-mono">Total {fileData ? fileData.totalPages : 1} Pages</span>
            </label>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPageRangeMode('all')}
                className={`py-2 px-3 rounded-md border text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
                  pageRangeMode === 'all'
                    ? 'bg-black text-white border-black font-bold'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Check className={`w-3.5 h-3.5 ${pageRangeMode === 'all' ? 'opacity-100' : 'opacity-0'}`} />
                All Pages (1-{fileData ? fileData.totalPages : 1})
              </button>

              <button
                type="button"
                onClick={() => setPageRangeMode('custom')}
                className={`py-2 px-3 rounded-md border text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
                  pageRangeMode === 'custom'
                    ? 'bg-black text-white border-black font-bold'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                Custom Pages
              </button>
            </div>

            {/* Custom Range Input */}
            {pageRangeMode === 'custom' && (
              <div className="pt-1 space-y-1 animate-fade-in">
                <input
                  type="text"
                  value={customRange}
                  onChange={(e) => setCustomRange(e.target.value)}
                  placeholder={`e.g. 1-3 or 2, 4 (Max pages: ${fileData ? fileData.totalPages : 1})`}
                  className={`w-full bg-slate-50 border rounded-md px-3 py-2 text-xs text-slate-900 placeholder-slate-400 font-mono outline-none transition-colors ${
                    pageRangeError ? 'border-red-500 bg-red-50/50' : 'border-slate-200 focus:border-black'
                  }`}
                />
                {pageRangeError ? (
                  <p className="text-[11px] text-red-600 font-semibold flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    {pageRangeError}
                  </p>
                ) : (
                  <p className="text-[10px] text-slate-400 font-mono">
                    Enter single pages separated by commas or hyphen range (e.g. 1-3, 5)
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Color Mode & Layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            
            {/* Black & White vs Color Option */}
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5 mb-2.5">
                <Palette className="w-4 h-4 text-black" /> Color Mode
              </span>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setIsColor(false)}
                  className={`py-2 px-2.5 rounded-md border text-xs font-semibold transition-all ${
                    !isColor
                      ? 'bg-black text-white border-black font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  B&W (₹2/pg)
                </button>

                <button
                  type="button"
                  onClick={() => setIsColor(true)}
                  className={`py-2 px-2.5 rounded-md border text-xs font-semibold transition-all ${
                    isColor
                      ? 'bg-black text-white border-black font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  Color (₹10/pg)
                </button>
              </div>
            </div>

            {/* Copies & Duplex */}
            <div className="rounded-lg border border-slate-200 bg-white p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Copy className="w-4 h-4 text-black" /> Copies & Layout
                </span>
                <span className="text-[10px] text-slate-500 font-mono">15% Duplex Off</span>
              </div>

              <div className="flex items-center justify-between gap-2 bg-slate-50 p-1.5 rounded-md border border-slate-200">
                <span className="text-xs text-slate-700 font-medium">Copies:</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCopies(Math.max(1, copies - 1))}
                    className="w-6 h-6 rounded bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold text-xs"
                  >
                    -
                  </button>
                  <span className="w-5 text-center text-xs font-bold font-mono text-slate-900">{copies}</span>
                  <button
                    type="button"
                    onClick={() => setCopies(copies + 1)}
                    className="w-6 h-6 rounded bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold text-xs"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Duplex Toggle */}
              <button
                type="button"
                onClick={() => setIsDuplex(!isDuplex)}
                className={`w-full py-1.5 px-2.5 rounded-md border text-xs font-semibold flex items-center justify-between transition-all ${
                  isDuplex 
                    ? 'bg-slate-900 text-white border-slate-900' 
                    : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <span>Double-Sided</span>
                <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${isDuplex ? 'bg-white text-black' : 'border-slate-400'}`}>
                  {isDuplex && <Check className="w-3 h-3 text-black stroke-[3]" />}
                </span>
              </button>
            </div>
          </div>

          {/* Price Bar & Payment Button */}
          <div className="rounded-lg border border-slate-200 bg-white p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
            <div>
              <p className="text-[11px] text-slate-500 font-mono">Total Payable Amount</p>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">₹{totalPrice.toFixed(2)}</span>
                <span className="text-[11px] text-slate-500">
                  ({pagesToPrint} pgs × ₹{ratePerPage} × {copies} copy)
                </span>
              </div>
            </div>

            <button
              type="button"
              disabled={!!pageRangeError || pagesToPrint <= 0}
              onClick={onProceedToPayment}
              className={`w-full sm:w-auto px-6 py-3 rounded-md font-bold text-xs tracking-wider transition-all flex items-center justify-center gap-2 shadow-sm ${
                !!pageRangeError || pagesToPrint <= 0
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-200'
                  : 'bg-black hover:bg-zinc-800 text-white cursor-pointer'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>PAY ₹{totalPrice.toFixed(2)} & PRINT</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}


