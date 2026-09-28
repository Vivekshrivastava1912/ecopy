import React, { useState } from 'react';
import { Eye, ChevronLeft, ChevronRight, FileText } from 'lucide-react';

export default function DocumentPreview({ 
  fileData, 
  isColor = false, 
  watermark = '',
  currentPage = 1,
  onPageChange
}) {
  if (!fileData) return null;

  const totalPages = fileData.totalPages || 1;

  return (
    <div className="bg-white border border-gray-200 rounded p-4 space-y-3">
      
      {/* Header with Page Switcher */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-2">
        <h2 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
          <Eye className="w-4 h-4 text-gray-700" />
          Live Document Preview
        </h2>

        {/* Page Switcher */}
        {totalPages > 1 && (
          <div className="flex items-center gap-1.5 text-xs text-gray-600">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              className="p-1 rounded border border-gray-200 hover:bg-gray-100 disabled:opacity-30"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="font-semibold text-gray-900">
              Page {currentPage} of {totalPages}
            </span>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              className="p-1 rounded border border-gray-200 hover:bg-gray-100 disabled:opacity-30"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* A4 Paper Canvas */}
      <div className="w-full flex justify-center py-2 bg-gray-100 rounded border border-gray-200">
        <div 
          className="w-full max-w-[320px] aspect-[1/1.414] bg-white border border-gray-300 rounded shadow-sm relative overflow-hidden flex flex-col justify-between p-4"
          style={{
            filter: isColor ? 'none' : 'grayscale(100%)'
          }}
        >
          {(fileData.extension?.toLowerCase() === 'pdf' || fileData.name?.toLowerCase().endsWith('.pdf')) ? (
            /* Direct PDF Page Viewer */
            <div className="w-full h-full flex items-center justify-center overflow-hidden bg-white rounded">
              <iframe
                src={`${fileData.cloudinaryUrl || fileData.dataUrl}#page=${currentPage}&toolbar=0&navpanes=0`}
                className="w-full h-full border-0 rounded"
                title={`PDF Preview Page ${currentPage}`}
              />
            </div>
          ) : (fileData.pagePreviews?.[currentPage - 1] || fileData.imagePreviewUrls?.[currentPage - 1] || fileData.imagePreviewUrl || fileData.cloudinaryUrl || fileData.previewUrl) ? (
            /* Image Preview */
            <div className="w-full h-full flex items-center justify-center overflow-hidden">
              <img
                src={fileData.pagePreviews?.[currentPage - 1] || fileData.imagePreviewUrls?.[currentPage - 1] || fileData.imagePreviewUrl || fileData.cloudinaryUrl || fileData.previewUrl}
                alt={`Document Preview Page ${currentPage}`}
                className="max-w-full max-h-full object-contain"
              />
            </div>
          ) : (
            /* Document Page Content Preview */
            <div className="w-full h-full flex flex-col justify-between text-xs text-gray-800">
              <div>
                <div className="flex justify-between items-center border-b border-gray-200 pb-1.5 mb-2.5">
                  <div className="font-black text-[11px] text-gray-900 flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5 text-gray-700" /> EXOPY DOCUMENT
                  </div>
                  <span className="text-[9px] text-gray-500 font-mono">
                    {isColor ? 'COLOR' : 'B&W'} • A4
                  </span>
                </div>

                <h4 className="font-bold text-gray-900 text-xs truncate mb-1">
                  {fileData.name}
                </h4>
                <p className="text-[10px] text-gray-600 mb-3 leading-snug">
                  Official render of page {currentPage} of {totalPages}. Prepared for physical laser dispensing.
                </p>

                {/* Table representation */}
                <div className="border border-gray-200 rounded text-[9px] mb-3 overflow-hidden">
                  <div className="bg-gray-50 p-1 font-bold border-b border-gray-200 flex justify-between text-gray-700">
                    <span>Field</span>
                    <span>Status</span>
                  </div>
                  <div className="p-1 flex justify-between border-b border-gray-100 text-gray-600">
                    <span>Color Mode</span>
                    <span className="font-bold">{isColor ? 'Color (₹10)' : 'Black & White (₹2)'}</span>
                  </div>
                  <div className="p-1 flex justify-between text-gray-600">
                    <span>Page Index</span>
                    <span className="font-bold">{currentPage} / {totalPages}</span>
                  </div>
                </div>

                {/* Skeleton paragraph lines */}
                <div className="space-y-1.5 opacity-70">
                  <div className={`h-1.5 rounded w-full ${isColor ? 'bg-blue-400' : 'bg-gray-400'}`}></div>
                  <div className={`h-1.5 rounded w-11/12 ${isColor ? 'bg-green-400' : 'bg-gray-300'}`}></div>
                  <div className="h-1.5 bg-gray-200 rounded w-4/5"></div>
                  <div className="h-1.5 bg-gray-200 rounded w-full"></div>
                </div>
              </div>

              {/* Page Footer */}
              <div className="border-t border-gray-200 pt-1.5 flex justify-between items-center text-[9px] text-gray-500 font-mono">
                <span>VERIFIED RASTER</span>
                <span>PAGE {currentPage} OF {totalPages}</span>
              </div>
            </div>
          )}

          {/* Live Watermark Overlay */}
          {watermark && watermark.trim() && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
              <span className="text-xl sm:text-2xl font-black text-gray-900/20 uppercase tracking-widest -rotate-45 select-none text-center px-4 font-mono break-all">
                {watermark}
              </span>
            </div>
          )}

        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500 pt-1">
        <span>Preview Mode: <strong className="text-gray-800">{isColor ? 'Full Color' : 'Black & White'}</strong></span>
        {watermark ? <span>Watermark: <strong className="text-gray-800">"{watermark}"</strong></span> : <span>No watermark</span>}
      </div>

    </div>
  );
}
