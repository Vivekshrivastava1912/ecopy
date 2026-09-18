import React, { useState, useEffect } from 'react';
import { QrCode, Printer, CheckCircle2, AlertOctagon, RefreshCw, MessageSquare, ShieldCheck, ArrowLeft, Clock, History, CheckCheck, Sparkles } from 'lucide-react';

export default function ExecutionScreen({ 
  jobData, 
  selectedKiosk, 
  onResetWorkflow, 
  onOpenHistory,
  showToast 
}) {
  // Set initial status directly to INSTANT COMPLETE
  const [printStatus, setPrintStatus] = useState('COLLECTED_COMPLETE'); // 'COLLECTED_COMPLETE', 'JAMMED'

  useEffect(() => {
    // Show instant success toast upon landing on execution screen
    showToast({
      type: 'success',
      title: 'Instant Print & Paper Received!',
      message: `Paper output from ${selectedKiosk?.name || 'Gyan Sagar Vidya Niketan School Kiosk'}. Transaction saved to history!`
    });
  }, [selectedKiosk, showToast]);

  // EDGE CASE 5.1: Simulate Kiosk Paper Jam hardware error
  const handleSimulatePaperJam = () => {
    setPrintStatus('JAMMED');
    showToast({
      type: 'error',
      title: 'Hardware Error: Kiosk Paper Jam',
      message: 'Paper feeder jammed mid-print. Full refund auto-initiated to your UPI account.',
      actionText: 'Contact WhatsApp Support',
      onAction: () => window.open('https://wa.me/919876543210?text=Exopy%20Paper%20Jam%20Issue', '_blank')
    });
  };

  const printToken = jobData ? jobData.jobId : 'EX-782910';

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6 py-4 animate-fade-in">
      
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onResetWorkflow}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-dark-card border border-dark-border text-xs font-semibold text-slate-300 hover:border-slate-500"
        >
          <ArrowLeft className="w-4 h-4" /> Print Another Document
        </button>
        <span className="text-xs font-mono text-neon bg-neon/10 px-2.5 py-1 rounded border border-neon/30">
          TOKEN: {printToken}
        </span>
      </div>

      {/* Main Execution Card */}
      <div className="rounded-3xl border border-dark-border bg-dark-card p-6 sm:p-8 glass-panel-glow relative overflow-hidden space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-1">
          <span className="text-[10px] font-mono font-bold text-neon bg-neon/10 px-2.5 py-1 rounded border border-neon/30 uppercase tracking-wider">
            STEP 5: INSTANT PROCESS COMPLETE
          </span>
          <h2 className="text-2xl font-black text-white tracking-tight mt-1">
            {printStatus === 'COLLECTED_COMPLETE' ? 'Paper Received & Saved to History!' : 'Kiosk Hardware Status'}
          </h2>
          <p className="text-xs text-slate-400">
            Assigned Kiosk: <strong className="text-neon">{selectedKiosk?.name || 'Gyan Sagar Vidya Niketan School Kiosk'}</strong>
          </p>
        </div>

        {/* STEP 5: INSTANT SUCCESSFUL PROCESS COMPLETE */}
        {printStatus === 'COLLECTED_COMPLETE' && (
          <div className="py-6 text-center space-y-6 animate-fade-in">
            
            <div className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-br from-neon to-emerald-600 text-black flex items-center justify-center shadow-neon-glow transform scale-105">
              <CheckCheck className="w-14 h-14 stroke-[3]" />
            </div>

            <div className="space-y-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-neon/10 text-neon border border-neon/30">
                <Sparkles className="w-3.5 h-3.5 fill-neon" /> 100% INSTANT KIOSK RECEIPT
              </span>
              <h3 className="text-3xl font-black text-white tracking-tight">Paper Received & Process Complete!</h3>
              <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                Optical tray sensors at <strong className="text-neon">{selectedKiosk?.name}</strong> confirmed paper collection. Document automatically shredded from cloud RAM and archived to print history.
              </p>
            </div>

            {/* Receipt Summary Pill */}
            <div className="p-4 bg-dark-bg border border-dark-border rounded-2xl max-w-md mx-auto text-left space-y-2 text-xs">
              <div className="flex justify-between items-center border-b border-dark-border pb-2">
                <span className="text-slate-400 font-mono">Job Token ID</span>
                <span className="font-mono font-bold text-neon">{printToken}</span>
              </div>
              <div className="flex justify-between items-center border-b border-dark-border pb-2">
                <span className="text-slate-400 font-mono">Document Name</span>
                <span className="font-bold text-white truncate max-w-[200px]">{jobData?.fileName || 'document.pdf'}</span>
              </div>
              <div className="flex justify-between items-center border-b border-dark-border pb-2">
                <span className="text-slate-400 font-mono">Payment Status</span>
                <span className="text-neon font-bold font-mono">₹{jobData?.cost ? jobData.cost.toFixed(2) : '2.00'} PAID</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-mono">Cloud Shredder Privacy</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-neon" /> 100% Erased (Zero Trace)
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={onOpenHistory}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-neon hover:bg-neon-hover text-black font-extrabold text-xs tracking-wider shadow-neon-glow flex items-center justify-center gap-2"
              >
                <History className="w-4 h-4 fill-black" />
                <span>VIEW PRINT HISTORY & RECEIPT</span>
              </button>

              <button
                type="button"
                onClick={onResetWorkflow}
                className="w-full sm:w-auto px-6 py-3 rounded-xl border border-dark-border text-slate-200 hover:bg-dark-hover font-bold text-xs"
              >
                Print Another Document
              </button>
            </div>

            {/* Simulation button for testing Paper Jam error */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleSimulatePaperJam}
                className="px-3 py-1.5 rounded-lg bg-red-950/40 border border-red-500/40 text-red-300 text-[10px] font-semibold hover:bg-red-950/70"
              >
                ⚡ Test Kiosk Paper Jam Edge Case
              </button>
            </div>

          </div>
        )}

        {/* EDGE CASE 5.1: PAPER JAM ERROR STATE */}
        {printStatus === 'JAMMED' && (
          <div className="py-6 text-center space-y-5 animate-fade-in">
            <div className="w-20 h-20 mx-auto rounded-2xl bg-red-950/90 border-2 border-red-500 text-red-400 flex items-center justify-center shadow-red-glow">
              <AlertOctagon className="w-10 h-10 animate-pulse" />
            </div>

            <div>
              <h3 className="text-xl font-extrabold text-red-400">Kiosk Hardware Error: Paper Jam</h3>
              <p className="text-xs text-slate-300 mt-1 max-w-md mx-auto leading-relaxed">
                The printer engine experienced a paper feed blockage at {selectedKiosk?.name}. Printing stopped safely.
              </p>
            </div>

            {/* Auto Refund Box */}
            <div className="p-4 bg-red-950/30 border border-red-500/40 rounded-2xl max-w-md mx-auto text-left space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-red-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Auto-Refund Initiated</span>
              </div>
              <p className="text-[11px] text-slate-300">
                A full 100% refund of ₹{jobData?.cost || '2.00'} has been auto-dispatched to your UPI account. Transaction Ref: <span className="font-mono text-white">REF-{Math.random().toString(36).substring(2,8).toUpperCase()}</span>.
              </p>
            </div>

            {/* Support WhatsApp Action Button */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <a
                href={`https://wa.me/919876543210?text=Exopy%20Paper%20Jam%20Issue%20Kiosk%20${selectedKiosk?.kioskId}`}
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg"
              >
                <MessageSquare className="w-4 h-4 fill-white" />
                Contact Support on WhatsApp
              </a>

              <button
                type="button"
                onClick={() => setPrintStatus('COLLECTED_COMPLETE')}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-dark-border text-slate-300 hover:bg-dark-hover font-semibold text-xs"
              >
                Back to Complete Screen
              </button>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
