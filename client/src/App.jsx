import React, { useState } from 'react';
import Navbar from './components/Navbar';
import FileUploader from './components/FileUploader';
import DocumentEditor from './components/DocumentEditor';
import Configurator from './components/Configurator';
import PaymentModal from './components/PaymentModal';
import ExecutionScreen from './components/ExecutionScreen';
import PasswordPromptModal from './components/PasswordPromptModal';
import Footer from './components/Footer';
import { Upload, Wand2, Sliders, CheckCheck, FileText, Sparkles, Shield, RotateCw } from 'lucide-react';

export default function App() {
  // Application State
  const [activeStep, setActiveStep] = useState('UPLOAD'); // 'UPLOAD', 'EDIT', 'CONFIG', 'EXECUTION'
  const [fileData, setFileData] = useState(null);
  const [editedConfig, setEditedConfig] = useState(null);
  const [printConfig, setPrintConfig] = useState({
    pagesToPrint: 1,
    pageRange: '1-1',
    isColor: false,
    isDuplex: false,
    copies: 1,
    totalPrice: 2.00,
    hasValidationError: false
  });

  // Modals & Overlay States
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [activeJobData, setActiveJobData] = useState(null);

  const handleFileSelected = (fileObj) => {
    setFileData(fileObj);
    if (!fileObj.isEncrypted) {
      setActiveStep('EDIT'); // Go to Smart Edit Studio
    }
  };

  const handlePromptPassword = () => {
    setIsPasswordModalOpen(true);
  };

  const handlePasswordUnlockSuccess = () => {
    if (fileData) {
      setFileData({
        ...fileData,
        isUnlocked: true
      });
      setActiveStep('EDIT');
    }
  };

  const handleSaveEdit = (editedObj) => {
    setEditedConfig(editedObj);
    setActiveStep('CONFIG');
  };

  const handlePaymentSuccess = (savedJob) => {
    setIsPaymentModalOpen(false);
    
    const newJob = savedJob || {
      jobId: 'JOB-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
      fileName: fileData ? fileData.name : 'document.pdf',
      pages: printConfig.pagesToPrint,
      cost: printConfig.totalPrice,
      status: 'COMPLETED',
      createdAt: new Date().toLocaleString()
    };

    setActiveJobData(newJob);
    setActiveStep('EXECUTION');
  };

  const handleResetWorkflow = () => {
    setFileData(null);
    setEditedConfig(null);
    setActiveJobData(null);
    setActiveStep('UPLOAD');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      
      {/* Top Navbar */}
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        
        {/* 4-Step Responsive Workflow Step Indicator Bar with Minimal Radius */}
        <div className="w-full max-w-3xl mx-auto bg-white p-2 rounded-lg border border-slate-200 flex items-center justify-between text-xs font-semibold overflow-x-auto shadow-sm">
          <button
            onClick={() => setActiveStep('UPLOAD')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all whitespace-nowrap cursor-pointer ${
              activeStep === 'UPLOAD' 
                ? 'bg-black text-white font-bold' 
                : 'text-slate-600 hover:text-black hover:bg-slate-100'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>1. Upload</span>
          </button>
          
          <div className="w-3 h-[1px] bg-slate-300 shrink-0"></div>

          <button
            disabled={!fileData}
            onClick={() => fileData && setActiveStep('EDIT')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all whitespace-nowrap ${
              activeStep === 'EDIT' 
                ? 'bg-black text-white font-bold' 
                : !fileData 
                ? 'text-slate-300 cursor-not-allowed' 
                : 'text-slate-600 hover:text-black hover:bg-slate-100 cursor-pointer'
            }`}
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>2. Rotate & Mode</span>
          </button>

          <div className="w-3 h-[1px] bg-slate-300 shrink-0"></div>

          <button
            disabled={!fileData}
            onClick={() => fileData && setActiveStep('CONFIG')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all whitespace-nowrap ${
              activeStep === 'CONFIG' 
                ? 'bg-black text-white font-bold' 
                : !fileData 
                ? 'text-slate-300 cursor-not-allowed' 
                : 'text-slate-600 hover:text-black hover:bg-slate-100 cursor-pointer'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>3. Custom Pages & Pay</span>
          </button>

          <div className="w-3 h-[1px] bg-slate-300 shrink-0"></div>

          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all whitespace-nowrap ${
            activeStep === 'EXECUTION' 
              ? 'bg-black text-white font-bold' 
              : 'text-slate-400'
          }`}>
            <CheckCheck className="w-3.5 h-3.5" />
            <span>4. Confirmation</span>
          </div>
        </div>

        {/* STEP 1: FILE UPLOAD DASHBOARD */}
        {activeStep === 'UPLOAD' && (
          <div className="space-y-6 animate-fade-in max-w-3xl mx-auto">
            {/* Hero Header */}
            <div className="text-center max-w-xl mx-auto space-y-2 pt-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
                <Sparkles className="w-3 h-3 text-slate-700" /> Automated Self-Service Printing
              </span>
              <h1 className="text-2xl sm:text-4xl font-black text-slate-950 tracking-tight">
                Print Documents & Images Instantly
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Drag & drop your files, customize rotation and pages, pay securely, and collect your prints.
              </p>
            </div>

            {/* Drag & Drop File Uploader Component */}
            <div className="w-full">
              <FileUploader
                onFileSelected={handleFileSelected}
                fileData={fileData}
                onClearFile={() => setFileData(null)}
                onPromptPassword={handlePromptPassword}
              />
            </div>

            {/* Quick Feature Highlights Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3.5 rounded-lg bg-white border border-slate-200 space-y-1 shadow-sm text-left">
                <div className="w-7 h-7 rounded-md bg-slate-100 text-slate-900 flex items-center justify-center font-bold text-xs">
                  <FileText className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-slate-900">Custom Page Range</h4>
                <p className="text-[11px] text-slate-500 leading-snug">Select specific page numbers or entire PDF document.</p>
              </div>

              <div className="p-3.5 rounded-lg bg-white border border-slate-200 space-y-1 shadow-sm text-left">
                <div className="w-7 h-7 rounded-md bg-slate-100 text-slate-900 flex items-center justify-center font-bold text-xs">
                  <RotateCw className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-slate-900">Rotate & B&W / Color</h4>
                <p className="text-[11px] text-slate-500 leading-snug">Rotate 90°-270° orientation, choose monochrome or color.</p>
              </div>

              <div className="p-3.5 rounded-lg bg-white border border-slate-200 space-y-1 shadow-sm text-left">
                <div className="w-7 h-7 rounded-md bg-slate-100 text-slate-900 flex items-center justify-center font-bold text-xs">
                  <Shield className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-slate-900">Zero-Trace Privacy</h4>
                <p className="text-[11px] text-slate-500 leading-snug">Permanently deleted from MongoDB upon receipt.</p>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: SMART PRINT STUDIO (DOCUMENT EDITOR & ROTATION) */}
        {activeStep === 'EDIT' && fileData && (
          <DocumentEditor
            fileData={fileData}
            editedConfig={editedConfig}
            onSaveEdit={(editedObj) => setEditedConfig(editedObj)}
            onProceedNext={() => setActiveStep('CONFIG')}
          />
        )}

        {/* STEP 3: CONFIGURATION & PAYMENT DASHBOARD */}
        {activeStep === 'CONFIG' && fileData && (
          <div className="space-y-5 animate-fade-in max-w-4xl mx-auto">
            
            {/* Top Active File Bar */}
            <div className="bg-white p-3.5 rounded-lg border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-md bg-black text-white flex items-center justify-center font-bold font-mono text-xs">
                  .{fileData.extension?.toUpperCase() || 'PDF'}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-xs truncate max-w-xs">{fileData.name}</h3>
                  <p className="text-[11px] text-slate-500 font-mono">
                    {fileData.sizeMB} MB • {fileData.totalPages} Total Page(s) • {editedConfig?.rotation || 0}° Rotated
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveStep('EDIT')}
                className="px-3 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 text-xs font-semibold transition-colors"
              >
                ✏️ Edit Rotation & Mode
              </button>
            </div>

            {/* Print Configurator Engine */}
            <Configurator
              fileData={fileData}
              editedConfig={editedConfig}
              onConfigChange={(cfg) => setPrintConfig(cfg)}
              onProceedToPayment={() => setIsPaymentModalOpen(true)}
            />
          </div>
        )}

        {/* STEP 4: INSTANT EXECUTION & 30S RECEIPT CONFIRMATION POPUP */}
        {activeStep === 'EXECUTION' && (
          <div className="animate-fade-in">
            <ExecutionScreen
              jobData={activeJobData}
              onResetWorkflow={handleResetWorkflow}
            />
          </div>
        )}

      </main>

      {/* Responsive Modern Light Footer */}
      <Footer />

      {/* OVERLAY MODALS */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        config={printConfig}
        fileData={fileData}
        editedConfig={editedConfig}
        onPaymentSuccess={handlePaymentSuccess}
      />

      <PasswordPromptModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        onUnlockSuccess={handlePasswordUnlockSuccess}
        fileName={fileData?.name || 'Protected_Doc.pdf'}
      />

    </div>
  );
}


