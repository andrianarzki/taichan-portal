import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { INITIAL_MENU_ITEMS } from '../data/menu';
import { formatRupiah } from '../utils/format';
import { QrCode, X, CheckCircle, ShieldCheck } from 'lucide-react';

export const QRISModal: React.FC = () => {
  const { isQrisModalOpen, setIsQrisModalOpen, cart, outletName } = useAppStore();
  const [countdown, setCountdown] = useState(120);

  // Compute total
  let totalAmount = 0;
  Object.entries(cart).forEach(([menuId, val]) => {
    const item = INITIAL_MENU_ITEMS.find((m) => m.id === menuId);
    if (item && val.quantity > 0) {
      totalAmount += item.price * val.quantity;
    }
  });

  useEffect(() => {
    if (!isQrisModalOpen) {
      setCountdown(120);
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [isQrisModalOpen]);

  if (!isQrisModalOpen) return null;

  const minutes = Math.floor(countdown / 60);
  const seconds = String(countdown % 60).padStart(2, '0');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-4">
      <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl p-5 border border-slate-200/90 text-center animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={() => setIsQrisModalOpen(false)}
          className="absolute right-4 top-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header QRIS Brand */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-black border border-blue-200/70 mb-2">
          <QrCode className="w-3.5 h-3.5" />
          <span>QRIS STANDAR PEMBAYARAN NASIONAL</span>
        </div>

        <h3 className="font-black text-base text-slate-900 mt-1">{outletName}</h3>
        <p className="text-[11px] text-slate-400 font-mono">NMID: ID1024389271638</p>

        {/* Dynamic Total */}
        <div className="my-3 py-2 px-3 bg-slate-50 rounded-2xl border border-slate-100">
          <span className="text-[10px] font-bold text-slate-400 uppercase block">Total Pembayaran QRIS</span>
          <span className="font-black text-xl text-slate-900 tracking-tight">
            {formatRupiah(totalAmount)}
          </span>
        </div>

        {/* QR Code SVG Visual */}
        <div className="relative mx-auto w-52 h-52 p-3 bg-white border-2 border-slate-900 rounded-2xl shadow-inner flex items-center justify-center">
          <svg className="w-full h-full" viewBox="0 0 100 100" fill="none">
            {/* Position detection squares */}
            {/* Top-left */}
            <rect x="5" y="5" width="26" height="26" rx="4" fill="#0F172A" />
            <rect x="9" y="9" width="18" height="18" rx="2" fill="#FFFFFF" />
            <rect x="13" y="13" width="10" height="10" rx="1" fill="#0F172A" />
            {/* Top-right */}
            <rect x="69" y="5" width="26" height="26" rx="4" fill="#0F172A" />
            <rect x="73" y="9" width="18" height="18" rx="2" fill="#FFFFFF" />
            <rect x="77" y="13" width="10" height="10" rx="1" fill="#0F172A" />
            {/* Bottom-left */}
            <rect x="5" y="69" width="26" height="26" rx="4" fill="#0F172A" />
            <rect x="9" y="73" width="18" height="18" rx="2" fill="#FFFFFF" />
            <rect x="13" y="77" width="10" height="10" rx="1" fill="#0F172A" />

            {/* Matrix random/decorative dots */}
            <rect x="36" y="8" width="6" height="6" fill="#0F172A" />
            <rect x="46" y="8" width="6" height="12" fill="#0F172A" />
            <rect x="56" y="14" width="6" height="6" fill="#0F172A" />
            <rect x="36" y="24" width="16" height="6" fill="#0F172A" />
            <rect x="56" y="24" width="8" height="8" fill="#0F172A" />

            {/* Center Logo Badge */}
            <circle cx="50" cy="50" r="13" fill="#C5221F" />
            <text x="50" y="53" textAnchor="middle" fill="#FFFFFF" fontSize="7" fontWeight="900" fontFamily="sans-serif">
              TP
            </text>

            <rect x="8" y="38" width="8" height="6" fill="#0F172A" />
            <rect x="22" y="38" width="12" height="6" fill="#0F172A" />
            <rect x="8" y="52" width="6" height="8" fill="#0F172A" />
            <rect x="20" y="52" width="10" height="6" fill="#0F172A" />

            <rect x="68" y="38" width="14" height="6" fill="#0F172A" />
            <rect x="86" y="44" width="6" height="14" fill="#0F172A" />
            <rect x="68" y="52" width="12" height="6" fill="#0F172A" />

            <rect x="38" y="68" width="10" height="6" fill="#0F172A" />
            <rect x="54" y="68" width="8" height="14" fill="#0F172A" />
            <rect x="38" y="80" width="12" height="12" fill="#0F172A" />
            <rect x="68" y="76" width="14" height="6" fill="#0F172A" />
            <rect x="86" y="84" width="6" height="8" fill="#0F172A" />
          </svg>
        </div>

        {/* Scan instruction & Timer */}
        <div className="mt-3 space-y-1">
          <p className="text-xs font-semibold text-slate-600">
            Arahkan kamera ponsel pembeli ke kode QR
          </p>
          <div className="text-[11px] font-bold text-slate-400">
            Masa berlaku: <span className="text-brand-600">{minutes}:{seconds}</span>
          </div>
        </div>

        {/* Confirm / Close Button */}
        <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
          <button
            type="button"
            onClick={() => setIsQrisModalOpen(false)}
            className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
          >
            <CheckCircle className="w-4 h-4" />
            Konfirmasi QRIS Diterima
          </button>
        </div>

      </div>
    </div>
  );
};
