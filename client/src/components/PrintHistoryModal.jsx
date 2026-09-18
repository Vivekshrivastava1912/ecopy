import React from 'react';
import { History, X, CheckCircle2, ShieldCheck, AlertOctagon, Download, FileText } from 'lucide-react';

export default function PrintHistoryModal({ isOpen, onClose, printHistory = [] }) {
  if (!isOpen) return null;

  const sampleHistory = printHistory.length > 0 ? printHistory : [
    {
      jobId: 'EX-98214A',
      fileName: 'Bank_Statement_Q3.pdf',
      kioskName: 'Cyber City Hub Kiosk',
      pages: 4,
      cost: 8.00,
      status: 'SHREDDED_DELETED',
      createdAt: '2026-09-18 12:30 PM'
    },
    {
      jobId: 'EX-54129B',
      fileName: 'Project_Proposal_Color.pdf',
      kioskName: 'Downtown Coworking Lounge',
      pages: 2,
      cost: 20.00,
      status: 'SHREDDED_DELETED',
      createdAt: '2026-09-17 04:15 PM'
    },
    {
      jobId: 'EX-12098C',
      fileName: 'Ticket_Pass_Pass.pdf',
      kioskName: 'University Student Union',
      pages: 1,
      cost: 2.00,
      status: 'FAILED_PAPER_JAM',
      refunded: true,
      createdAt: '2026-09-15 09:40 AM'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="max-w-2xl w-full glass-panel border border-dark-border rounded-3xl p-6 relative overflow-hidden shadow-2xl space-y-5">
        
        <div className="flex items-center justify-between border-b border-dark-border pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-neon/10 border border-neon/30 text-neon flex items-center justify-center">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Print History & Audit Logs</h3>
              <p className="text-xs text-slate-400">View recent kiosk transactions and shred status</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-xl border border-transparent hover:border-dark-border"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* History Items List */}
        <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
          {sampleHistory.map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-dark-bg border border-dark-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-dark-elevated border border-dark-border text-slate-300 flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4 text-neon" />
                </div>
                <div>
                  <h4 className="font-bold text-white line-clamp-1">{item.fileName}</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5 font-mono">
                    {item.kioskName} • {item.pages} pgs • ₹{item.cost.toFixed(2)}
                  </p>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">{item.createdAt}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                {item.status === 'SHREDDED_DELETED' ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-950/60 text-neon border border-neon/30">
                    <ShieldCheck className="w-3 h-3" /> Cloud Shredded
                  </span>
                ) : item.refunded || item.status === 'FAILED_PAPER_JAM' ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-amber-950/60 text-amber-300 border border-amber-500/40">
                    <AlertOctagon className="w-3 h-3 text-amber-400" /> Jammed (Refunded)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-800 text-slate-300">
                    <CheckCircle2 className="w-3 h-3 text-neon" /> Printed
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-dark-elevated hover:bg-dark-hover border border-dark-border text-slate-200 text-xs font-semibold"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
