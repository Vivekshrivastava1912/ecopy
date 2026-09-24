import React, { useRef } from 'react';
import { Printer, X, Download, ShieldCheck, CheckCircle2, QrCode, Sparkles, Copy, Check } from 'lucide-react';

export default function ReceiptModal({ isOpen, onClose, jobData, selectedKiosk }) {
  const [copied, setCopied] = React.useState(false);
  const receiptRef = useRef(null);

  if (!isOpen || !jobData) return null;

  const token = jobData.pinToken || jobData.jobId || 'EXP-8492';
  const txnId = jobData.transactionId || 'TXN-' + Math.random().toString(36).substring(2, 9).toUpperCase();
  const dateStr = jobData.createdAt ? new Date(jobData.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) : new Date().toLocaleString('en-IN');
  const cost = jobData.cost || jobData.totalCost || 2.0;
  const subtotal = (cost / 1.18).toFixed(2);
  const gst = (cost - subtotal).toFixed(2);
  const cgst = (gst / 2).toFixed(2);
  const sgst = (gst / 2).toFixed(2);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyToken = () => {
    navigator.clipboard.writeText(token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fade-in overflow-y-auto">
      <div className="max-w-md w-full glass-panel-glow border border-dark-border rounded-3xl p-5 sm:p-6 relative shadow-2xl space-y-4 my-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-xl border border-transparent hover:border-dark-border transition-colors print:hidden"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Title Bar */}
        <div className="flex items-center gap-2 print:hidden">
          <div className="w-8 h-8 rounded-lg bg-neon/10 border border-neon/30 text-neon flex items-center justify-center">
            <Printer className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Digital Tax Invoice</h3>
            <p className="text-[10px] text-slate-400">Official Kiosk Network Receipt</p>
          </div>
        </div>

        {/* Thermal / Paper Invoice Content Container (Printable) */}
        <div 
          id="printable-receipt" 
          ref={receiptRef}
          className="bg-white text-slate-900 rounded-2xl p-5 font-mono text-xs shadow-xl space-y-3.5 border border-slate-300 select-text"
        >
          {/* Receipt Header */}
          <div className="text-center border-b-2 border-dashed border-slate-300 pb-3 space-y-1">
            <div className="font-black text-base text-slate-950 tracking-wider">EXOPY SMART KIOSK</div>
            <p className="text-[10px] text-slate-600">Automated City Printing Network • Indore (M.P.)</p>
            <p className="text-[9px] text-slate-500">GSTIN: 23AABCE1928K1Z5 • Support: support@exopy.in</p>
            <div className="inline-block bg-slate-100 text-slate-800 px-2 py-0.5 rounded text-[9px] font-bold mt-1">
              ORIGINAL TAX INVOICE
            </div>
          </div>

          {/* Meta Info Grid */}
          <div className="grid grid-cols-2 gap-2 text-[10px] border-b border-dashed border-slate-300 pb-2.5">
            <div>
              <span className="text-slate-500 block">TOKEN / PIN:</span>
              <span className="font-extrabold text-slate-900 text-xs">{token}</span>
            </div>
            <div className="text-right">
              <span className="text-slate-500 block">INVOICE NO:</span>
              <span className="font-bold text-slate-900">{jobData.jobId || 'EX-8921'}</span>
            </div>
            <div>
              <span className="text-slate-500 block">TXN ID:</span>
              <span className="font-bold text-slate-800 truncate block">{txnId}</span>
            </div>
            <div className="text-right">
              <span className="text-slate-500 block">DATE & TIME:</span>
              <span className="text-slate-800">{dateStr}</span>
            </div>
          </div>

          {/* Kiosk Info */}
          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-[10px] space-y-0.5">
            <span className="text-slate-500 font-bold block text-[9px]">DISPENSING KIOSK LOCATION:</span>
            <p className="font-bold text-slate-900">{selectedKiosk?.name || jobData.kioskName || 'Gyan Sagar Vidya Niketan School Kiosk'}</p>
            <p className="text-slate-600 text-[9px]">{selectedKiosk?.location || 'Annapurna Road, Indore'}</p>
          </div>

          {/* Line Items Table */}
          <div className="space-y-1.5 border-b border-dashed border-slate-300 pb-3 text-[10px]">
            <div className="flex justify-between font-bold text-slate-700 border-b border-slate-200 pb-1 text-[9px]">
              <span>DESCRIPTION</span>
              <span>AMOUNT</span>
            </div>

            <div className="flex justify-between items-start">
              <div>
                <p className="font-bold text-slate-900 truncate max-w-[210px]">{jobData.fileName || 'document.pdf'}</p>
                <p className="text-[9px] text-slate-500">
                  {jobData.pages || jobData.pagesToPrintCount || 1} Pgs • {jobData.isColor ? 'Color' : 'B&W'} • {jobData.paperSize || 'A4'} • {jobData.layoutMode || '1-Up'}
                </p>
                {jobData.finishing && jobData.finishing !== 'None' && (
                  <p className="text-[9px] text-emerald-700 font-bold">+ Finishing: {jobData.finishing}</p>
                )}
                {jobData.couponApplied && (
                  <p className="text-[9px] text-emerald-700 font-bold">✓ Coupon Applied: {jobData.couponApplied}</p>
                )}
              </div>
              <span className="font-bold text-slate-900">₹{Number(cost).toFixed(2)}</span>
            </div>
          </div>

          {/* Financial Breakdown */}
          <div className="space-y-1 text-[10px] text-slate-600 border-b border-dashed border-slate-300 pb-2">
            <div className="flex justify-between">
              <span>Taxable Value:</span>
              <span>₹{subtotal}</span>
            </div>
            <div className="flex justify-between">
              <span>CGST (9%):</span>
              <span>₹{cgst}</span>
            </div>
            <div className="flex justify-between">
              <span>SGST (9%):</span>
              <span>₹{sgst}</span>
            </div>
            <div className="flex justify-between text-xs font-black text-slate-950 pt-1 border-t border-slate-200">
              <span>TOTAL PAID (INC. TAXES):</span>
              <span className="text-emerald-700">₹{Number(cost).toFixed(2)}</span>
            </div>
          </div>

          {/* Barcode & Privacy QR Stamp */}
          <div className="flex items-center justify-between pt-1">
            <div className="space-y-1">
              <span className="text-[8px] text-slate-500 block">KIOSK SCAN PIN</span>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-black text-slate-950 font-mono tracking-wider bg-slate-100 px-2 py-0.5 rounded border border-slate-300">
                  {token}
                </span>
                <button
                  type="button"
                  onClick={handleCopyToken}
                  className="p-1 rounded bg-slate-200 hover:bg-slate-300 text-slate-700 print:hidden"
                  title="Copy PIN"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
              <p className="text-[8px] text-emerald-700 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> VERIFIED & CLOUD SHREDDED
              </p>
            </div>

            {/* Simulated QR Code Stamp */}
            <div className="w-16 h-16 bg-slate-950 p-1 rounded-lg flex flex-col items-center justify-center text-white text-[7px] text-center">
              <QrCode className="w-10 h-10 text-white" />
              <span>TOKEN QR</span>
            </div>
          </div>

          {/* Footer note */}
          <div className="text-center pt-2 text-[8px] text-slate-500 border-t border-slate-200">
            Thank you for printing with Exopy Indore! • Instant paper release authorized
          </div>
        </div>

        {/* Modal Action Buttons (Hidden when printing) */}
        <div className="flex items-center gap-2 pt-2 print:hidden">
          <button
            type="button"
            onClick={handlePrint}
            className="flex-1 py-2.5 rounded-xl bg-neon hover:bg-neon-hover text-black font-extrabold text-xs flex items-center justify-center gap-2 shadow-neon-sm transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>PRINT / SAVE PDF RECEIPT</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-dark-card border border-dark-border text-slate-300 hover:bg-dark-hover font-semibold text-xs"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
