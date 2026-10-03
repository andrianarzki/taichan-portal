import { create } from 'zustand';
import { PaymentMethod, Order } from '../types';
import { syncAllBidirectional } from '../services/supabase';
import { db } from '../db';

interface CartItemState {
  quantity: number;
  note: string;
}

interface AppState {
  // Navigation
  activeTab: 'input' | 'kitchen' | 'history';
  setActiveTab: (tab: 'input' | 'kitchen' | 'history') => void;

  // Order Input State (Tab 1)
  tableInfo: string;
  setTableInfo: (val: string) => void;
  cart: Record<string, CartItemState>;
  setQuantity: (menuId: string, qty: number) => void;
  incrementItem: (menuId: string) => void;
  decrementItem: (menuId: string) => void;
  setItemNote: (menuId: string, note: string) => void;
  paymentMethod: PaymentMethod;
  setPaymentMethod: (pm: PaymentMethod) => void;
  clearCart: () => void;
  resetInputForm: () => void;

  // Connectivity & Sync
  isRealOnline: boolean;
  isSimulatedOffline: boolean;
  effectiveOnline: boolean;
  isSyncing: boolean;
  pendingSyncCount: number;
  setRealOnline: (online: boolean) => void;
  setSimulatedOffline: (sim: boolean) => void;
  checkPendingSync: () => Promise<void>;
  performSync: () => Promise<void>;

  // Modals & UI
  isProfileOpen: boolean;
  setIsProfileOpen: (open: boolean) => void;
  isQrisModalOpen: boolean;
  setIsQrisModalOpen: (open: boolean) => void;
  thermalModalData: {
    isOpen: boolean;
    order: Order | null;
    isSummary: boolean;
    summaryData?: any;
  };
  openThermalSlip: (order: Order) => void;
  openThermalSummary: (summaryData: any) => void;
  closeThermalModal: () => void;

  // Cashier Details
  cashierName: string;
  setCashierName: (name: string) => void;
  outletName: string;
}

export const useAppStore = create<AppState>((set, get) => ({
  activeTab: 'input',
  setActiveTab: (tab) => set({ activeTab: tab }),

  tableInfo: 'Meja 01',
  setTableInfo: (val) => set({ tableInfo: val }),
  
  cart: {},
  setQuantity: (menuId, qty) => {
    set((state) => {
      const newCart = { ...state.cart };
      if (qty <= 0) {
        delete newCart[menuId];
      } else {
        newCart[menuId] = {
          quantity: qty,
          note: newCart[menuId]?.note || ''
        };
      }
      return { cart: newCart };
    });
  },
  incrementItem: (menuId) => {
    set((state) => {
      const current = state.cart[menuId]?.quantity || 0;
      return {
        cart: {
          ...state.cart,
          [menuId]: {
            quantity: current + 1,
            note: state.cart[menuId]?.note || ''
          }
        }
      };
    });
  },
  decrementItem: (menuId) => {
    set((state) => {
      const current = state.cart[menuId]?.quantity || 0;
      if (current <= 1) {
        const newCart = { ...state.cart };
        delete newCart[menuId];
        return { cart: newCart };
      }
      return {
        cart: {
          ...state.cart,
          [menuId]: {
            quantity: current - 1,
            note: state.cart[menuId]?.note || ''
          }
        }
      };
    });
  },
  setItemNote: (menuId, note) => {
    set((state) => ({
      cart: {
        ...state.cart,
        [menuId]: {
          quantity: state.cart[menuId]?.quantity || 1,
          note
        }
      }
    }));
  },
  paymentMethod: 'CASH',
  setPaymentMethod: (pm) => set({ paymentMethod: pm }),
  clearCart: () => set({ cart: {} }),
  resetInputForm: () => set({ tableInfo: '', cart: {}, paymentMethod: 'CASH' }),

  isRealOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  isSimulatedOffline: false,
  effectiveOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  isSyncing: false,
  pendingSyncCount: 0,

  setRealOnline: (online) => {
    set((state) => ({
      isRealOnline: online,
      effectiveOnline: online && !state.isSimulatedOffline
    }));
    if (online) {
      get().performSync();
    }
  },
  setSimulatedOffline: (sim) => {
    set((state) => ({
      isSimulatedOffline: sim,
      effectiveOnline: state.isRealOnline && !sim
    }));
    if (!sim && get().isRealOnline) {
      get().performSync();
    }
  },
  checkPendingSync: async () => {
    try {
      const allOrders = await db.orders.toArray();
      const count = allOrders.filter((o) => !o.synced).length;
      set({ pendingSyncCount: count });
    } catch {
      // ignore
    }
  },
  performSync: async () => {
    if (!get().effectiveOnline) return;
    set({ isSyncing: true });
    try {
      await syncAllBidirectional();
      await get().checkPendingSync();
    } finally {
      set({ isSyncing: false });
    }
  },

  isProfileOpen: false,
  setIsProfileOpen: (open) => set({ isProfileOpen: open }),
  isQrisModalOpen: false,
  setIsQrisModalOpen: (open) => set({ isQrisModalOpen: open }),

  thermalModalData: {
    isOpen: false,
    order: null,
    isSummary: false,
  },
  openThermalSlip: (order) => set({
    thermalModalData: { isOpen: true, order, isSummary: false }
  }),
  openThermalSummary: (summaryData) => set({
    thermalModalData: { isOpen: true, order: null, isSummary: true, summaryData }
  }),
  closeThermalModal: () => set({
    thermalModalData: { isOpen: false, order: null, isSummary: false, summaryData: undefined }
  }),

  cashierName: 'Mas Danu (Kasir)',
  setCashierName: (name) => set({ cashierName: name }),
  outletName: 'Taichan Portal — Gerobak 01',
}));
