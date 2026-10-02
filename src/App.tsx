import React, { useEffect } from 'react';
import { useAppStore } from './store/useAppStore';
import { seedInitialDataIfEmpty } from './db';
import { Header } from './components/Header';
import { NavigationTabs } from './components/NavigationTabs';
import { TabInputOrder } from './components/TabInputOrder';
import { TabKitchenOrders } from './components/TabKitchenOrders';
import { TabOmzetReport } from './components/TabOmzetReport';
import { ThermalSlipModal } from './components/ThermalSlipModal';
import { ProfileSettingsModal } from './components/ProfileSettingsModal';
import { WifiOff } from 'lucide-react';

export const App: React.FC = () => {
  const {
    activeTab,
    effectiveOnline,
    setRealOnline,
    checkPendingSync,
    performSync
  } = useAppStore();

  useEffect(() => {
    // 1. Seed demo data if database is fresh
    seedInitialDataIfEmpty().then(() => {
      checkPendingSync();
    });

    // 2. Setup browser network event listeners
    const handleOnline = () => {
      setRealOnline(true);
      performSync();
    };

    const handleOffline = () => {
      setRealOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-100 flex justify-center selection:bg-brand-500 selection:text-white">
      {/* Mobile-first viewport container (Max 480px on desktop) */}
      <div className="w-full max-w-[480px] min-h-screen bg-white shadow-xl flex flex-col relative">
        
        {/* Offline Warning Ribbon (only when offline) */}
        {!effectiveOnline && (
          <div className="bg-amber-500 text-amber-950 px-3 py-1.5 text-[11px] font-bold flex items-center justify-between z-50">
            <div className="flex items-center gap-1.5">
              <WifiOff className="w-3.5 h-3.5" />
              <span>Mode Offline-First Aktif. Data tersimpan di perangkat.</span>
            </div>
            <span className="text-[10px] bg-amber-400 px-1.5 py-0.5 rounded font-black">
              Lokal
            </span>
          </div>
        )}

        {/* 1. Top Fixed Navigation Header */}
        <Header />

        {/* 2. 3-Tab Segmented Control Navigation */}
        <NavigationTabs />

        {/* 3. Main Dynamic Content Area */}
        <main className="flex-1 overflow-x-hidden">
          {activeTab === 'input' && <TabInputOrder />}
          {activeTab === 'kitchen' && <TabKitchenOrders />}
          {activeTab === 'history' && <TabOmzetReport />}
        </main>

        {/* Modals & Dialogs */}
        <ThermalSlipModal />
        <ProfileSettingsModal />

      </div>
    </div>
  );
};

export default App;
