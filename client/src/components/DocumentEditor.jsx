import React, { useState } from 'react';
import { RotateCw, Sun, Contrast, Type, Maximize, FileCheck, Wand2, Eye, ChevronLeft, ChevronRight, FileText } from 'lucide-react';

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

  const pagePreviews = fileData?.pagePreviews || fileData?.imagePreviewUrls || [];
  const currentImageUrl = (pagePreviews && pagePreviews[activePageIndex]) 
    || fileData?.imagePreviewUrl 
    || fileData?.cloudinaryUrl;

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const [isProcessing, setIsProcessing] = useState(false);

  const getFilterStyle = () => {
    let filterStr = `brightness(${brightness}%) contrast(${contrast}%)`;
    if (filterMode === 'bw') {
      filterStr += ' grayscale(100%)';
    } else if (filterMode === 'scan') {
      filterStr += ' grayscale(100%) contrast(150%) brightness(105%)';
    } else if (filterMode === 'high-contrast') {
      filterStr += ' contrast(180%)';
    }
    return filterStr;
  };

  const getMarginClass = () => {
    if (marginSize === 'none') return 'p-0';
    if (marginSize === 'wide') return 'p-6';
    return 'p-3 sm:p-4';
  };

  const handleSaveAndNext = async () => {
    setIsProcessing(true);

    try {
      const isPdf = fileData?.extension?.toLowerCase() === 'pdf' || fileData?.name?.toLowerCase().endsWith('.pdf');

      let updatedCloudinaryUrl = '';
      let updatedPublicId = '';
      let editedDataUrl = fileData?.dataUrl || currentImageUrl || '';

      if (isPdf) {
        // PURE PDF UPLOAD: Upload original PDF data directly to Cloudinary without converting to image
        try {
          const uploadRes = await fetch('/api/print/upload-document', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fileData: fileData?.dataUrl,
              fileName: fileData?.name || 'document.pdf',
              fileSizeMB: fileData?.sizeMB || 1,
              existingPublicId: fileData?.cloudinaryPublicId || '',
              filterMode,
              rotation,
              isBw: filterMode === 'bw' || filterMode === 'scan'
            })
          });
          if (uploadRes.ok) {
            const cloudData = await uploadRes.json();
            updatedCloudinaryUrl = cloudData.cloudinaryUrl;
            updatedPublicId = cloudData.publicId;
          }
        } catch (pdfUploadErr) {
          console.warn('PDF Cloudinary upload notice:', pdfUploadErr);
        }
      } else if (currentImageUrl) {
        // IMAGE TRANSFORMATION: Render filters, rotation, and watermark onto HTML5 Canvas
        const img = new Image();
        img.crossOrigin = 'anonymous';

        const loadedImg = await new Promise((resolve) => {
          img.onload = () => resolve(img);
          img.onerror = () => resolve(null);
          img.src = currentImageUrl;
        });

        if (loadedImg) {
          const isRotated90or270 = rotation === 90 || rotation === 270;
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          const naturalW = loadedImg.naturalWidth || loadedImg.width || 800;
          const naturalH = loadedImg.naturalHeight || loadedImg.height || 1130;

          canvas.width = isRotated90or270 ? naturalH : naturalW;
          canvas.height = isRotated90or270 ? naturalW : naturalH;

          // Background
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Apply CSS Filters (Brightness, Contrast, Grayscale/BW)
          ctx.filter = getFilterStyle();

          // Transform & Rotate
          ctx.save();
          ctx.translate(canvas.width / 2, canvas.height / 2);
          ctx.rotate((rotation * Math.PI) / 180);
          ctx.drawImage(loadedImg, -naturalW / 2, -naturalH / 2, naturalW, naturalH);
          ctx.restore();

          // Watermark
          if (watermarkText && watermarkText.trim()) {
            ctx.filter = 'none';
            ctx.save();
            ctx.font = `bold ${Math.max(28, Math.floor(canvas.width / 14))}px sans-serif`;
            ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.translate(canvas.width / 2, canvas.height / 2);
            ctx.rotate(-Math.PI / 4);
            ctx.fillText(watermarkText.trim().toUpperCase(), 0, 0);
            ctx.restore();
          }

          editedDataUrl = canvas.toDataURL('image/png');

          // Upload transformed image directly to Cloudinary (overwriting original)
          try {
            const uploadRes = await fetch('/api/print/upload-document', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                fileData: editedDataUrl,
                fileName: fileData?.name || 'image.png',
                fileSizeMB: fileData?.sizeMB || 1,
                existingPublicId: fileData?.cloudinaryPublicId || '',
                filterMode,
                rotation,
                isBw: filterMode === 'bw' || filterMode === 'scan'
              })
            });
            if (uploadRes.ok) {
              const cloudData = await uploadRes.json();
              updatedCloudinaryUrl = cloudData.cloudinaryUrl;
              updatedPublicId = cloudData.publicId;
            }
          } catch (uploadErr) {
            console.warn('Edited image Cloudinary upload notice:', uploadErr);
          }
        }
      }

      const updatedPreviews = [...(fileData?.pagePreviews || [])];
      if (updatedPreviews.length > activePageIndex) {
        updatedPreviews[activePageIndex] = updatedCloudinaryUrl || editedDataUrl;
      } else {
        updatedPreviews[0] = updatedCloudinaryUrl || editedDataUrl;
      }

      const updatedFileData = {
        ...fileData,
        imagePreviewUrl: updatedCloudinaryUrl || editedDataUrl,
        pagePreviews: updatedPreviews,
        imagePreviewUrls: updatedPreviews,
        cloudinaryUrl: updatedCloudinaryUrl || fileData?.cloudinaryUrl,
        cloudinaryPublicId: updatedPublicId || fileData?.cloudinaryPublicId,
        dataUrl: editedDataUrl
      };

      onSaveEdit({
        rotation,
        fitMode,
        filterMode,
        brightness,
        contrast,
        watermarkText,
        marginSize,
        previewFilterStyle: getFilterStyle(),
        updatedFileData,
        editedImageUrl: updatedCloudinaryUrl || editedDataUrl
      });

      if (onProceedNext) onProceedNext();
    } catch (err) {
      console.warn('Edit save fallback:', err);
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
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full space-y-4 animate-fade-in pb-12 sm:pb-0">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-lg border border-slate-200 bg-white shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              STUDIO
            </span>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-1.5">
              <Wand2 className="w-4 h-4 text-slate-900" /> Rotate Orientation & Mode
            </h3>
          </div>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
            {isMultiImage ? `Editing Multi-Photo Document (${totalPages} Pages)` : 'Adjust page angle, color filters, and watermark'}
          </p>
        </div>

        <button
          type="button"
          disabled={isProcessing}
          onClick={handleSaveAndNext}
          className="hidden sm:flex px-5 py-2 rounded-md bg-black hover:bg-zinc-800 text-white font-bold text-xs tracking-wider items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
        >
          {isProcessing ? (
            <>
              <div className="w-3.5 h-3.5 rounded-full border-2 border-white/20 border-t-white animate-spin"></div>
              <span>SAVING EDITS...</span>
            </>
          ) : (
            <>
              <FileCheck className="w-4 h-4" />
              <span>PROCEED TO CONFIGURE</span>
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Live A4 Printable Preview Canvas (Left Column) */}
        <div className="lg:col-span-6 rounded-lg border border-slate-200 bg-white p-4 sm:p-5 flex flex-col justify-between items-center shadow-sm">
          
          {/* Top Page Switcher Bar */}
          <div className="w-full flex items-center justify-between mb-3 text-xs text-slate-700 bg-slate-50 p-2 rounded-md border border-slate-200">
            <div className="flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-black" />
              <span className="font-semibold text-[11px] sm:text-xs">A4 Print Output</span>
            </div>

            {/* Multi-Page Navigation Controls */}
            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={activePageIndex === 0}
                  onClick={() => setActivePageIndex(p => Math.max(0, p - 1))}
                  className="p-1 rounded bg-white border border-slate-200 disabled:opacity-30 text-slate-700 hover:text-black"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className="font-mono text-[11px] font-bold text-slate-900">
                  Page {activePageIndex + 1} of {totalPages}
                </span>
                <button
                  type="button"
                  disabled={activePageIndex >= totalPages - 1}
                  onClick={() => setActivePageIndex(p => Math.min(totalPages - 1, p + 1))}
                  className="p-1 rounded bg-white border border-slate-200 disabled:opacity-30 text-slate-700 hover:text-black"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Sheet Canvas Container */}
          <div className="w-full max-w-sm aspect-[1/1.414] bg-white text-slate-900 rounded-md shadow-md overflow-hidden relative border-2 border-slate-300 flex flex-col justify-between">
            
            {/* Printable Content Frame */}
            <div className={`w-full h-full flex items-center justify-center relative overflow-hidden transition-all duration-200 ${getMarginClass()}`}>
              
              {currentImageUrl ? (
                <img
                  src={currentImageUrl}
                  alt={`Print Preview Page ${activePageIndex + 1}`}
                  className={`transition-all duration-200 ${
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
                  className="w-full h-full bg-white p-4 sm:p-5 rounded flex flex-col justify-between transition-all duration-200 border border-slate-200 text-slate-900"
                  style={{
                    transform: `rotate(${rotation}deg)`,
                    filter: getFilterStyle()
                  }}
                >
                  <div>
                    {/* Official Document Header */}
                    <div className="border-b border-slate-900 pb-2 mb-2 flex justify-between items-center">
                      <div className="font-bold text-[11px] text-slate-900 tracking-wider flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5 text-black" /> ECOPY PRINT DOC
                      </div>
                      <div className="text-[8px] font-mono text-slate-500">REF: {fileData?.extension?.toUpperCase() || 'PDF'}</div>
                    </div>

                    {/* Document Title */}
                    <h4 className="font-bold text-slate-900 text-xs mb-1 line-clamp-1">{fileData?.name || 'Document_File.pdf'}</h4>
                    <p className="text-[9px] text-slate-600 leading-snug font-sans mb-3">
                      High clarity raster print output for page <span className="font-bold text-slate-900">{activePageIndex + 1}</span> of <span className="font-bold text-slate-900">{totalPages}</span>.
                    </p>

                    {/* Table Lines */}
                    <div className="border border-slate-200 rounded overflow-hidden text-[8px] mb-3">
                      <div className="bg-slate-100 p-1 font-bold border-b border-slate-200 flex justify-between">
                        <span>Specification</span>
                        <span>Setting</span>
                      </div>
                      <div className="p-1 flex justify-between border-b border-slate-100 text-slate-700">
                        <span>Orientation Angle</span>
                        <span className="font-bold text-slate-900">{rotation}°</span>
                      </div>
                      <div className="p-1 flex justify-between text-slate-700">
                        <span>Color Filter</span>
                        <span className="font-bold text-slate-900 uppercase">{filterMode}</span>
                      </div>
                    </div>

                    {/* Placeholder content lines */}
                    <div className="space-y-1.5 opacity-60">
                      <div className="h-1.5 bg-slate-300 rounded w-full"></div>
                      <div className="h-1.5 bg-slate-300 rounded w-11/12"></div>
                      <div className="h-1.5 bg-slate-200 rounded w-4/5"></div>
                    </div>
                  </div>

                  {/* Stamp & Footer */}
                  <div className="border-t border-slate-200 pt-2 flex justify-between items-center text-[8px] text-slate-500 font-mono">
                    <div className="border border-slate-400 px-1 py-0.5 rounded text-[7px] font-bold text-slate-700 uppercase">
                      ✓ READY FOR PRINT
                    </div>
                    <span>PAGE {activePageIndex + 1} / {totalPages}</span>
                  </div>
                </div>
              )}

              {/* Watermark Overlay Text */}
              {watermarkText && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                  <span className="text-xl sm:text-2xl font-black text-slate-900/20 uppercase tracking-widest -rotate-45 select-none text-center px-4 font-mono">
                    {watermarkText}
                  </span>
                </div>
              )}

            </div>
          </div>

          {/* Page Indicators */}
          <div className="mt-3 text-center text-[11px] text-slate-500 font-mono">
            {totalPages > 1 && (
              <span>Showing Page {activePageIndex + 1} of {totalPages} (Use navigation arrows to preview)</span>
            )}
          </div>
        </div>

        {/* Editing Controls Tools Panel (Right Column) */}
        <div className="lg:col-span-6 space-y-4">
          
          {/* Orientation Rotation */}
          <div className="rounded-lg border border-slate-200 bg-white p-4 space-y-3 shadow-sm">
            <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <RotateCw className="w-4 h-4 text-black" /> Rotate Orientation
            </span>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleRotate}
                className="py-2 px-3 rounded-md bg-black text-white hover:bg-zinc-800 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <RotateCw className="w-3.5 h-3.5" /> Rotate 90°
              </button>

              <div className="py-2 px-3 rounded-md bg-slate-50 border border-slate-200 text-slate-700 text-xs font-mono font-semibold flex items-center justify-center">
                Current: {rotation}° Angle
              </div>
            </div>
          </div>

          {/* Filter Presets */}
          <div className="rounded-lg border border-slate-200 bg-white p-4 space-y-3 shadow-sm">
            <label className="text-xs font-bold text-slate-900 flex items-center justify-between">
              <span className="flex items-center gap-1.5"><Wand2 className="w-4 h-4 text-black" /> Color & Contrast Mode</span>
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => { setFilterMode('normal'); setBrightness(100); setContrast(100); }}
                className={`py-2 px-2 rounded-md border text-xs font-semibold transition-all ${
                  filterMode === 'normal'
                    ? 'bg-black text-white border-black font-bold'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                Original
              </button>

              <button
                type="button"
                onClick={() => { setFilterMode('scan'); setBrightness(105); setContrast(150); }}
                className={`py-2 px-2 rounded-md border text-xs font-semibold transition-all ${
                  filterMode === 'scan'
                    ? 'bg-black text-white border-black font-bold'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                Clean Scan
              </button>

              <button
                type="button"
                onClick={() => setFilterMode('bw')}
                className={`py-2 px-2 rounded-md border text-xs font-semibold transition-all ${
                  filterMode === 'bw'
                    ? 'bg-black text-white border-black font-bold'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                B&W Ink
              </button>

              <button
                type="button"
                onClick={() => setFilterMode('high-contrast')}
                className={`py-2 px-2 rounded-md border text-xs font-semibold transition-all ${
                  filterMode === 'high-contrast'
                    ? 'bg-black text-white border-black font-bold'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                Contrast
              </button>
            </div>
          </div>

          {/* Sizing & Sliders */}
          <div className="rounded-lg border border-slate-200 bg-white p-4 space-y-3.5 shadow-sm">
            <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Maximize className="w-4 h-4 text-black" /> Page Sizing
            </span>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFitMode('fit')}
                className={`py-2 px-2 rounded-md border text-xs font-semibold ${
                  fitMode === 'fit' ? 'bg-black text-white border-black' : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                Fit Entire Page
              </button>
              <button
                type="button"
                onClick={() => setFitMode('fill')}
                className={`py-2 px-2 rounded-md border text-xs font-semibold ${
                  fitMode === 'fill' ? 'bg-black text-white border-black' : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                Fill Paper
              </button>
            </div>

            {/* Brightness / Contrast Sliders */}
            <div className="pt-2 space-y-3 border-t border-slate-100">
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-slate-700">
                  <span className="flex items-center gap-1.5"><Sun className="w-3.5 h-3.5 text-slate-600" /> Brightness</span>
                  <span className="font-mono font-bold text-slate-900">{brightness}%</span>
                </div>
                <input
                  type="range"
                  min="60"
                  max="140"
                  value={brightness}
                  onChange={(e) => setBrightness(Number(e.target.value))}
                  className="w-full accent-black cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs text-slate-700">
                  <span className="flex items-center gap-1.5"><Contrast className="w-3.5 h-3.5 text-slate-600" /> Contrast</span>
                  <span className="font-mono font-bold text-slate-900">{contrast}%</span>
                </div>
                <input
                  type="range"
                  min="60"
                  max="180"
                  value={contrast}
                  onChange={(e) => setContrast(Number(e.target.value))}
                  className="w-full accent-black cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Watermark Input */}
          <div className="rounded-lg border border-slate-200 bg-white p-4 space-y-2 shadow-sm">
            <label className="text-xs font-bold text-slate-900 flex items-center justify-between">
              <span className="flex items-center gap-1.5"><Type className="w-4 h-4 text-black" /> Add Watermark (Optional)</span>
            </label>

            <input
              type="text"
              value={watermarkText}
              onChange={(e) => setWatermarkText(e.target.value)}
              placeholder="e.g. OFFICIAL USE ONLY"
              className="w-full bg-slate-50 border border-slate-200 focus:border-black rounded-md px-3 py-2 text-xs text-slate-900 placeholder-slate-400 outline-none"
            />
          </div>

          {/* Confirmation Button */}
          <div className="pt-1">
            <button
              type="button"
              disabled={isProcessing}
              onClick={handleSaveAndNext}
              className="w-full py-3 rounded-md bg-black hover:bg-zinc-800 text-white font-bold text-xs tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-colors disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin"></div>
                  <span>APPLYING FILTERS & SAVING TO CLOUDINARY...</span>
                </>
              ) : (
                <>
                  <FileCheck className="w-4 h-4" />
                  <span>CONFIRM & CONFIGURE PRINT</span>
                </>
              )}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

