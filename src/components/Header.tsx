import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { Settings, WifiOff } from 'lucide-react';

export const Header: React.FC = () => {
  const {
    effectiveOnline,
    isSimulatedOffline,
    setSimulatedOffline,
    isSyncing,
    pendingSyncCount,
    performSync,
    setIsProfileOpen
  } = useAppStore();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 pt-[env(safe-area-inset-top,0px)]">
      <div className="w-full px-4 h-14 flex items-center justify-between">
        
        {/* Left: Brand & Connection Status */}
        <div className="flex items-center gap-2">
          {/* Logo Sate Melingkar Merah */}
          <div className="w-9 h-9 rounded-full bg-brand-600 flex items-center justify-center shadow-sm text-white shrink-0">
            <span className="text-base select-none">🍢</span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-extrabold text-[15px] tracking-tight text-slate-900 leading-none">
              Taichan Portal
            </span>
            
            {/* Online / Offline clickable badge */}
            <button
              type="button"
              onClick={() => setSimulatedOffline(!isSimulatedOffline)}
              title={effectiveOnline ? 'Status Online (Klik untuk simulasi offline)' : 'Status Offline (Klik untuk online)'}
              className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide transition-colors ${
                effectiveOnline
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80 hover:bg-emerald-100'
                  : 'bg-amber-50 text-amber-700 border border-amber-300 hover:bg-amber-100'
              }`}
            >
              {effectiveOnline ? (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Online
                </>
              ) : (
                <>
                  <WifiOff className="w-2.5 h-2.5" />
                  Offline
                </>
              )}
            </button>

            {/* Syncing indicator or Pending count */}
            {isSyncing ? (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping"></span>
                Sync...
              </span>
            ) : pendingSyncCount > 0 ? (
              <button
                type="button"
                onClick={() => performSync()}
                title="Ada data antrean belum tersinkron ke cloud. Klik untuk sinkronisasi."
                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 hover:bg-amber-200 transition-colors animate-bounce"
              >
                <span>⚡</span>
                {pendingSyncCount} sync
              </button>
            ) : null}
          </div>
        </div>

        {/* Right: Pengaturan Sistem */}
        <div className="flex items-center">
          <button
            onClick={() => setIsProfileOpen(true)}
            className="w-8 h-8 rounded-full bg-brand-600 text-white flex items-center justify-center hover:bg-brand-700 active:scale-95 transition-all shadow-xs"
            title="Pengaturan Sistem & Database"
          >
            <Settings className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

      </div>
    </header>
  );
};
