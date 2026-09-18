import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import FileUploader from './components/FileUploader';
import DocumentEditor from './components/DocumentEditor';
import Configurator from './components/Configurator';
import KioskLocator from './components/KioskLocator';
import PaymentModal from './components/PaymentModal';
import ExecutionScreen from './components/ExecutionScreen';
import PasswordPromptModal from './components/PasswordPromptModal';
import PrintHistoryModal from './components/PrintHistoryModal';
import KioskSelectModal from './components/KioskSelectModal';
import { Upload, Wand2, Sliders, Printer, CheckCheck, ShieldAlert, Sparkles } from 'lucide-react';

export default function App() {
  // Application State
  const [activeStep, setActiveStep] = useState('UPLOAD'); // 'UPLOAD', 'EDIT', 'CONFIG', 'EXECUTION'
  const [fileData, setFileData] = useState(null);
  const [editedConfig, setEditedConfig] = useState(null);
  const [kiosks, setKiosks] = useState([]);
  const [selectedKiosk, setSelectedKiosk] = useState(null);
  const [userDistanceMeters, setUserDistanceMeters] = useState(25); // Simulated distance
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
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isKioskDrawerOpen, setIsKioskDrawerOpen] = useState(false);
  const [activeJobData, setActiveJobData] = useState(null);
  const [printHistory, setPrintHistory] = useState([]);

  // Session Timeout State (EDGE CASE: 30 Min Inactivity Auto-Clear for Privacy)
  const [sessionSecondsLeft, setSessionSecondsLeft] = useState(1800); // 30 minutes
  const [isSessionExpired, setIsSessionExpired] = useState(false);

  // Dummy Toast Handler - Popups disabled as requested
  const handleShowToast = () => {};

  // Fetch Kiosks from Backend API or Fallback Seed
  useEffect(() => {
    fetch('/api/kiosks')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data && data.data.length > 0) {
          setKiosks(data.data);
          setSelectedKiosk(data.data[0]); // Default to Gyan Sagar Vidya Niketan Kiosk
        } else {
          fallbackKiosks();
        }
      })
      .catch(() => {
        fallbackKiosks();
      });
  }, []);

  const fallbackKiosks = () => {
    const defaults = [
      {
        kioskId: 'EX-01',
        name: 'Gyan Sagar Vidya Niketan School Kiosk',
        location: 'Near Gyan Sagar Vidya Niketan School, Annapurna Road, Indore',
        coordinates: { lat: 22.705, lng: 75.845 },
        status: 'ONLINE',
        supportsColor: true,
        paperLevelPercent: 90,
        tonerLevelPercent: 95,
        distanceMeters: 25,
        queueCount: 1,
        pricing: { bwPerPage: 2.0, colorPerPage: 10.0 }
      },
      {
        kioskId: 'EX-02',
        name: 'Mhow Naka Square Kiosk',
        location: 'Mhow Naka Circle, Main Market Arcade, Indore',
        coordinates: { lat: 22.708, lng: 75.852 },
        status: 'ONLINE',
        supportsColor: false, // B&W ONLY Edge Case
        paperLevelPercent: 55,
        tonerLevelPercent: 75,
        distanceMeters: 40,
        queueCount: 2,
        pricing: { bwPerPage: 1.5, colorPerPage: 0.0 }
      },
      {
        kioskId: 'EX-03',
        name: 'Rajwada Palace Concourse Kiosk',
        location: 'Rajwada Palace Heritage Square, MG Road, Indore',
        coordinates: { lat: 22.719, lng: 75.857 },
        status: 'LOW_PAPER', // Hardware Warning Edge Case
        paperLevelPercent: 5,
        tonerLevelPercent: 15,
        distanceMeters: 15,
        queueCount: 0,
        pricing: { bwPerPage: 2.0, colorPerPage: 10.0 }
      },
      {
        kioskId: 'EX-04',
        name: 'Vijay Nagar Square Kiosk',
        location: 'Opposite C21 Mall, Vijay Nagar, Indore',
        coordinates: { lat: 22.753, lng: 75.893 },
        status: 'OFFLINE', // Offline Kiosk Edge Case
        supportsColor: true,
        paperLevelPercent: 0,
        tonerLevelPercent: 0,
        distanceMeters: 350,
        queueCount: 0,
        pricing: { bwPerPage: 2.0, colorPerPage: 10.0 }
      }
    ];
    setKiosks(defaults);
    setSelectedKiosk(defaults[0]);
  };

  // 30-Minute Inactivity Privacy Countdown Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setSessionSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsSessionExpired(true);
          setFileData(null); // Auto-clear document for security
          setActiveStep('UPLOAD');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleFileSelected = (fileObj) => {
    setFileData(fileObj);
    if (!fileObj.isEncrypted) {
      setActiveStep('EDIT'); // Go to Smart Edit Studio
    }
  };

  const handlePromptPassword = (fileObj) => {
    setIsPasswordModalOpen(true);
  };

  const handlePasswordUnlockSuccess = (pwd) => {
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

  const handlePaymentSuccess = () => {
    setIsPaymentModalOpen(false);
    
    const newJob = {
      jobId: 'EX-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
      fileName: fileData ? fileData.name : 'document.pdf',
      kioskName: selectedKiosk ? selectedKiosk.name : 'Exopy Kiosk',
      pages: printConfig.pagesToPrint,
      cost: printConfig.totalPrice,
      status: 'QUEUED',
      queuePosition: 1,
      createdAt: new Date().toLocaleString()
    };

    setActiveJobData(newJob);
    setPrintHistory([newJob, ...printHistory]);
    setActiveStep('EXECUTION');
  };

  const handleResetWorkflow = () => {
    setFileData(null);
    setEditedConfig(null);
    setActiveJobData(null);
    setActiveStep('UPLOAD');
  };

  const sessionMinutesLeft = Math.ceil(sessionSecondsLeft / 60);

  return (
    <div className="min-h-screen bg-dark-bg text-slate-100 flex flex-col font-sans">
      
      {/* Top Navbar */}
      <Navbar
        selectedKiosk={selectedKiosk}
        onOpenHistory={() => setIsHistoryModalOpen(true)}
        onOpenKioskSelector={() => setIsKioskDrawerOpen(true)}
        sessionMinutesLeft={sessionMinutesLeft}
        isSessionExpired={isSessionExpired}
      />

      {/* EDGE CASE: 30-Min Session Expired Security Alert */}
      {isSessionExpired && (
        <div className="bg-red-950 border-b border-red-500/50 p-3 text-center text-xs font-bold text-red-200 flex items-center justify-center gap-2">
          <ShieldAlert className="w-4 h-4 text-red-400" />
          <span>Session Expired for Security & Privacy. Uploaded documents automatically cleared.</span>
          <button
            onClick={() => {
              setSessionSecondsLeft(1800);
              setIsSessionExpired(false);
            }}
            className="px-2 py-0.5 rounded bg-red-800 text-white hover:bg-red-700 text-[11px]"
          >
            Restart Session
          </button>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
        
        {/* 5-Step Responsive Workflow Step Indicator Bar */}
        <div className="w-full max-w-5xl mx-auto glass-panel p-2 sm:p-3 rounded-2xl border border-dark-border flex items-center justify-between text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => setActiveStep('UPLOAD')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl transition-all whitespace-nowrap ${
              activeStep === 'UPLOAD' ? 'bg-neon/15 text-neon border border-neon/40 shadow-neon-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>1. Upload</span>
          </button>
          
          <div className="w-4 h-[1px] bg-dark-border shrink-0"></div>

          <button
            disabled={!fileData}
            onClick={() => fileData && setActiveStep('EDIT')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl transition-all whitespace-nowrap ${
              activeStep === 'EDIT' ? 'bg-neon/15 text-neon border border-neon/40 shadow-neon-sm' : !fileData ? 'text-slate-600 cursor-not-allowed' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>2. Edit & Filter</span>
          </button>

          <div className="w-4 h-[1px] bg-dark-border shrink-0"></div>

          <button
            disabled={!fileData}
            onClick={() => fileData && setActiveStep('CONFIG')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl transition-all whitespace-nowrap ${
              activeStep === 'CONFIG' ? 'bg-neon/15 text-neon border border-neon/40 shadow-neon-sm' : !fileData ? 'text-slate-600 cursor-not-allowed' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>3. Kiosk & Pay</span>
          </button>

          <div className="w-4 h-[1px] bg-dark-border shrink-0"></div>

          <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl transition-all whitespace-nowrap ${
            activeStep === 'EXECUTION' ? 'bg-neon/15 text-neon border border-neon/40 shadow-neon-sm' : 'text-slate-400'
          }`}>
            <CheckCheck className="w-3.5 h-3.5 text-neon" />
            <span>4. Complete & History</span>
          </div>
        </div>

        {/* STEP 1: FILE UPLOAD & KIOSK SELECTION DASHBOARD */}
        {activeStep === 'UPLOAD' && (
          <div className="space-y-8 animate-fade-in">
            {/* Hero Banner */}
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-neon/10 text-neon border border-neon/30">
                <Sparkles className="w-3.5 h-3.5 fill-neon" /> 100% Automated Indore Kiosk Network
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Print & Edit Any Media in <span className="text-neon underline decoration-neon/40 underline-offset-4">Seconds</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-400">
                Gyan Sagar Vidya Niketan • Mhow Naka • Rajwada Palace • Instant Automated Receive!
              </p>
            </div>

            {/* File Upload Component */}
            <div className="max-w-2xl mx-auto">
              <FileUploader
                onFileSelected={handleFileSelected}
                fileData={fileData}
                onClearFile={() => setFileData(null)}
                onPromptPassword={handlePromptPassword}
                showToast={handleShowToast}
              />
            </div>

            {/* Interactive Kiosk Locator Section */}
            <div className="pt-4">
              <KioskLocator
                kiosks={kiosks}
                selectedKiosk={selectedKiosk}
                onSelectKiosk={(k) => setSelectedKiosk(k)}
                userDistanceMeters={userDistanceMeters}
                setUserDistanceMeters={setUserDistanceMeters}
              />
            </div>
          </div>
        )}

        {/* STEP 2: SMART PRINT STUDIO (DOCUMENT EDITOR) */}
        {activeStep === 'EDIT' && fileData && (
          <DocumentEditor
            fileData={fileData}
            editedConfig={editedConfig}
            onSaveEdit={(editedObj) => setEditedConfig(editedObj)}
            onProceedNext={() => setActiveStep('CONFIG')}
          />
        )}

        {/* STEP 3: CONFIGURATION & DUMMY PAYMENT DASHBOARD */}
        {activeStep === 'CONFIG' && fileData && (
          <div className="space-y-8 animate-fade-in max-w-5xl mx-auto">
            
            {/* Top Active File Bar */}
            <div className="glass-panel p-4 rounded-2xl border border-dark-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-neon/10 border border-neon/30 text-neon flex items-center justify-center font-bold font-mono">
                  .{fileData.extension.toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm truncate max-w-xs">{fileData.name}</h3>
                  <p className="text-xs text-slate-400 font-mono">
                    {fileData.sizeMB} MB • {fileData.totalPages} Total Page(s) • {editedConfig?.rotation || 0}° Rotated
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveStep('EDIT')}
                  className="px-3 py-1.5 rounded-lg bg-dark-bg border border-dark-border text-neon text-xs font-semibold hover:border-neon"
                >
                  ✏️ Edit Filters & Layout
                </button>
                <button
                  onClick={() => setIsKioskDrawerOpen(true)}
                  className="px-3 py-1.5 rounded-lg bg-neon/10 border border-neon/30 text-neon text-xs font-semibold hover:bg-neon hover:text-black"
                >
                  📍 Switch Kiosk
                </button>
              </div>
            </div>

            {/* Print Configurator Engine */}
            <Configurator
              fileData={fileData}
              selectedKiosk={selectedKiosk}
              onConfigChange={(cfg) => setPrintConfig(cfg)}
              onProceedToPayment={() => setIsPaymentModalOpen(true)}
              showToast={handleShowToast}
            />

            {/* Kiosk Status Card in Config View */}
            <div className="pt-2">
              <KioskLocator
                kiosks={kiosks}
                selectedKiosk={selectedKiosk}
                onSelectKiosk={(k) => setSelectedKiosk(k)}
                userDistanceMeters={userDistanceMeters}
                setUserDistanceMeters={setUserDistanceMeters}
              />
            </div>
          </div>
        )}

        {/* STEP 4: INSTANT EXECUTION & HISTORY COMPLETION */}
        {activeStep === 'EXECUTION' && (
          <div className="animate-fade-in">
            <ExecutionScreen
              jobData={activeJobData}
              selectedKiosk={selectedKiosk}
              onResetWorkflow={handleResetWorkflow}
              onOpenHistory={() => setIsHistoryModalOpen(true)}
              showToast={handleShowToast}
            />
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="w-full border-t border-dark-border py-6 text-center text-xs text-slate-500 font-mono">
        <p>Exopy Smart Kiosk Engine © 2026 • Indore Automated Network</p>
      </footer>

      {/* OVERLAY MODALS */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        config={printConfig}
        fileData={fileData}
        selectedKiosk={selectedKiosk}
        userDistanceMeters={userDistanceMeters}
        onPaymentSuccess={handlePaymentSuccess}
        showToast={handleShowToast}
      />

      <PasswordPromptModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        onUnlockSuccess={handlePasswordUnlockSuccess}
        fileName={fileData?.name || 'Protected_Doc.pdf'}
      />

      <PrintHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        printHistory={printHistory}
      />

      <KioskSelectModal
        isOpen={isKioskDrawerOpen}
        onClose={() => setIsKioskDrawerOpen(false)}
        kiosks={kiosks}
        selectedKiosk={selectedKiosk}
        onSelectKiosk={(k) => setSelectedKiosk(k)}
      />

    </div>
  );
}
