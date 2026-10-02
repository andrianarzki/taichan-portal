import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { PlusCircle, FileText, BarChart3 } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';

export const NavigationTabs: React.FC = () => {
  const { activeTab, setActiveTab } = useAppStore();

  // Live count of active kitchen orders
  const activeOrdersCount = useLiveQuery(
    () => db.orders.where('status').equals('ACTIVE').count(),
    [],
    0
  );

  return (
    <nav className="sticky top-14 z-30 bg-white border-b border-slate-100 px-4 py-2.5">
      <div className="w-full grid grid-cols-3 gap-1 p-1 bg-slate-100/90 rounded-2xl">
        
        {/* Tab 1: Input Pesanan */}
        <button
          onClick={() => setActiveTab('input')}
          className={`flex items-center justify-center gap-1.5 py-2 px-1 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'input'
              ? 'bg-white text-brand-600 shadow-xs border border-slate-200/60'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <PlusCircle className={`w-3.5 h-3.5 shrink-0 ${activeTab === 'input' ? 'text-brand-600' : 'text-slate-400'}`} />
          <span>1. Input</span>
        </button>

        {/* Tab 2: Pesanan Dapur */}
        <button
          onClick={() => setActiveTab('kitchen')}
          className={`relative flex items-center justify-center gap-1.5 py-2 px-1 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'kitchen'
              ? 'bg-white text-brand-600 shadow-xs border border-slate-200/60'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileText className={`w-3.5 h-3.5 shrink-0 ${activeTab === 'kitchen' ? 'text-brand-600' : 'text-slate-400'}`} />
          <span>2. Dapur</span>
          
          {/* Badge count */}
          {activeOrdersCount > 0 && (
            <span className="min-w-[17px] h-[17px] px-1 rounded-full bg-brand-600 text-white text-[10px] font-black flex items-center justify-center shrink-0">
              {activeOrdersCount}
            </span>
          )}
        </button>

        {/* Tab 3: Omzet & Riwayat */}
        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center justify-center gap-1.5 py-2 px-1 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'history'
              ? 'bg-white text-brand-600 shadow-xs border border-slate-200/60'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <BarChart3 className={`w-3.5 h-3.5 shrink-0 ${activeTab === 'history' ? 'text-brand-600' : 'text-slate-400'}`} />
          <span>3. Omzet</span>
        </button>

      </div>
    </nav>
  );
};
