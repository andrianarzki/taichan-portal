import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { Settings, WifiOff } from 'lucide-react';

export const Header: React.FC = () => {
  const {
    activeTab,
    effectiveOnline,
    isSimulatedOffline,
    setSimulatedOffline,
    setIsProfileOpen,
    outletName
  } = useAppStore();

  const getSubTitle = () => {
    switch (activeTab) {
      case 'input':
        return 'Input Pesanan';
      case 'kitchen':
        return 'Antrean Dapur (FIFO)';
      case 'history':
        return 'Omzet & Riwayat';
      default:
        return outletName;
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100">
      <div className="w-full px-4 h-14 flex items-center justify-between">
        
        {/* Left: Brand & Connection Status */}
        <div className="flex items-center gap-2.5">
          {/* Logo Sate Melingkar Merah */}
          <div className="w-9 h-9 rounded-full bg-brand-600 flex items-center justify-center shadow-sm text-white shrink-0">
            <span className="text-base select-none">🍢</span>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
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
            </div>

            <span className="text-[11px] font-medium text-slate-400 mt-0.5">
              {getSubTitle()}
            </span>
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
