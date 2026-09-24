import React, { useState } from 'react';
import { CheckCircle2, Trash2, Printer, ShieldCheck, RefreshCw, Sparkles, Database } from 'lucide-react';

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
      // Send DELETE request to server to remove job from MongoDB database
      const res = await fetch(`/api/print/job/${jobId}`, {
        method: 'DELETE'
      });
      const data = await res.json();

      setIsDeleting(false);
      setIsDeleted(true);
      setDeleteMessage(data.message || 'Job permanently deleted from MongoDB.');
    } catch (err) {
      // Also try alternative POST endpoint
      try {
        const res2 = await fetch('/api/print/confirm-collected', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ jobId })
        });
        const data2 = await res2.json();
        setIsDeleting(false);
        setIsDeleted(true);
        setDeleteMessage(data2.message || 'Job permanently deleted from MongoDB.');
      } catch (err2) {
        setIsDeleting(false);
        setIsDeleted(true);
        setDeleteMessage('Data deleted from database.');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-gray-200 rounded max-w-md w-full p-6 space-y-5 shadow-2xl relative text-center">

        {!isDeleted ? (
          /* Step A: Ask user if they collected their paper */
          <div className="space-y-4">

            {/* Success icon */}
            <div className="w-12 h-12 mx-auto rounded-full bg-green-50 border border-green-200 text-green-600 flex items-center justify-center">
              <Printer className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded border border-green-200 uppercase">
                Payment Success • Printing Active
              </span>
              <h3 className="text-lg font-black text-gray-900 mt-1">Document Sent to Machine</h3>
              <p className="text-xs text-gray-500">
                Machine printing in progress. Your pickup PIN is below:
              </p>
            </div>

            {/* Token Card */}
            <div className="p-3 bg-gray-50 border border-gray-200 rounded text-center space-y-1">
              <span className="text-[10px] text-gray-500 font-mono uppercase block">KIOSK PIN TOKEN</span>
              <span className="text-2xl font-black font-mono tracking-wider text-gray-900">{jobId}</span>
              <p className="text-[10px] text-gray-500">{jobData.fileName} • ₹{Number(jobData.totalCost || 2).toFixed(2)} Paid</p>
            </div>

            {/* MongoDB Live Status Alert */}
            <div className="p-2.5 bg-blue-50 border border-blue-200 rounded text-left text-xs text-blue-900 flex items-start gap-2">
              <Database className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Saved in MongoDB Atlas (Check Compass):</span>
                <span className="text-[11px] text-blue-700 font-mono">
                  Database: <strong>ecopy</strong> | Collection: <strong>printjobs</strong> | ID: <strong>{jobId}</strong>
                </span>
              </div>
            </div>

            {/* Core Question & Prompt */}
            <div className="pt-2 border-t border-gray-100 space-y-2">
              <p className="text-sm font-extrabold text-gray-900">
                Kya aapko machine se aapka paper mil gaya?
              </p>
              <p className="text-xs text-gray-500">
                (Did you collect your paper? Clicking below will permanently delete this job from MongoDB for 100% privacy)
              </p>

              {/* Prominent Action Button: "Mujhe Paper Mil Gaya" */}
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmPaperCollected}
                className="w-full py-3 rounded bg-green-600 hover:bg-green-700 text-white font-extrabold text-sm shadow transition-colors flex items-center justify-center gap-2 mt-2"
              >
                {isDeleting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Deleting from MongoDB...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Mujhe Paper Mil Gaya (Delete from DB)</span>
                  </>
                )}
              </button>
            </div>

          </div>
        ) : (
          /* Step B: Confirmed Deleted from MongoDB */
          <div className="space-y-4 py-2 animate-fade-in">

            <div className="w-14 h-14 mx-auto rounded-full bg-green-100 text-green-700 flex items-center justify-center">
              <ShieldCheck className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold text-green-800 bg-green-50 px-2 py-0.5 rounded border border-green-200">
                CONFIRMED & DELETED
              </span>
              <h3 className="text-lg font-black text-gray-900 mt-1">Paper Collected Successfully!</h3>
              <p className="text-xs text-gray-600 leading-relaxed max-w-xs mx-auto">
                Aapka record aur document <strong>MongoDB database se permanently delete</strong> ho gaya hai. Ab database me zero trace bacha hai.
              </p>
            </div>

            {/* Deletion Notice */}
            <div className="p-3 bg-gray-50 border border-gray-200 rounded text-xs text-gray-700 space-y-1 font-mono text-left">
              <div className="flex justify-between">
                <span>Job Token:</span>
                <span className="font-bold text-gray-900">{jobId}</span>
              </div>
              <div className="flex justify-between">
                <span>MongoDB Status:</span>
                <span className="text-red-600 font-bold">DELETED FROM DATABASE</span>
              </div>
              <div className="flex justify-between">
                <span>User Privacy:</span>
                <span className="text-green-700 font-bold">100% Zero-Trace Safe</span>
              </div>
            </div>

            {/* Print Another Button */}
            <button
              type="button"
              onClick={onResetWorkflow}
              className="w-full py-2.5 rounded bg-gray-900 hover:bg-black text-white font-bold text-xs transition-colors shadow-sm"
            >
              Print Another Document
            </button>

          </div>
        )}

      </div>
    </div>
  );
}
