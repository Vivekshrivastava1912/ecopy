import React from 'react';
import { Shield, Mail, Phone, Cpu, CheckCircle2 } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full border-t border-slate-200 bg-white text-slate-600 text-xs mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Brand & Description */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-md bg-black text-white flex items-center justify-center font-bold">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 6 2 18 2 18 9"></polyline>
                  <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                  <rect x="6" y="14" width="12" height="8" rx="1"></rect>
                </svg>
              </div>
              <span className="text-base font-black tracking-wider text-slate-900 font-mono">ECOPY</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Automated self-service cloud printing platform. Upload documents, rotate pages, choose custom ranges, and collect prints instantly.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-slate-700 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-black"></span>
              <span>Cloud API Engine Online</span>
            </div>
          </div>

          {/* Quick Features */}
          <div className="space-y-3">
            <h4 className="text-slate-900 font-bold text-xs uppercase tracking-wider">Features</h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-slate-900" /> Drag & Drop PDF / Image Upload
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-slate-900" /> 90° - 270° Orientation Rotation
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-slate-900" /> B&W & Color Laser Printing
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-slate-900" /> Custom Page Range Selection
              </li>
            </ul>
          </div>

          {/* Security & Privacy */}
          <div className="space-y-3">
            <h4 className="text-slate-900 font-bold text-xs uppercase tracking-wider">Privacy & Security</h4>
            <div className="p-3 rounded-md bg-slate-50 border border-slate-200 space-y-1">
              <div className="flex items-center gap-1.5 text-slate-900 font-bold text-[11px]">
                <Shield className="w-3.5 h-3.5 text-black" /> 100% Zero-Trace Policy
              </div>
              <p className="text-[11px] text-slate-500 leading-snug">
                Your uploaded documents are permanently deleted from database upon confirmed print receipt.
              </p>
            </div>
          </div>

          {/* Support */}
          <div className="space-y-3">
            <h4 className="text-slate-900 font-bold text-xs uppercase tracking-wider">Support</h4>
            <div className="space-y-2 text-xs text-slate-600">
              <a
                href="mailto:support@ecopy.io"
                className="flex items-center gap-2 hover:text-black transition-colors"
              >
                <Mail className="w-3.5 h-3.5 text-slate-700" /> support@ecopy.io
              </a>
              <a
                href="https://wa.me/919876543210"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 hover:text-black transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-slate-700" /> WhatsApp Support (+91 98765 43210)
              </a>
              <p className="text-[11px] text-slate-400 pt-1">
                Average support response time: &lt; 5 minutes
              </p>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400 font-mono">
          <p>© 2026 Ecopy Cloud Print Engine. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-slate-600">
              <Cpu className="w-3.5 h-3.5 text-slate-900" /> Powered by MongoDB Atlas
            </span>
            <span>•</span>
            <span>English (EN-US)</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

