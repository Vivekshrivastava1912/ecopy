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

    // Simulate password validation (Accepts any password >= 3 chars)
    setTimeout(() => {
      setIsDecrypting(false);
      if (password.length < 3) {
        setErrorMsg('Incorrect password! Decryption failed.');
      } else {
        onUnlockSuccess(password);
        setPassword('');
        onClose();
      }
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div className="max-w-md w-full bg-white border border-slate-200 rounded-lg p-5 sm:p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 p-1 rounded-md hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-10 h-10 rounded-md bg-black text-white flex items-center justify-center mb-3">
          <Lock className="w-5 h-5" />
        </div>

        <h3 className="text-lg font-black text-slate-950">Password Protected PDF</h3>
        <p className="text-xs text-slate-500 mt-1">
          <span className="text-slate-900 font-semibold truncate block max-w-xs">{fileName}</span>
          Enter password to decrypt on client-side before sending print payload.
        </p>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Document Password</label>
            <div className="relative">
              <Key className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password..."
                className="w-full bg-slate-50 border border-slate-300 focus:border-black rounded-md pl-9 pr-10 py-2 text-xs text-slate-900 placeholder-slate-400 outline-none transition-colors font-mono"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errorMsg && <p className="text-xs text-red-600 font-medium mt-1">{errorMsg}</p>}
          </div>

          <div className="p-2.5 rounded-md bg-slate-50 border border-slate-200 text-[11px] text-slate-600 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-slate-900 shrink-0" />
            <span>Decryption is performed locally in browser. Password is never logged.</span>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="w-1/2 py-2 rounded-md border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isDecrypting}
              className="w-1/2 py-2 rounded-md bg-black hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-1 cursor-pointer"
            >
              {isDecrypting ? 'Decrypting...' : 'Decrypt PDF'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
