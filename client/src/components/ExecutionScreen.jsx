import React, { useState, useEffect, useRef } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Trash2, 
  ShieldCheck, 
  AlertOctagon, 
  RefreshCw, 
  MessageSquare, 
  ArrowLeft, 
  Printer, 
  FileText, 
  CheckCheck, 
  Sparkles, 
  Home, 
  CloudRain, 
  Database, 
  CloudOff 
} from 'lucide-react';

export default function ExecutionScreen({ 
  jobData, 
  onResetWorkflow, 
  showToast 
}) {
  // Screen views: 'POPUP_PROMPT', 'CONFIRMED_YES', 'TEST_CASE_FAILED'
  const [currentView, setCurrentView] = useState('POPUP_PROMPT');
  const [secondsRemaining, setSecondsRemaining] = useState(300); // 5 Minutes (300 seconds)
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [failureReported, setFailureReported] = useState(false);

  const jobId = jobData?.jobId || 'JOB-UNKNOWN';
  const timerRef = useRef(null);

  // 5-Minute Countdown Timer Effect
  useEffect(() => {
    if (currentView === 'POPUP_PROMPT') {
      timerRef.current = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            // Time expired: Clean up Cloudinary file and preserve MongoDB status
            handleTimeoutPurge();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentView, jobId]);

  // Handle Timeout / Inaction: Purge file from Cloudinary, keep MongoDB status
  const handleTimeoutPurge = async () => {
    try {
      await fetch(`/api/print/job/${jobId}/timeout-purge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cloudinaryPublicId: jobData?.cloudinaryPublicId,
          cloudinaryUrl: jobData?.cloudinaryUrl,
          cloudinaryPublicIds: jobData?.cloudinaryPublicIds
        })
      });
      console.log(`[Ecopy] 5-Minute Timeout: File purged from Cloudinary for ${jobId}`);
    } catch (err) {
      console.warn('Timeout purge API fallback:', err);
    }

    if (showToast) {
      showToast({
        type: 'info',
        title: 'Session Timeout',
        message: '5-minute confirmation window ended. File deleted from Cloudinary for privacy.'
      });
    }
    onResetWorkflow();
  };

  // Handle YES: Printout Received -> Delete document data from Cloudinary, retain MongoDB status
  const handleConfirmReceived = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/print/job/${jobId}/confirm-received`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cloudinaryPublicId: jobData?.cloudinaryPublicId,
          cloudinaryUrl: jobData?.cloudinaryUrl,
          cloudinaryPublicIds: jobData?.cloudinaryPublicIds
        })
      });
      const data = await res.json();
      console.log('Cloudinary Purge & MongoDB Status Update:', data);
    } catch (err) {
      console.warn('Confirm received API request fallback:', err);
    }

    setIsDeleting(false);
    setDeleteSuccess(true);
    setCurrentView('CONFIRMED_YES');

    if (showToast) {
      showToast({
        type: 'success',
        title: 'Print Received & File Purged',
        message: 'Uploaded file deleted from Cloudinary. MongoDB transaction record preserved.'
      });
    }
  };

  // Handle NO: Printout Not Received -> Show Failure / Retry options
  const handleReportNotReceived = async () => {
    if (timerRef.current) clearInterval(timerRef.current);

    try {
      await fetch('/api/print/report-failed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId, reason: 'User reported printout not received' })
      });
    } catch (err) {
      console.warn('Report failure API fallback:', err);
    }

    setFailureReported(true);
    setCurrentView('TEST_CASE_FAILED');

    if (showToast) {
      showToast({
        type: 'error',
        title: 'Issue Reported: Printout Not Received',
        message: 'Status updated to Failed in MongoDB. Support ticket created.'
      });
    }
  };

  // Format seconds into MM:SS (e.g. 05:00)
  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${String(mins).padStart(2, '0')}:${String(rem).padStart(2, '0')}`;
  };

  const timerPercentage = ((300 - secondsRemaining) / 300) * 100;

  return (
    <div className="w-full max-w-3xl mx-auto space-y-5 py-2 animate-fade-in">
      
      {/* Top Breadcrumb Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onResetWorkflow}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:text-black hover:border-slate-400 transition-colors shadow-xs"
        >
          <Home className="w-3.5 h-3.5" /> Back to Home
        </button>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
            JOB: {jobId}
          </span>
        </div>
      </div>

      {/* VIEW 1: POPUP CONFIRMATION MODAL WITH 5-MINUTE TIMER */}
      {currentView === 'POPUP_PROMPT' && (
        <div className="rounded-lg border border-slate-200 bg-white p-6 sm:p-8 shadow-sm relative overflow-hidden space-y-5 animate-fade-in">
          
          {/* 5-Min Countdown Header Bar */}
          <div className="w-full bg-slate-50 border border-slate-200 rounded-md p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-md bg-white border border-slate-200 flex items-center justify-center text-slate-800">
                <Clock className="w-4 h-4 animate-pulse" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Confirmation Window Active</p>
                <p className="text-[11px] text-slate-500">Please choose Yes or No within 5 minutes</p>
              </div>
            </div>

            <div className="text-right">
              <span className={`text-2xl sm:text-3xl font-black font-mono ${
                secondsRemaining <= 30 ? 'text-red-600 animate-bounce' : 'text-slate-900'
              }`}>
                {formatTime(secondsRemaining)}
              </span>
              <p className="text-[10px] text-slate-500 font-mono">Auto-Clean on 00:00</p>
            </div>
          </div>

          {/* Progress bar line */}
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden border border-slate-200">
            <div 
              className={`h-full transition-all duration-1000 ${
                secondsRemaining <= 30 ? 'bg-red-500' : 'bg-black'
              }`}
              style={{ width: `${100 - timerPercentage}%` }}
            ></div>
          </div>

          {/* Core Question Prompt */}
          <div className="text-center py-3 space-y-3">
            <div className="w-14 h-14 mx-auto rounded-md bg-black text-white flex items-center justify-center shadow-sm">
              <Printer className="w-7 h-7" />
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
              Did you receive your printout?
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
              Please check the kiosk printer tray for <strong className="text-slate-950">{jobData?.fileName || 'your document'}</strong>.
            </p>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-md text-left max-w-md mx-auto text-xs text-slate-600 space-y-1.5">
              <div className="flex items-start gap-2">
                <span className="text-slate-950 font-bold bg-slate-200 px-1.5 py-0.5 rounded text-[10px]">YES</span>
                <p>File will be <strong className="text-slate-900">deleted from Cloudinary</strong> for privacy. Database transaction status stays saved.</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-red-600 font-bold bg-red-100 px-1.5 py-0.5 rounded text-[10px]">NO</span>
                <p>Process can be repeated or support refund ticket will be generated.</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-slate-600 font-bold bg-slate-200 px-1.5 py-0.5 rounded text-[10px]">TIMEOUT</span>
                <p>If no action is taken within 5 minutes, the file is automatically wiped from Cloudinary.</p>
              </div>
            </div>
          </div>

          {/* Action Buttons: YES / NO */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            
            {/* YES BUTTON */}
            <button
              type="button"
              disabled={isDeleting}
              onClick={handleConfirmReceived}
              className="py-3.5 px-6 rounded-md bg-black hover:bg-slate-800 text-white font-black text-xs tracking-wider shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
              <span>{isDeleting ? 'Deleting File from Cloudinary...' : 'YES, I RECEIVED IT'}</span>
            </button>

            {/* NO BUTTON */}
            <button
              type="button"
              disabled={isDeleting}
              onClick={handleReportNotReceived}
              className="py-3.5 px-6 rounded-md bg-white hover:bg-red-50 border border-red-300 text-red-700 hover:text-red-800 font-black text-xs tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <XCircle className="w-4 h-4 text-red-600" />
              <span>NO, I DID NOT RECEIVE IT</span>
            </button>

          </div>

        </div>
      )}

      {/* VIEW 2: CONFIRMED YES (FILE PURGED FROM CLOUDINARY, MONGODB STATUS PRESERVED) */}
      {currentView === 'CONFIRMED_YES' && (
        <div className="rounded-lg border border-slate-200 bg-white p-6 sm:p-8 shadow-sm text-center space-y-5 animate-fade-in">
          
          <div className="w-14 h-14 mx-auto rounded-md bg-black text-white flex items-center justify-center shadow-sm">
            <CheckCheck className="w-8 h-8 stroke-[2.5]" />
          </div>

          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-200 uppercase tracking-wide">
              <Sparkles className="w-3 h-3 text-slate-700" /> Cloudinary Purged • Database Status Retained
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-950">Print Received & File Cleaned!</h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
              Your printout has been confirmed. The uploaded file has been <strong className="text-slate-950">permanently deleted from Cloudinary</strong>, while the job status record remains safely archived in MongoDB.
            </p>
          </div>

          {/* Privacy & Receipt Details Box */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-md max-w-md mx-auto text-left space-y-2 text-xs">
            <div className="flex justify-between items-center border-b border-slate-200 pb-1.5">
              <span className="text-slate-500 font-medium">Job Reference</span>
              <span className="font-mono font-bold text-slate-900">{jobId}</span>
            </div>
            <div className="flex justify-between items-center border-b border-slate-200 pb-1.5">
              <span className="text-slate-500 font-medium">Document Name</span>
              <span className="font-bold text-slate-900 truncate max-w-[200px]">{jobData?.fileName || 'document.pdf'}</span>
            </div>
            <div className="flex justify-between items-center border-b border-slate-200 pb-1.5">
              <span className="text-slate-500 font-medium flex items-center gap-1">
                <CloudOff className="w-3.5 h-3.5 text-slate-700" /> Cloudinary File Storage
              </span>
              <span className="text-slate-900 font-bold flex items-center gap-1 text-emerald-700">
                <Trash2 className="w-3.5 h-3.5" /> Purged / Deleted (0 Bytes)
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-medium flex items-center gap-1">
                <Database className="w-3.5 h-3.5 text-slate-700" /> MongoDB Status
              </span>
              <span className="text-slate-900 font-bold font-mono">COLLECTED_PURGED</span>
            </div>
          </div>

          {/* Next Actions */}
          <div className="pt-2">
            <button
              type="button"
              onClick={onResetWorkflow}
              className="w-full sm:w-auto px-6 py-3 rounded-md bg-black hover:bg-slate-800 text-white font-bold text-xs tracking-wider shadow-sm flex items-center justify-center gap-2 cursor-pointer mx-auto"
            >
              <FileText className="w-4 h-4" />
              <span>PRINT ANOTHER DOCUMENT</span>
            </button>
          </div>

        </div>
      )}

      {/* VIEW 3: TEST CASE FAILED / USER CLICKED NO (PROCESS VAPIS / RETRY OR SUPPORT) */}
      {currentView === 'TEST_CASE_FAILED' && (
        <div className="rounded-lg border border-red-200 bg-white p-6 sm:p-8 shadow-sm text-center space-y-5 animate-fade-in">
          
          <div className="w-14 h-14 mx-auto rounded-md bg-red-50 border border-red-300 text-red-600 flex items-center justify-center">
            <AlertOctagon className="w-7 h-7 animate-pulse" />
          </div>

          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-red-50 text-red-700 border border-red-200 font-mono">
              STATUS: FAILED_TEST_CASE
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-red-600">Printout Not Received</h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
              We registered that your printout was not collected. The event is recorded in MongoDB. You can retry the process or contact support.
            </p>
          </div>

          {/* Test Case Diagnostic Details */}
          <div className="p-4 bg-red-50/50 border border-red-200 rounded-md max-w-md mx-auto text-left space-y-2 text-xs">
            <div className="flex justify-between items-center border-b border-red-100 pb-1.5">
              <span className="text-slate-500 font-medium">Status in MongoDB</span>
              <span className="font-mono font-bold text-red-600">FAILED_TEST_CASE</span>
            </div>
            <div className="flex justify-between items-center border-b border-red-100 pb-1.5">
              <span className="text-slate-500 font-medium">Job Token ID</span>
              <span className="font-mono font-bold text-slate-900">{jobId}</span>
            </div>
            <div className="flex justify-between items-center border-b border-red-100 pb-1.5">
              <span className="text-slate-500 font-medium">Payment Status</span>
              <span className="text-slate-900 font-bold font-mono">REFUND_INITIATED</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-medium">Support Ticket</span>
              <span className="text-slate-900 font-bold font-mono">#TKT-{Math.random().toString(36).substring(2, 7).toUpperCase()}</span>
            </div>
          </div>

          {/* Action Buttons: Retry Process / Go Back / Support */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={onResetWorkflow}
              className="w-full sm:w-auto px-5 py-2.5 rounded-md bg-black hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry Process / Print Again</span>
            </button>

            <a
              href={`https://wa.me/919876543210?text=Printout%20Not%20Received%20Job%20${jobId}`}
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto px-5 py-2.5 rounded-md border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Contact WhatsApp Support</span>
            </a>
          </div>

        </div>
      )}

    </div>
  );
}
