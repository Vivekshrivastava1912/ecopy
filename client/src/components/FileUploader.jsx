import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, Image as ImageIcon, Lock, AlertOctagon, CheckCircle, RefreshCw, X, ShieldCheck, Layers } from 'lucide-react';

export default function FileUploader({ onFileSelected, fileData, onClearFile, onPromptPassword, showToast }) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [corruptedState, setCorruptedState] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const processFileList = (files) => {
    if (!files || files.length === 0) return;

    setCorruptedState(false);
    
    // Check if multiple images selected
    const imageFiles = Array.from(files).filter(f => {
      const ext = f.name.split('.').pop().toLowerCase();
      return ['png', 'jpg', 'jpeg', 'webp', 'svg'].includes(ext);
    });

    const isMultiImageBatch = imageFiles.length > 1;

    const mainFile = files[0];
    const sizeMB = mainFile.size / (1024 * 1024);
    const ext = mainFile.name.split('.').pop().toLowerCase();

    // EDGE CASE 1: File Size Exceeded (>10MB)
    if (sizeMB > 10) {
      showToast({
        type: 'error',
        title: 'File Size Exceeded (>10MB)',
        message: `Your file "${mainFile.name}" is ${sizeMB.toFixed(1)}MB. Maximum allowed limit is 10MB.`,
        actionText: 'Suggest Compression Tool',
        onAction: () => window.open('https://www.ilovepdf.com/compress_pdf', '_blank')
      });
      return;
    }

    // EDGE CASE 2: Format Support (PDF, DOCX, PNG, JPG, JPEG, WEBP, SVG, TXT)
    const allowedExtensions = ['pdf', 'docx', 'png', 'jpg', 'jpeg', 'webp', 'svg', 'txt'];
    if (!allowedExtensions.includes(ext)) {
      showToast({
        type: 'error',
        title: 'Unsupported File Format',
        message: `Format .${ext.toUpperCase()} is not supported. Supported: .PDF, .DOCX, .PNG, .JPG, .WEBP, .SVG, .TXT.`
      });
      return;
    }

    // EDGE CASE 4: Corrupted File Simulation
    if (mainFile.name.toLowerCase().includes('corrupt')) {
      setCorruptedState(true);
      showToast({
        type: 'error',
        title: 'Processing Failed',
        message: 'The file header appears to be damaged or unreadable. Please retry or re-save your file.'
      });
      return;
    }

    // EDGE CASE 3: Password Protected PDF Detection
    const isEncrypted = mainFile.name.toLowerCase().includes('locked') || mainFile.name.toLowerCase().includes('password') || mainFile.name.toLowerCase().includes('bank');
    const isImage = ['png', 'jpg', 'jpeg', 'webp', 'svg'].includes(ext);

    // Create preview URLs for single or multi images
    let imagePreviewUrls = [];
    if (isMultiImageBatch) {
      imagePreviewUrls = imageFiles.map(f => URL.createObjectURL(f));
    } else if (isImage) {
      imagePreviewUrls = [URL.createObjectURL(mainFile)];
    }

    // Progress Bar Simulation
    setIsUploading(true);
    setUploadProgress(0);

    let progress = 0;
    const interval = setInterval(() => {
      progress += 25;
      setUploadProgress(progress);

      if (progress >= 100) {
        clearInterval(interval);
        setIsUploading(false);

        const totalPages = isMultiImageBatch 
          ? imageFiles.length 
          : isImage 
          ? 1 
          : (mainFile.name.toLowerCase().includes('large') ? 15 : 5);

        const processedFile = {
          fileObj: mainFile,
          name: isMultiImageBatch ? `${imageFiles.length}_Photos_Document_Bundle` : mainFile.name,
          sizeMB: Number(sizeMB.toFixed(2)),
          extension: isMultiImageBatch ? 'JPG BUNDLE' : ext,
          isImage,
          isMultiImage: isMultiImageBatch,
          imagePreviewUrls,
          imagePreviewUrl: imagePreviewUrls[0] || null,
          totalPages,
          currentPageIndex: 0,
          isEncrypted,
          isUnlocked: !isEncrypted,
          uploadedAt: new Date()
        };

        onFileSelected(processedFile);

        if (isEncrypted) {
          showToast({
            type: 'warning',
            title: 'Encrypted Document Detected',
            message: 'This PDF is password-protected. Enter password to unlock before sending to kiosk.',
            actionText: 'Unlock Now',
            onAction: () => onPromptPassword(processedFile)
          });
        } else {
          showToast({
            type: 'success',
            title: isMultiImageBatch ? 'Multiple Photos Bundled' : 'File Converted & Loaded',
            message: `Successfully created ${totalPages}-page printable document from selection.`
          });
        }
      }
    }, 120);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFileList(e.dataTransfer.files);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      processFileList(e.target.files);
    }
  };

  return (
    <div className="w-full">
      {/* Upload Box or Active File Card */}
      {!fileData ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-6 sm:p-10 text-center transition-all duration-300 ${
            isDragging
              ? 'border-neon bg-neon/10 scale-[1.01] shadow-neon-glow'
              : 'border-dark-border bg-dark-card/60 hover:border-slate-500 hover:bg-dark-elevated/70'
          } ${corruptedState ? 'border-red-500/80 bg-red-950/20' : ''}`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            multiple
            accept=".pdf,.docx,.png,.jpg,.jpeg,.webp,.svg,.txt"
            className="hidden"
          />

          {isUploading ? (
            <div className="py-6 max-w-sm mx-auto">
              <div className="w-12 h-12 mx-auto rounded-full bg-neon/10 border border-neon/40 flex items-center justify-center animate-spin mb-4">
                <RefreshCw className="w-6 h-6 text-neon" />
              </div>
              <h4 className="text-sm font-semibold text-white">Converting Files & Stitching Pages...</h4>
              <div className="w-full bg-dark-bg rounded-full h-2.5 mt-3 overflow-hidden border border-dark-border">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-neon h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-xs text-neon font-mono mt-2 font-bold">{uploadProgress}% Complete</p>
            </div>
          ) : corruptedState ? (
            <div className="py-4">
              <AlertOctagon className="w-12 h-12 text-red-500 mx-auto mb-3 animate-pulse" />
              <h4 className="text-sm font-bold text-red-400">Processing Failed (Corrupted File)</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                Unable to read file headers. The document might be corrupted.
              </p>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setCorruptedState(false);
                  fileInputRef.current?.click();
                }}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/20 border border-red-500/50 text-red-300 hover:bg-red-500/30 text-xs font-semibold"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Retry Uploading File
              </button>
            </div>
          ) : (
            <div>
              <div className="w-14 h-14 mx-auto rounded-2xl bg-dark-bg border border-dark-border flex items-center justify-center mb-4 text-neon shadow-neon-sm group-hover:scale-110 transition-transform">
                <UploadCloud className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-white">
                Drag & Drop PDF or <span className="text-neon">Multiple Photos</span> here, or <span className="text-neon underline underline-offset-4">Browse</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1.5">
                Upload single PDF or select multiple image files at once (.PNG, .JPG, .WEBP)
              </p>
              
              <div className="mt-4 inline-flex items-center gap-3 px-3 py-1.5 rounded-lg bg-dark-bg/80 border border-dark-border text-[11px] text-slate-400">
                <span className="flex items-center gap-1 text-emerald-400"><ShieldCheck className="w-3.5 h-3.5" /> Auto-Stitched Pages</span>
                <span>•</span>
                <span>Mobile-Optimized Engine</span>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Uploaded Active File Card */
        <div className="rounded-2xl border border-dark-border bg-dark-card p-4 sm:p-5 relative overflow-hidden glass-panel-glow">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${
                fileData.isEncrypted && !fileData.isUnlocked 
                  ? 'bg-amber-950/40 border-amber-500/50 text-amber-400' 
                  : 'bg-emerald-950/40 border-neon/50 text-neon'
              }`}>
                {fileData.isEncrypted && !fileData.isUnlocked ? (
                  <Lock className="w-6 h-6 animate-pulse" />
                ) : fileData.isMultiImage ? (
                  <Layers className="w-6 h-6 text-neon" />
                ) : fileData.isImage ? (
                  <ImageIcon className="w-6 h-6 text-neon" />
                ) : (
                  <FileText className="w-6 h-6 text-neon" />
                )}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-white truncate max-w-[200px] sm:max-w-[320px]">
                    {fileData.name}
                  </h4>
                  {fileData.isEncrypted && !fileData.isUnlocked ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      <Lock className="w-2.5 h-2.5" /> Locked PDF
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-neon/10 text-neon border border-neon/30">
                      <CheckCircle className="w-2.5 h-2.5" /> Ready ({fileData.totalPages} Page Document)
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-1 font-mono">
                  {fileData.sizeMB} MB • {fileData.totalPages} Total Page(s) • {fileData.isMultiImage ? 'Multi-Photo Bundle' : `.${fileData.extension.toUpperCase()}`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {fileData.isEncrypted && !fileData.isUnlocked && (
                <button
                  type="button"
                  onClick={() => onPromptPassword(fileData)}
                  className="px-3 py-1.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30 text-xs font-semibold transition-colors flex items-center gap-1"
                >
                  <Lock className="w-3.5 h-3.5" />
                  Unlock
                </button>
              )}
              <button
                type="button"
                onClick={onClearFile}
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/30 transition-colors"
                title="Remove File"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
