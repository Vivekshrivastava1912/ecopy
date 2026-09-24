import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, Image as ImageIcon, Lock, AlertOctagon, CheckCircle, RefreshCw, X, ShieldCheck, Layers } from 'lucide-react';

export default function FileUploader({ onFileSelected, fileData, onClearFile, onPromptPassword }) {
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

    // Check File Size limit (>25MB)
    if (sizeMB > 25) {
      alert(`Your file "${mainFile.name}" is ${sizeMB.toFixed(1)}MB. Maximum allowed limit is 25MB.`);
      return;
    }

    // Format Support (PDF, DOCX, PNG, JPG, JPEG, WEBP, SVG, TXT)
    const allowedExtensions = ['pdf', 'docx', 'png', 'jpg', 'jpeg', 'webp', 'svg', 'txt'];
    if (!allowedExtensions.includes(ext)) {
      alert(`Format .${ext.toUpperCase()} is not supported. Supported: .PDF, .DOCX, .PNG, .JPG, .WEBP, .SVG, .TXT.`);
      return;
    }

    // Corrupted File Simulation
    if (mainFile.name.toLowerCase().includes('corrupt')) {
      setCorruptedState(true);
      return;
    }

    // Password Protected PDF Detection
    const isEncrypted = mainFile.name.toLowerCase().includes('locked') || mainFile.name.toLowerCase().includes('password');
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
          : (mainFile.name.toLowerCase().includes('large') ? 12 : 3);

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

        if (isEncrypted && onPromptPassword) {
          onPromptPassword(processedFile);
        }
      }
    }, 100);
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
          className={`relative cursor-pointer rounded-lg border-2 border-dashed p-8 sm:p-12 text-center transition-all duration-200 bg-white shadow-sm ${
            isDragging
              ? 'border-black bg-slate-50 scale-[1.005]'
              : 'border-slate-300 hover:border-slate-900 hover:bg-slate-50/70'
          } ${corruptedState ? 'border-red-500 bg-red-50/50' : ''}`}
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
            <div className="py-4 max-w-xs mx-auto">
              <div className="w-10 h-10 mx-auto rounded-md bg-slate-100 border border-slate-300 flex items-center justify-center animate-spin mb-3 text-slate-900">
                <RefreshCw className="w-5 h-5" />
              </div>
              <h4 className="text-xs font-bold text-slate-900">Processing Document...</h4>
              <div className="w-full bg-slate-200 rounded-full h-1.5 mt-3 overflow-hidden">
                <div
                  className="bg-black h-1.5 rounded-full transition-all duration-200"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-[11px] text-slate-600 font-mono mt-2 font-bold">{uploadProgress}% Complete</p>
            </div>
          ) : corruptedState ? (
            <div className="py-4">
              <AlertOctagon className="w-10 h-10 text-red-600 mx-auto mb-2" />
              <h4 className="text-xs font-bold text-red-700">File Processing Failed</h4>
              <p className="text-[11px] text-slate-500 mt-1 max-w-xs mx-auto">
                Unable to read document header. Please re-upload or choose a valid PDF / image.
              </p>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setCorruptedState(false);
                  fileInputRef.current?.click();
                }}
                className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-red-100 text-red-800 text-xs font-semibold hover:bg-red-200"
              >
                <RefreshCw className="w-3 h-3" />
                Retry Upload
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="w-12 h-12 mx-auto rounded-md bg-slate-100 border border-slate-200 flex items-center justify-center text-black">
                <UploadCloud className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  Drag & Drop PDF or Photos here, or <span className="underline decoration-slate-900 underline-offset-4">Browse</span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-1">
                  Supports .PDF, .DOCX, .PNG, .JPG, .WEBP files up to 25MB
                </p>
              </div>
              
              <div className="pt-2 inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-slate-100 text-[11px] text-slate-600 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-black" /> Instant Page Detection & Conversion
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Uploaded Active File Card */
        <div className="rounded-lg border border-slate-200 bg-white p-4 sm:p-5 relative shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-md flex items-center justify-center shrink-0 bg-slate-100 text-slate-900 border border-slate-200">
                {fileData.isEncrypted && !fileData.isUnlocked ? (
                  <Lock className="w-5 h-5" />
                ) : fileData.isMultiImage ? (
                  <Layers className="w-5 h-5" />
                ) : fileData.isImage ? (
                  <ImageIcon className="w-5 h-5" />
                ) : (
                  <FileText className="w-5 h-5" />
                )}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate max-w-[220px] sm:max-w-[340px]">
                    {fileData.name}
                  </h4>
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
                    <CheckCircle className="w-2.5 h-2.5" /> Ready ({fileData.totalPages} Page{fileData.totalPages > 1 ? 's' : ''})
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5 font-mono">
                  {fileData.sizeMB} MB • {fileData.totalPages} Page(s) • {fileData.isMultiImage ? 'Multi-Photo' : `.${fileData.extension?.toUpperCase()}`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={onClearFile}
                className="p-1.5 rounded-md text-slate-400 hover:text-black hover:bg-slate-100 border border-transparent transition-colors"
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

