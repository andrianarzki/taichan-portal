import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { 
  getSupabaseCredentials, 
  saveSupabaseCredentials, 
  isSupabaseActive 
} from '../services/supabase';
import { db, seedInitialDataIfEmpty } from '../db';
import { 
  Settings, 
  X, 
  Wifi, 
  WifiOff, 
  Database, 
  RotateCcw, 
  Check, 
  RefreshCw
} from 'lucide-react';

export const ProfileSettingsModal: React.FC = () => {
  const {
    isProfileOpen,
    setIsProfileOpen,
    isSimulatedOffline,
    setSimulatedOffline,
    effectiveOnline,
    performSync,
    checkPendingSync
  } = useAppStore();

  const [supabaseUrl, setSupabaseUrl] = useState(() => getSupabaseCredentials().url);
  const [supabaseKey, setSupabaseKey] = useState(() => getSupabaseCredentials().key);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  if (!isProfileOpen) return null;

  const handleSaveProfile = () => {
    saveSupabaseCredentials(supabaseUrl, supabaseKey);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleResetData = async () => {
    if (confirm('Apakah Anda yakin ingin memuat ulang data demo awal Taichan Portal? Semua antrean baru akan diatur ulang.')) {
      await db.orders.clear();
      await seedInitialDataIfEmpty();
      await checkPendingSync();
      setResetSuccess(true);
      setTimeout(() => setResetSuccess(false), 2000);
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

        {/* Section 1: Simulasi Mode Jaringan Offline-First */}
        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {effectiveOnline ? (
                <Wifi className="w-4 h-4 text-emerald-600" />
              ) : (
                <WifiOff className="w-4 h-4 text-amber-600" />
              )}
              <div>
                <span className="font-extrabold text-xs text-slate-900 block">
                  Simulasi Offline Mode
                </span>
                <span className="text-[10px] text-slate-500">
                  {effectiveOnline ? 'Status: Terhubung Jaringan' : 'Status: Beroperasi Tanpa Internet'}
                </span>
              </div>
            </div>

            {/* Toggle switch */}
            <button
              type="button"
              onClick={() => setSimulatedOffline(!isSimulatedOffline)}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                isSimulatedOffline ? 'bg-amber-600' : 'bg-slate-300'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  isSimulatedOffline ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
          <p className="text-[10px] text-slate-400 leading-normal">
            Aktifkan untuk menguji fitur <strong>Offline-First</strong>: semua pencatatan pesanan dan antrean berjalan instan di IndexedDB tanpa jeda waktu.
          </p>
        </div>

        {/* Section 2: Supabase Cloud Database */}
        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-slate-800">
              <Database className="w-4 h-4 text-brand-600" />
              <span className="font-extrabold text-xs">Sinkronisasi Cloud Supabase</span>
            </div>
            {isSupabaseActive() ? (
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                Terhubung
              </span>
            ) : (
              <span className="text-[10px] font-bold text-slate-500 bg-slate-200 px-1.5 py-0.5 rounded">
                Lokal Aktif
              </span>
            )}
          </div>

          <div className="space-y-1.5">
            <input
              type="text"
              value={supabaseUrl}
              onChange={(e) => setSupabaseUrl(e.target.value)}
              placeholder="https://xyz.supabase.co"
              className="w-full h-8 px-2.5 text-[11px] font-mono text-slate-800 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-brand-500"
            />
            <input
              type="password"
              value={supabaseKey}
              onChange={(e) => setSupabaseKey(e.target.value)}
              placeholder="Supabase Anon Public Key"
              className="w-full h-8 px-2.5 text-[11px] font-mono text-slate-800 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-brand-500"
            />
          </div>
          <p className="text-[9.5px] text-slate-400">
            *Kredensial tersimpan di penyimpanan browser untuk sinkronisasi otomatis ke tabel orders.
          </p>
        </div>

        {/* Section 3: Data Demo Reset */}
        <div className="flex items-center justify-between pt-1">
          <button
            type="button"
            onClick={handleResetData}
            className="text-[11px] font-bold text-slate-600 hover:text-brand-600 flex items-center gap-1 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Data Demo
          </button>

          {resetSuccess && (
            <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5">
              <Check className="w-3 h-3" /> Data Direset
            </span>
          )}
        </div>

        {/* Save & Close buttons */}
        <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
          <button
            type="button"
            onClick={handleSaveProfile}
            className="flex-1 h-10 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-brand-600/20 active:scale-95 transition-all"
          >
            {saveSuccess ? (
              <>
                <Check className="w-4 h-4" />
                Tersimpan!
              </>
            ) : (
              'Simpan Perubahan'
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
