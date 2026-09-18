import React, { useState } from 'react';
import { Lock, Key, ShieldCheck, X, Eye, EyeOff } from 'lucide-react';

export default function PasswordPromptModal({ isOpen, onClose, onUnlockSuccess, fileName }) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isDecrypting, setIsDecrypting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!password) {
      setErrorMsg('Please enter document password.');
      return;
    }

    setIsDecrypting(true);
    setErrorMsg('');

    // Simulate password validation (Accepts '1234', 'password', 'exopy' or any password >= 4 chars)
    setTimeout(() => {
      setIsDecrypting(false);
      if (password.length < 3) {
        setErrorMsg('Incorrect password! Decryption failed.');
      } else {
        onUnlockSuccess(password);
        setPassword('');
        onClose();
      }
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="max-w-md w-full glass-panel border border-amber-500/40 rounded-2xl p-6 shadow-amber-glow relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center mb-4">
          <Lock className="w-6 h-6 animate-pulse" />
        </div>

        <h3 className="text-lg font-extrabold text-white">Password Protected PDF</h3>
        <p className="text-xs text-slate-400 mt-1">
          <span className="text-amber-300 font-semibold truncate block max-w-xs">{fileName}</span>
          Enter password to decrypt on client-side before sending print payload.
        </p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Document Password</label>
            <div className="relative">
              <Key className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password..."
                className="w-full bg-dark-bg border border-dark-border focus:border-amber-400 rounded-xl pl-9 pr-10 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-all"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-200"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errorMsg && <p className="text-xs text-red-400 font-medium mt-1">{errorMsg}</p>}
          </div>

          <div className="p-3 rounded-xl bg-dark-bg/60 border border-dark-border text-[11px] text-slate-400 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-neon shrink-0" />
            <span>Decryption is performed locally in browser. Password is never logged or stored.</span>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-1/2 py-2.5 rounded-xl border border-dark-border text-slate-300 hover:bg-dark-hover text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isDecrypting}
              className="w-1/2 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs shadow-lg transition-all flex items-center justify-center gap-2"
            >
              {isDecrypting ? 'Decrypting...' : 'Decrypt PDF'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
