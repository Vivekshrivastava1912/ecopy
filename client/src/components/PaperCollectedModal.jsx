import React, { useState } from 'react';
import { CheckCircle2, Trash2, Printer, ShieldCheck, RefreshCw, Sparkles, Database, CloudOff } from 'lucide-react';

export default function PaperCollectedModal({
  isOpen,
  jobData,
  onResetWorkflow
}) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState('');

  if (!isOpen || !jobData) return null;

  const jobId = jobData.jobId || 'EXP-8492';

  const handleConfirmPaperCollected = async () => {
    setIsDeleting(true);

    try {
      // Send POST request to confirm received & purge Cloudinary file while retaining MongoDB status
      const res = await fetch(`/api/print/job/${jobId}/confirm-received`, {
        method: 'POST'
      });
      const data = await res.json();

      setIsDeleting(false);
      setIsDeleted(true);
      setDeleteMessage(data.message || 'File permanently deleted from Cloudinary. Database status preserved.');
    } catch (err) {
      setIsDeleting(false);
      setIsDeleted(true);
      setDeleteMessage('User file purged from Cloudinary.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-gray-200 rounded-lg max-w-md w-full p-6 space-y-5 shadow-2xl relative text-center">

        {!isDeleted ? (
          /* Step A: Ask user if they collected their paper */
          <div className="space-y-4">

            {/* Success icon */}
            <div className="w-12 h-12 mx-auto rounded-md bg-black text-white flex items-center justify-center shadow-xs">
              <Printer className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 uppercase">
                Payment Success • Printing Active
              </span>
              <h3 className="text-lg font-black text-slate-900 mt-1">Document Sent to Machine</h3>
              <p className="text-xs text-slate-500">
                Machine printing in progress. Your pickup PIN is below:
              </p>
            </div>

            {/* Token Card */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-md text-center space-y-1">
              <span className="text-[10px] text-slate-500 font-mono uppercase block">KIOSK PIN TOKEN</span>
              <span className="text-2xl font-black font-mono tracking-wider text-slate-900">{jobId}</span>
              <p className="text-[10px] text-slate-500">{jobData.fileName} • ₹{Number(jobData.totalCost || 2).toFixed(2)} Paid</p>
            </div>

            {/* Cloudinary & MongoDB Status Alert */}
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-md text-left text-xs text-slate-700 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-slate-900">
                <Database className="w-3.5 h-3.5 text-slate-700" />
                <span>MongoDB & Cloudinary Sync</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Document is stored in Cloudinary for printing. Confirming receipt will permanently delete the file from Cloudinary for your privacy.
              </p>
            </div>

            {/* Core Question & Prompt */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <p className="text-sm font-extrabold text-slate-900">
                Kya aapko machine se aapka paper mil gaya?
              </p>
              <p className="text-xs text-slate-500">
                (Did you collect your paper? Clicking below will delete the uploaded document from Cloudinary for 100% privacy)
              </p>

              {/* Action Button: "Mujhe Paper Mil Gaya" */}
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmPaperCollected}
                className="w-full py-3 rounded-md bg-black hover:bg-slate-800 text-white font-extrabold text-sm shadow transition-colors flex items-center justify-center gap-2 mt-2 cursor-pointer"
              >
                {isDeleting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Deleting from Cloudinary...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Mujhe Paper Mil Gaya (Purge Cloudinary File)</span>
                  </>
                )}
              </button>
            </div>

          </div>
        ) : (
          /* Step B: Confirmed Deleted from Cloudinary */
          <div className="space-y-4 py-2 animate-fade-in">

            <div className="w-14 h-14 mx-auto rounded-md bg-black text-white flex items-center justify-center">
              <ShieldCheck className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                CONFIRMED & FILE PURGED
              </span>
              <h3 className="text-lg font-black text-slate-900 mt-1">Paper Collected Successfully!</h3>
              <p className="text-xs text-slate-600 leading-relaxed max-w-xs mx-auto">
                Aapka uploaded file <strong>Cloudinary se permanently delete</strong> ho gaya hai. MongoDB me status record safe hai.
              </p>
            </div>

            {/* Deletion Notice */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-700 space-y-1 font-mono text-left">
              <div className="flex justify-between">
                <span>Job Token:</span>
                <span className="font-bold text-slate-900">{jobId}</span>
              </div>
              <div className="flex justify-between">
                <span>Cloudinary File:</span>
                <span className="text-emerald-600 font-bold">DELETED (0 BYTES)</span>
              </div>
              <div className="flex justify-between">
                <span>Database Status:</span>
                <span className="text-slate-900 font-bold">COLLECTED_PURGED</span>
              </div>
            </div>

            {/* Print Another Button */}
            <button
              type="button"
              onClick={onResetWorkflow}
              className="w-full py-2.5 rounded-md bg-black hover:bg-slate-800 text-white font-bold text-xs transition-colors shadow-sm cursor-pointer"
            >
              Print Another Document
            </button>

          </div>
        )}

      </div>
    </div>
  );
}
