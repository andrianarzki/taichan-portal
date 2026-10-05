import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { db } from '../db';
import { clearAllOrdersFromSupabase } from '../services/supabase';
import { 
  Settings, 
  X, 
  Trash2, 
  Check, 
  AlertTriangle,
  Loader2
} from 'lucide-react';

export const ProfileSettingsModal: React.FC = () => {
  const {
    isProfileOpen,
    setIsProfileOpen,
    effectiveOnline,
    checkPendingSync,
    resetInputForm
  } = useAppStore();

  const [isResetting, setIsResetting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  if (!isProfileOpen) return null;

  const handleResetData = async () => {
    const isConfirmed = window.confirm(
      'Apakah Anda yakin ingin mengosongkan SEMUA data antrean & pesanan?\n\n' +
      'Tindakan ini akan menghapus permanen semua pesanan di perangkat ini (IndexedDB) dan di cloud database Supabase.'
    );

    if (!isConfirmed) return;

    setIsResetting(true);
    setFeedbackMessage(null);

    try {
      let supabaseMessage = '';

      // 1. Delete all orders from Supabase cloud
      if (effectiveOnline) {
        const supabaseRes = await clearAllOrdersFromSupabase();
        if (!supabaseRes.success) {
          console.warn('Gagal menghapus orders di Supabase:', supabaseRes.error);
          supabaseMessage = ' (Cloud: Gagal terhubung)';
        } else {
          supabaseMessage = ' (Lokal & Supabase)';
        }
      } else {
        supabaseMessage = ' (Lokal saja, Supabase Offline)';
      }

      // 2. Clear all orders from local IndexedDB
      await db.orders.clear();

      // 3. Reset form states & pending count
      resetInputForm();
      await checkPendingSync();

      setResetSuccess(true);
      setFeedbackMessage(`Semua data pesanan berhasil dikosongkan${supabaseMessage}!`);
      setTimeout(() => {
        setResetSuccess(false);
        setFeedbackMessage(null);
      }, 3500);
    } catch (err: any) {
      console.error('Gagal mengosongkan data pesanan:', err);
      alert('Terjadi kesalahan saat mengosongkan data: ' + (err?.message || err));
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl p-5 border border-slate-200/90 text-left animate-in fade-in zoom-in-95 duration-200 space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">Pengaturan Sistem</h3>
              <p className="text-[11px] text-slate-400 font-medium">Taichan Portal POS</p>
            </div>
          </div>
          <button
            onClick={() => setIsProfileOpen(false)}
            className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Section: Manajemen Basis Data & Reset Pesanan */}
        <div className="p-4 bg-red-50/70 rounded-2xl border border-red-200/80 space-y-3">
          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-red-100 text-red-700 flex items-center justify-center shrink-0 mt-0.5">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-red-950">Kosongkan Data Pesanan</h4>
              <p className="text-[11px] text-red-800/80 leading-relaxed mt-0.5">
                Menghapus seluruh antrean dapur dan riwayat transaksi, baik di memori browser lokal maupun tabel <strong className="font-semibold">orders</strong> di cloud Supabase.
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={isResetting}
            onClick={handleResetData}
            className="w-full h-10 px-3 rounded-xl bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm active:scale-98 transition-all"
          >
            {isResetting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Menghapus data pesanan...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                <span>Kosongkan Semua Data Pesanan</span>
              </>
            )}
          </button>

          {resetSuccess && feedbackMessage && (
            <div className="p-2.5 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-900 text-[11px] font-bold flex items-center gap-2 animate-in fade-in duration-200">
              <Check className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>{feedbackMessage}</span>
            </div>
          )}
        </div>

        {/* Close button */}
        <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsProfileOpen(false)}
            className="flex-1 h-10 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
