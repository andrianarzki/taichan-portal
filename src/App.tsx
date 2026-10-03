import React, { useEffect } from 'react';
import { useAppStore } from './store/useAppStore';
import { db } from './db';
import { Header } from './components/Header';
import { NavigationTabs } from './components/NavigationTabs';
import { TabInputOrder } from './components/TabInputOrder';
import { TabKitchenOrders } from './components/TabKitchenOrders';
import { TabOmzetReport } from './components/TabOmzetReport';
import { ThermalSlipModal } from './components/ThermalSlipModal';
import { ProfileSettingsModal } from './components/ProfileSettingsModal';

export const App: React.FC = () => {
  const {
    activeTab,
    effectiveOnline,
    setRealOnline,
    checkPendingSync,
    performSync
  } = useAppStore();

  useEffect(() => {
    // 1. One-time auto cleanup of old dummy data so the system is 100% clean and fresh
    const demoCleaned = localStorage.getItem('taichan_clean_slate_fresh');
    if (!demoCleaned) {
      db.orders.clear().then(() => {
        localStorage.setItem('taichan_clean_slate_fresh', 'true');
        checkPendingSync();
      });
    } else {
      checkPendingSync();
      performSync();
    }

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

    // Periodic check for unsynced orders while online (every 15s)
    const syncInterval = setInterval(() => {
      if (navigator.onLine) {
        performSync();
      }
    }, 15000);

    return () => {
      clearInterval(syncInterval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-100 flex justify-center selection:bg-brand-500 selection:text-white">
      {/* Mobile-first viewport container (Max 480px on desktop) */}
      <div className="w-full max-w-[480px] min-h-screen bg-white shadow-xl flex flex-col relative">
        
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
