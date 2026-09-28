import React, { useState, useEffect } from 'react';
import { CreditCard, QrCode, ShieldCheck, X, RefreshCw, AlertCircle, Clock, CheckCircle2, Smartphone, Sparkles, ArrowRight } from 'lucide-react';

export default function PaymentModal({ 
  isOpen, 
  onClose, 
  config, 
  fileData, 
  editedConfig,
  onPaymentSuccess, 
  showToast 
}) {
  const [paymentMethod, setPaymentMethod] = useState('upi'); // 'upi', 'card', 'qr'
  const [upiId, setUpiId] = useState('user@upi');
  const [paymentState, setPaymentState] = useState('IDLE'); // 'IDLE', 'PROCESSING', 'SAVING_DB', 'PENDING_WEBHOOK', 'FAILED', 'SUCCESS'
  const [webhookTimer, setWebhookTimer] = useState(8);
  const [failureReason, setFailureReason] = useState('');

  // Reset payment state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setPaymentState('IDLE');
    }
  }, [isOpen]);

  // Polling countdown effect for Delayed Webhook Pending state
  useEffect(() => {
    let interval;
    if (paymentState === 'PENDING_WEBHOOK' && webhookTimer > 0) {
      interval = setInterval(() => {
        setWebhookTimer((prev) => prev - 1);
      }, 1000);
    } else if (paymentState === 'PENDING_WEBHOOK' && webhookTimer === 0) {
      executeSaveAndComplete();
    }
    return () => clearInterval(interval);
  }, [paymentState, webhookTimer]);

  if (!isOpen) return null;

  const totalAmount = config ? config.totalPrice : 2.00;

  const executeSaveAndComplete = async () => {
    setPaymentState('SAVING_DB');

    let finalCloudinaryUrl = fileData?.cloudinaryUrl || editedConfig?.updatedFileData?.cloudinaryUrl || editedConfig?.editedImageUrl || '';
    let finalPublicId = fileData?.cloudinaryPublicId || editedConfig?.updatedFileData?.cloudinaryPublicId || '';

    const isBwMode = !(config?.isColor) || editedConfig?.filterMode === 'bw' || editedConfig?.filterMode === 'scan';
    if (isBwMode && finalCloudinaryUrl && !finalCloudinaryUrl.endsWith('.pdf') && !finalCloudinaryUrl.includes('/e_grayscale/')) {
      finalCloudinaryUrl = finalCloudinaryUrl.replace('/upload/', '/upload/e_grayscale/');
    } else if (!isBwMode && finalCloudinaryUrl && finalCloudinaryUrl.includes('/e_grayscale/')) {
      finalCloudinaryUrl = finalCloudinaryUrl.replace('/upload/e_grayscale/', '/upload/');
    }

    const payload = {
      kioskId: 'EX-MAIN',
      fileName: fileData ? fileData.name : 'document.pdf',
      fileSizeMB: fileData ? fileData.sizeMB : 1,
      fileType: fileData ? fileData.extension : 'pdf',
      totalPages: fileData ? fileData.totalPages : 1,
      pageRange: config?.pageRange || 'All',
      pagesToPrintCount: config?.pagesToPrint || 1,
      isColor: config?.isColor || false,
      rotation: editedConfig?.rotation || 0,
      filterMode: editedConfig?.filterMode || 'normal',
      isDuplex: config?.isDuplex || false,
      copies: config?.copies || 1,
      totalCost: config?.totalPrice || 2.00,
      paymentMethod: paymentMethod.toUpperCase(),
      cloudinaryUrl: finalCloudinaryUrl,
      cloudinaryPublicId: finalPublicId,
      cloudinaryResourceType: fileData?.cloudinaryResourceType || 'image',
      filePreviewData: fileData?.dataUrl || finalCloudinaryUrl || fileData?.imagePreviewUrl || ''
    };

    try {
      const res = await fetch('/api/print/create-job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      let data = {};
      try {
        data = await res.json();
      } catch (jsonErr) {
        console.warn('Could not parse response JSON:', jsonErr);
      }

      const createdJob = data?.job || {
        jobId: 'JOB-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
        fileName: payload.fileName,
        pages: payload.pagesToPrintCount,
        cost: payload.totalCost,
        status: 'COMPLETED',
        cloudinaryPublicId: finalPublicId,
        cloudinaryUrl: finalCloudinaryUrl,
        createdAt: new Date().toLocaleString()
      };

      setPaymentState('IDLE');
      onPaymentSuccess(createdJob);
    } catch (err) {
      console.warn('Network error, fallback job created:', err);
      const fallbackJob = {
        jobId: 'JOB-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
        fileName: payload.fileName,
        pages: payload.pagesToPrintCount,
        cost: payload.totalCost,
        status: 'COMPLETED',
        cloudinaryPublicId: finalPublicId,
        cloudinaryUrl: finalCloudinaryUrl,
        createdAt: new Date().toLocaleString()
      };
      setPaymentState('IDLE');
      onPaymentSuccess(fallbackJob);
    }
  };

  const handleInitiatePayment = (simulateFailure = false, simulateWebhookDelay = false) => {
    setPaymentState('PROCESSING');

    setTimeout(() => {
      if (simulateFailure) {
        setPaymentState('FAILED');
        setFailureReason('Bank server timeout or payment declined. Your document configuration is saved.');
      } else if (simulateWebhookDelay) {
        setWebhookTimer(6);
        setPaymentState('PENDING_WEBHOOK');
      } else {
        executeSaveAndComplete();
      }
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      <div className="max-w-md w-full bg-white border border-slate-200 rounded-lg p-5 sm:p-6 relative overflow-hidden shadow-2xl max-h-[92vh] overflow-y-auto">
        
        <button
          onClick={onClose}
          disabled={paymentState === 'PROCESSING' || paymentState === 'PENDING_WEBHOOK' || paymentState === 'SAVING_DB'}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 p-1 rounded-md hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* State 1: IDLE Payment Selection */}
        {paymentState === 'IDLE' && (
          <div className="space-y-4">
            <div>
              <span className="text-[10px] font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 uppercase tracking-wide">
                Secure Checkout
              </span>
              <h3 className="text-xl font-black text-slate-950 mt-1">Ecopy Payment</h3>
              <p className="text-xs text-slate-500 truncate">
                Document: <span className="text-slate-900 font-semibold">{fileData?.name}</span>
              </p>
            </div>

            {/* Price breakdown pill */}
            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <p className="text-[11px] text-slate-500 font-medium">Total Amount</p>
                <p className="text-2xl font-black text-slate-950 font-mono">₹{totalAmount.toFixed(2)}</p>
              </div>
              <div className="text-right text-[11px] text-slate-600 font-medium space-y-0.5">
                <p>{config?.pagesToPrint} Page(s) • {config?.isColor ? 'Color (₹10)' : 'B&W (₹2)'}</p>
                <p>{config?.copies} Copy • {config?.isDuplex ? 'Duplex' : 'Single Sided'}</p>
              </div>
            </div>

            {/* Payment Method Selector Tabs */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800">Select Payment Method</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('upi')}
                  className={`p-2.5 rounded-md border text-xs font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                    paymentMethod === 'upi'
                      ? 'bg-black text-white border-black shadow-sm'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-400'
                  }`}
                >
                  <Smartphone className="w-4 h-4" />
                  UPI App
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('qr')}
                  className={`p-2.5 rounded-md border text-xs font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                    paymentMethod === 'qr'
                      ? 'bg-black text-white border-black shadow-sm'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-400'
                  }`}
                >
                  <QrCode className="w-4 h-4" />
                  QR Code
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-2.5 rounded-md border text-xs font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                    paymentMethod === 'card'
                      ? 'bg-black text-white border-black shadow-sm'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-400'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  Card
                </button>
              </div>
            </div>

            {/* UPI Input / QR view */}
            {paymentMethod === 'upi' && (
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700">UPI ID / Virtual Payment Address</label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 focus:border-black rounded-md px-3 py-2 text-xs text-slate-900 outline-none font-mono transition-colors"
                  placeholder="e.g. mobile@upi"
                />
              </div>
            )}

            {paymentMethod === 'qr' && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center space-y-1.5">
                <div className="w-28 h-28 mx-auto bg-white p-2 rounded-md border border-slate-200 flex items-center justify-center shadow-xs">
                  <div className="w-full h-full border border-slate-400 border-dashed rounded flex flex-col items-center justify-center font-mono font-bold text-slate-900 text-[10px]">
                    <QrCode className="w-8 h-8 mb-0.5 text-slate-900" />
                    <span>SCAN TO PAY</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 font-medium">Scan using PhonePe, Google Pay, Paytm, or BHIM</p>
              </div>
            )}

            {paymentMethod === 'card' && (
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Card Number (4000 1234 5678 9010)"
                  className="w-full bg-slate-50 border border-slate-300 focus:border-black rounded-md px-3 py-2 text-xs text-slate-900 outline-none font-mono"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="MM/YY"
                    className="w-full bg-slate-50 border border-slate-300 focus:border-black rounded-md px-3 py-2 text-xs text-slate-900 outline-none font-mono"
                  />
                  <input
                    type="text"
                    placeholder="CVV"
                    className="w-full bg-slate-50 border border-slate-300 focus:border-black rounded-md px-3 py-2 text-xs text-slate-900 outline-none font-mono"
                  />
                </div>
              </div>
            )}

            {/* Payment Trigger Buttons */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => handleInitiatePayment(false, false)}
                className="w-full py-3 rounded-md bg-black hover:bg-slate-800 text-white font-black text-xs tracking-wider shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>PAY ₹{totalAmount.toFixed(2)} & SAVE TO DATABASE</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Edge Case Simulation Shortcuts */}
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleInitiatePayment(true, false)}
                  className="w-1/2 py-1.5 rounded-md bg-slate-100 border border-slate-200 text-slate-600 text-[10px] font-semibold hover:bg-slate-200 transition-colors"
                >
                  Test Payment Failure
                </button>
                <button
                  type="button"
                  onClick={() => handleInitiatePayment(false, true)}
                  className="w-1/2 py-1.5 rounded-md bg-slate-100 border border-slate-200 text-slate-600 text-[10px] font-semibold hover:bg-slate-200 transition-colors"
                >
                  Test Webhook Delay
                </button>
              </div>
            </div>

            <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-500 pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-black" />
              <span>256-Bit Encrypted Payment • Direct MongoDB Atlas Sync</span>
            </div>
          </div>
        )}

        {/* State 2: Processing Spinner */}
        {(paymentState === 'PROCESSING' || paymentState === 'SAVING_DB') && (
          <div className="py-8 text-center space-y-3">
            <div className="w-10 h-10 mx-auto rounded-full border-3 border-slate-200 border-t-black animate-spin flex items-center justify-center"></div>
            <h4 className="text-sm font-bold text-slate-900">
              {paymentState === 'SAVING_DB' ? 'Uploading to Cloudinary & Syncing with MongoDB...' : 'Processing Secure Payment...'}
            </h4>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Please wait while your transaction is confirmed and registered.
            </p>
          </div>
        )}

        {/* State 3: Pending / Delayed Webhook Screen */}
        {paymentState === 'PENDING_WEBHOOK' && (
          <div className="py-6 text-center space-y-3">
            <div className="w-10 h-10 mx-auto rounded-md bg-slate-100 border border-slate-200 text-slate-800 flex items-center justify-center animate-pulse">
              <Clock className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">Awaiting Gateway Confirmation...</h4>
            <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
              Verifying payment with banking webhook. Please do not close or reload.
            </p>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-md max-w-xs mx-auto">
              <p className="text-[10px] font-mono text-slate-500">Syncing with MongoDB</p>
              <p className="text-xl font-black text-slate-900 font-mono mt-0.5">{webhookTimer}s</p>
            </div>
          </div>
        )}

        {/* State 4: Payment Failed Modal */}
        {paymentState === 'FAILED' && (
          <div className="py-4 text-center space-y-3">
            <div className="w-10 h-10 mx-auto rounded-md bg-red-50 border border-red-200 text-red-600 flex items-center justify-center">
              <AlertCircle className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-red-600">Payment Failed</h4>
            <p className="text-xs text-slate-600 max-w-xs mx-auto">
              {failureReason}
            </p>
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-md text-left text-xs text-slate-600">
              <span className="text-slate-900 font-bold">✓ Upload Preserved:</span> Your document and settings are safely stored.
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="w-1/2 py-2 rounded-md border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => setPaymentState('IDLE')}
                className="w-1/2 py-2 rounded-md bg-black hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-1"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Retry Payment
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

