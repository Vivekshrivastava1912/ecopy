import React, { useState, useEffect } from 'react';
import { CreditCard, QrCode, ShieldCheck, X, RefreshCw, AlertCircle, Clock, CheckCircle2, Smartphone } from 'lucide-react';

export default function PaymentModal({ 
  isOpen, 
  onClose, 
  config, 
  fileData, 
  selectedKiosk, 
  userDistanceMeters, 
  onPaymentSuccess, 
  showToast 
}) {
  const [paymentMethod, setPaymentMethod] = useState('upi'); // 'upi', 'card', 'qr'
  const [upiId, setUpiId] = useState('user@upi');
  const [paymentState, setPaymentState] = useState('IDLE'); // 'IDLE', 'PROCESSING', 'PENDING_WEBHOOK', 'FAILED', 'SUCCESS'
  const [webhookTimer, setWebhookTimer] = useState(15);
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
      setPaymentState('IDLE');
      onPaymentSuccess();
    }
    return () => clearInterval(interval);
  }, [paymentState, webhookTimer, onPaymentSuccess]);

  if (!isOpen) return null;

  const totalAmount = config ? config.totalPrice : 0;

  const handleInitiatePayment = (simulateFailure = false, simulateWebhookDelay = false) => {
    // 50 Meter Proximity Distance Validation check
    if (userDistanceMeters > 50) {
      if (showToast) {
        showToast({
          type: 'warning',
          title: 'Too Far from Kiosk',
          message: `You are currently ${userDistanceMeters}m away from ${selectedKiosk?.name}. Move within 50m to authorize payment.`
        });
      }
      return;
    }

    setPaymentState('PROCESSING');

    setTimeout(() => {
      if (simulateFailure) {
        setPaymentState('FAILED');
        setFailureReason('Bank server timeout or insufficient funds. Your print configuration has been saved.');
      } else if (simulateWebhookDelay) {
        setWebhookTimer(8);
        setPaymentState('PENDING_WEBHOOK');
      } else {
        // Instant Payment Success - Switch step immediately!
        setPaymentState('IDLE');
        onPaymentSuccess();
      }
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-lg flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      <div className="max-w-md w-full glass-panel-glow border border-dark-border rounded-2xl p-4 sm:p-6 relative overflow-hidden shadow-2xl max-h-[92vh] overflow-y-auto">
        
        <button
          onClick={onClose}
          disabled={paymentState === 'PROCESSING' || paymentState === 'PENDING_WEBHOOK'}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 text-slate-400 hover:text-white p-1 rounded-lg border border-transparent hover:border-dark-border transition-colors"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* State 1: IDLE Payment Selection */}
        {paymentState === 'IDLE' && (
          <div className="space-y-4 sm:space-y-5">
            <div>
              <span className="text-[9px] sm:text-[10px] font-mono font-bold text-neon bg-neon/10 px-2 py-0.5 rounded border border-neon/30">
                SECURE CHECKOUT
              </span>
              <h3 className="text-lg sm:text-xl font-extrabold text-white mt-0.5">Exopy Smart Payment</h3>
              <p className="text-[11px] sm:text-xs text-slate-400 truncate">
                Job: <span className="text-slate-200 font-semibold">{fileData?.name}</span>
              </p>
            </div>

            {/* Price breakdown pill */}
            <div className="p-3 sm:p-3.5 rounded-xl bg-dark-bg border border-dark-border flex items-center justify-between">
              <div>
                <p className="text-[10px] sm:text-[11px] text-slate-400 font-mono">Payable Amount</p>
                <p className="text-xl sm:text-2xl font-black text-white font-mono">₹{totalAmount.toFixed(2)}</p>
              </div>
              <div className="text-right text-[10px] sm:text-[11px] text-slate-400 font-mono">
                <p>{config?.pagesToPrint} Pg(s) • {config?.isColor ? 'Color' : 'B&W'}</p>
                <p>{config?.copies} Copy • {config?.isDuplex ? 'Duplex' : 'Single'}</p>
              </div>
            </div>

            {/* Payment Method Selector Tabs */}
            <div className="space-y-1.5">
              <label className="text-[11px] sm:text-xs font-bold text-slate-300">Select Payment Method</label>
              <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('upi')}
                  className={`p-2 sm:p-2.5 rounded-xl border text-[11px] sm:text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                    paymentMethod === 'upi'
                      ? 'bg-neon/10 border-neon text-neon shadow-neon-sm'
                      : 'bg-dark-bg border-dark-border text-slate-400'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  UPI / GPay
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('qr')}
                  className={`p-2 sm:p-2.5 rounded-xl border text-[11px] sm:text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                    paymentMethod === 'qr'
                      ? 'bg-neon/10 border-neon text-neon shadow-neon-sm'
                      : 'bg-dark-bg border-dark-border text-slate-400'
                  }`}
                >
                  <QrCode className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  Kiosk QR
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-2 sm:p-2.5 rounded-xl border text-[11px] sm:text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                    paymentMethod === 'card'
                      ? 'bg-neon/10 border-neon text-neon shadow-neon-sm'
                      : 'bg-dark-bg border-dark-border text-slate-400'
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  Card
                </button>
              </div>
            </div>

            {/* UPI Input / QR view */}
            {paymentMethod === 'upi' && (
              <div className="space-y-1">
                <label className="text-[10px] sm:text-[11px] font-semibold text-slate-400">UPI VPA ID</label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="w-full bg-dark-bg border border-dark-border focus:border-neon rounded-xl px-3 py-2 text-xs text-white outline-none font-mono"
                  placeholder="e.g. mobile@upi"
                />
              </div>
            )}

            {paymentMethod === 'qr' && (
              <div className="p-3 bg-dark-bg border border-dark-border rounded-xl text-center space-y-1">
                <div className="w-28 h-28 mx-auto bg-white p-1.5 rounded-xl flex items-center justify-center">
                  <div className="w-full h-full border border-black border-dashed flex items-center justify-center font-mono font-bold text-black text-[10px]">
                    [EXOPY-QR-PAY]
                  </div>
                </div>
                <p className="text-[10px] text-slate-400">Scan with PhonePe, Paytm, or BHIM UPI app</p>
              </div>
            )}

            {/* Payment Trigger Buttons */}
            <div className="space-y-1.5 pt-1">
              <button
                type="button"
                onClick={() => handleInitiatePayment(false, false)}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-neon to-emerald-500 text-black font-black text-xs tracking-wider shadow-neon-glow hover:opacity-95 transition-all"
              >
                PAY ₹{totalAmount.toFixed(2)} & PRINT NOW
              </button>

              {/* Edge Case Simulation Shortcuts */}
              <div className="flex gap-1.5 pt-0.5">
                <button
                  type="button"
                  onClick={() => handleInitiatePayment(true, false)}
                  className="w-1/2 py-1.5 rounded-lg bg-red-950/40 border border-red-500/40 text-red-300 text-[9px] font-semibold hover:bg-red-950/70"
                >
                  Test Payment Failure
                </button>
                <button
                  type="button"
                  onClick={() => handleInitiatePayment(false, true)}
                  className="w-1/2 py-1.5 rounded-lg bg-amber-950/40 border border-amber-500/40 text-amber-300 text-[9px] font-semibold hover:bg-amber-950/70"
                >
                  Test Webhook Delay
                </button>
              </div>
            </div>

            <div className="flex items-center justify-center gap-1 text-[9px] text-slate-500">
              <ShieldCheck className="w-3 h-3 text-neon" />
              <span>256-Bit Encrypted Payment • Instant Bank Verification</span>
            </div>
          </div>
        )}

        {/* State 2: Processing Spinner */}
        {paymentState === 'PROCESSING' && (
          <div className="py-8 text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full border-4 border-neon/20 border-t-neon animate-spin flex items-center justify-center"></div>
            <h4 className="text-sm font-bold text-white">Communicating with Banking Gateway...</h4>
            <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
              Please approve prompt on your UPI app.
            </p>
          </div>
        )}

        {/* State 3: Pending / Delayed Webhook Screen */}
        {paymentState === 'PENDING_WEBHOOK' && (
          <div className="py-6 text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center animate-pulse">
              <Clock className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-amber-300">Awaiting Bank Confirmation...</h4>
            <p className="text-[11px] text-slate-300 max-w-xs mx-auto leading-relaxed">
              Money deducted? We are waiting for your bank's webhook response. 
              <strong className="text-white block mt-0.5">Please do not pay twice!</strong>
            </p>

            <div className="p-3 bg-dark-bg border border-amber-500/30 rounded-xl max-w-xs mx-auto">
              <p className="text-[10px] font-mono text-slate-400">Polling Bank Server Engine</p>
              <p className="text-xl font-black text-amber-400 font-mono mt-0.5">{webhookTimer}s</p>
            </div>
          </div>
        )}

        {/* State 4: Payment Failed Modal */}
        {paymentState === 'FAILED' && (
          <div className="py-5 text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-red-950/60 border border-red-500/60 text-red-400 flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h4 className="text-base font-extrabold text-red-400">Payment Failed</h4>
            <p className="text-[11px] text-slate-300 max-w-xs mx-auto">
              {failureReason}
            </p>
            <div className="p-2.5 bg-dark-bg border border-dark-border rounded-xl text-left text-[10px] text-slate-400">
              <span className="text-emerald-400 font-bold">✓ Cart Preserved:</span> Your uploaded document and print specifications are safe.
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="w-1/2 py-2 rounded-xl border border-dark-border text-slate-300 hover:bg-dark-hover text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => setPaymentState('IDLE')}
                className="w-1/2 py-2 rounded-xl bg-red-500 hover:bg-red-400 text-white font-extrabold text-xs shadow-lg transition-all flex items-center justify-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                Retry Payment
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
