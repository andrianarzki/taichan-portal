import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useAppStore } from '../store/useAppStore';
import { INITIAL_MENU_ITEMS } from '../data/menu';
import { db, getNextOrderId } from '../db';
import { formatRupiah } from '../utils/format';
import { Order, OrderItem } from '../types';
import { 
  Plus, 
  Minus, 
  Wallet, 
  QrCode, 
  X, 
  Flame, 
  Wheat, 
  CupSoda, 
  AlertCircle,
  CheckCircle,
  ReceiptText,
  RotateCcw
} from 'lucide-react';

const DINE_IN_TABLES = [
  'Meja 01', 'Meja 02', 'Meja 03', 'Meja 04', 'Meja 05',
  'Meja 06', 'Meja 07', 'Meja 08', 'Meja 09', 'Meja 10'
];

export const TabInputOrder: React.FC = () => {
  const {
    tableInfo,
    setTableInfo,
    cart,
    incrementItem,
    decrementItem,
    paymentMethod,
    setPaymentMethod,
    clearCart,
    resetInputForm,
    setActiveTab,
    effectiveOnline,
    performSync
  } = useAppStore();

  const [orderType, setOrderType] = useState<'dine-in' | 'takeaway'>('dine-in');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Live query active orders from Dexie
  const activeOrders = useLiveQuery(
    () => db.orders.where('status').equals('ACTIVE').toArray(),
    []
  ) || [];

  // Set of occupied table names (lowercase)
  const occupiedTables = new Set(
    activeOrders.map((o) => o.tableInfo.trim().toLowerCase())
  );

  // Available dine-in chips (excluding tables with active orders in kitchen)
  const availableDineInChips = DINE_IN_TABLES.filter(
    (chip) => !occupiedTables.has(chip.toLowerCase())
  );

  // Auto-adjust selected table if the current one is occupied
  useEffect(() => {
    if (orderType === 'dine-in') {
      if (tableInfo && occupiedTables.has(tableInfo.trim().toLowerCase())) {
        const nextAvailable = availableDineInChips[0] || '';
        setTableInfo(nextAvailable);
      } else if (!tableInfo && availableDineInChips.length > 0) {
        setTableInfo(availableDineInChips[0]);
      }
    }
  }, [activeOrders, orderType]);

  // Group menus
  const taichanMenus = INITIAL_MENU_ITEMS.filter((m) => m.category === 'taichan');
  const sideMenus = INITIAL_MENU_ITEMS.filter((m) => m.category === 'side');
  const drinkMenus = INITIAL_MENU_ITEMS.filter((m) => m.category === 'drink');

  // Calculate totals
  const cartEntries = Object.entries(cart).filter(([_, val]) => val.quantity > 0);
  const totalMenuCount = cartEntries.length;
  
  let totalPortionCount = 0;
  let totalAmount = 0;

  cartEntries.forEach(([menuId, itemState]) => {
    const menuItem = INITIAL_MENU_ITEMS.find((m) => m.id === menuId);
    if (menuItem) {
      totalAmount += menuItem.price * itemState.quantity;
      totalPortionCount += itemState.quantity;
    }
  });

  const handleQuickChipSelect = (chip: string) => {
    setTableInfo(chip);
    setErrorMessage(null);
  };

  const handleClearTableInput = () => {
    setTableInfo('');
  };

  const handleSubmitOrder = async () => {
    if (!tableInfo.trim()) {
      setErrorMessage(orderType === 'dine-in' ? 'Pilih nomor meja terlebih dahulu!' : 'Identitas pemesan takeaway wajib diisi!');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (orderType === 'dine-in' && occupiedTables.has(tableInfo.trim().toLowerCase())) {
      setErrorMessage(`${tableInfo.trim()} sedang aktif/digunakan di Dapur! Selesaikan pesanan di Tab Dapur terlebih dahulu.`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (cartEntries.length === 0) {
      setErrorMessage('Pilih minimal 1 menu pesanan terlebih dahulu.');
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const orderId = await getNextOrderId();
      const orderItems: OrderItem[] = cartEntries.map(([menuId, itemState]) => {
        const menuItem = INITIAL_MENU_ITEMS.find((m) => m.id === menuId)!;
        return {
          menuId,
          name: menuItem.name,
          unitPrice: menuItem.price,
          quantity: itemState.quantity,
          subtotal: menuItem.price * itemState.quantity,
          category: menuItem.category,
          skewerCount: menuItem.skewerCount
        };
      });

      const newOrder: Order = {
        id: orderId,
        tableInfo: tableInfo.trim(),
        items: orderItems,
        totalAmount,
        paymentMethod,
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
        synced: false
      };

      // Save to Dexie IndexedDB
      await db.orders.add(newOrder);

      // Trigger cloud sync if online
      if (effectiveOnline) {
        performSync();
      }

      // Reset cart and navigate to Kitchen queue
      clearCart();
      resetInputForm();
      setActiveTab('kitchen');
    } catch (err: any) {
      setErrorMessage('Gagal menyimpan pesanan: ' + (err?.message || 'Kesalahan sistem'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pb-[calc(env(safe-area-inset-bottom,0px)+180px)] pt-2">
      <div className="w-full px-4 space-y-4">
        
        {/* Error Notification Banner */}
        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span className="font-semibold">{errorMessage}</span>
          </div>
        )}

        {/* 1. Kotak Nomor Meja / Identitas Antrean & Pilihan Pesanan */}
        <section className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
          
          {/* Tipe Pesanan: Makan di Tempat / Takeaway */}
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-xl mb-3">
            <button
              type="button"
              onClick={() => {
                setOrderType('dine-in');
                if (tableInfo.toLowerCase().includes('takeaway') || tableInfo.toLowerCase().includes('bungkus') || !tableInfo) {
                  setTableInfo('Meja 01');
                }
                if (errorMessage) setErrorMessage(null);
              }}
              className={`py-2 px-3 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                orderType === 'dine-in'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>🍽️</span> Makan di Tempat
            </button>
            <button
              type="button"
              onClick={() => {
                setOrderType('takeaway');
                if (!tableInfo.toLowerCase().includes('takeaway') && !tableInfo.toLowerCase().includes('bungkus')) {
                  setTableInfo('Takeaway');
                }
                if (errorMessage) setErrorMessage(null);
              }}
              className={`py-2 px-3 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                orderType === 'takeaway'
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>🛍️</span> Takeaway (Bungkus)
            </button>
          </div>

          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-brand-700">
              <span className="text-base">{orderType === 'dine-in' ? '🪑' : '🛍️'}</span>
              <label htmlFor="table-input" className="text-[11px] font-black tracking-wider text-slate-700 uppercase">
                {orderType === 'dine-in' ? 'NO. MEJA' : 'IDENTITAS PEMESAN TAKEAWAY'}
              </label>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold border border-slate-200">
              Wajib
            </span>
          </div>

          <div className="relative">
            <input
              id="table-input"
              type="text"
              value={tableInfo}
              onChange={(e) => {
                const val = e.target.value;
                setTableInfo(val);
                if (val.toLowerCase().includes('takeaway') || val.toLowerCase().includes('bungkus')) {
                  setOrderType('takeaway');
                }
                if (errorMessage) setErrorMessage(null);
              }}
              placeholder={orderType === 'dine-in' ? "Contoh: Meja 01, Meja 02..." : "Contoh: Takeaway, Mas Dani, Bungkus 01..."}
              className="w-full h-11 pl-3.5 pr-10 text-sm font-bold text-slate-900 placeholder-slate-400 bg-slate-50/70 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600 transition-all"
            />
            {tableInfo && (
              <button
                type="button"
                onClick={handleClearTableInput}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                title="Hapus input meja"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Table Selector for Dine-In (Meja 01 s/d 10) */}
          {orderType === 'dine-in' && (
            <div className="mt-3">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 mb-1.5 px-0.5">
                <span>PILIH MEJA CEPAT (01 - 10):</span>
                <span className="text-[10px] text-brand-600 font-extrabold">
                  {availableDineInChips.length} Meja Tersedia
                </span>
              </div>

              {availableDineInChips.length > 0 ? (
                <div className="grid grid-cols-5 gap-1.5">
                  {availableDineInChips.map((chip) => {
                    const isSelected = tableInfo.toLowerCase() === chip.toLowerCase();
                    return (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => handleQuickChipSelect(chip)}
                        className={`py-2 px-1 rounded-xl text-xs font-black transition-all text-center ${
                          isSelected
                            ? 'bg-brand-600 text-white shadow-xs scale-102 ring-2 ring-brand-600/30'
                            : 'bg-slate-100 text-slate-800 hover:bg-slate-200 active:scale-95'
                        }`}
                      >
                        {chip}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="w-full text-center py-2.5 px-3 rounded-xl bg-amber-50 text-amber-800 text-xs font-bold border border-amber-200">
                  ⚠️ Semua meja (01-10) sedang terisi di Dapur. Selesaikan di tab Dapur atau pilih Takeaway.
                </div>
              )}
            </div>
          )}

          {/* Automated Takeaway Info (No manual Takeaway 1 / 2 chips needed) */}
          {orderType === 'takeaway' && (
            <div className="mt-3 p-3 bg-amber-50/90 border border-amber-200/90 rounded-xl flex items-center justify-between shadow-2xs">
              <div className="flex items-center gap-2">
                <span className="text-xl">🛍️</span>
                <div>
                  <span className="text-xs font-black text-amber-950 block">Pesanan Bawa Pulang (Takeaway)</span>
                  <span className="text-[10px] text-amber-800 font-medium block">
                    Nomor antrean (Takeaway 1, Takeaway 2, dst.) otomatis dibuatkan di Dapur.
                  </span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-amber-200/70 text-amber-900 font-black text-[10px]">
                Otomatis
              </span>
            </div>
          )}
        </section>

        {/* 2. Katalog Menu */}
        <section className="space-y-4">
          
          {/* Section A: SATE TAICHAN */}
          <div>
            <div className="flex items-center justify-between mb-2 px-1">
              <div className="flex items-center gap-1.5">
                <span className="text-brand-600 text-base">🔥</span>
                <h3 className="font-extrabold text-sm text-slate-900">Sate Taichan</h3>
              </div>
              <span className="text-[11px] font-semibold text-slate-500">Porsi & Satuan</span>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs divide-y divide-slate-100 overflow-hidden">
              {taichanMenus.map((menu) => (
                <MenuItemRow
                  key={menu.id}
                  menu={menu}
                  qty={cart[menu.id]?.quantity || 0}
                  onIncrement={() => incrementItem(menu.id)}
                  onDecrement={() => decrementItem(menu.id)}
                />
              ))}
            </div>
          </div>

          {/* Section B: MAKANAN PENDAMPING */}
          <div>
            <div className="flex items-center justify-between mb-2 px-1">
              <div className="flex items-center gap-1.5">
                <span className="text-emerald-600 text-base">🌾</span>
                <h3 className="font-extrabold text-sm text-slate-900">Makanan Pendamping</h3>
              </div>
              <span className="text-[11px] font-semibold text-slate-500">Karbohidrat</span>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs divide-y divide-slate-100 overflow-hidden">
              {sideMenus.map((menu) => (
                <MenuItemRow
                  key={menu.id}
                  menu={menu}
                  qty={cart[menu.id]?.quantity || 0}
                  onIncrement={() => incrementItem(menu.id)}
                  onDecrement={() => decrementItem(menu.id)}
                />
              ))}
            </div>
          </div>

          {/* Section C: MINUMAN */}
          <div>
            <div className="flex items-center justify-between mb-2 px-1">
              <div className="flex items-center gap-1.5">
                <span className="text-blue-600 text-base">🥤</span>
                <h3 className="font-extrabold text-sm text-slate-900">Minuman</h3>
              </div>
              <span className="text-[11px] font-semibold text-slate-500">Dingin & Hangat</span>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs divide-y divide-slate-100 overflow-hidden">
              {drinkMenus.map((menu) => (
                <MenuItemRow
                  key={menu.id}
                  menu={menu}
                  qty={cart[menu.id]?.quantity || 0}
                  onIncrement={() => incrementItem(menu.id)}
                  onDecrement={() => decrementItem(menu.id)}
                />
              ))}
            </div>
          </div>

        </section>

        {/* 3. Selector Metode Pembayaran */}
        <section className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5 text-slate-700">
              <span className="text-brand-600">💳</span>
              <span className="text-[11px] font-black tracking-wider uppercase">
                METODE PEMBAYARAN
              </span>
            </div>
            <span className="text-[11px] font-medium text-slate-500">
              Pilih saat input
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {/* CASH Option */}
            <button
              type="button"
              onClick={() => setPaymentMethod('CASH')}
              className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                paymentMethod === 'CASH'
                  ? 'border-brand-600 bg-red-50/40 ring-1 ring-brand-500 shadow-xs'
                  : 'border-slate-200 bg-white hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <div className="flex items-center gap-1.5 text-emerald-600">
                  <Wallet className="w-4 h-4 text-emerald-600" />
                  <span className="font-black text-xs text-slate-900">CASH</span>
                </div>
                {/* Custom Radio Circle */}
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                  paymentMethod === 'CASH' ? 'border-brand-600 bg-white' : 'border-slate-300 bg-white'
                }`}>
                  {paymentMethod === 'CASH' && <span className="w-2 h-2 rounded-full bg-brand-600" />}
                </div>
              </div>
              <div>
                <span className="text-xs font-bold text-slate-800 block">Tunai Kasir</span>
                <span className="text-[10px] text-slate-400 leading-tight block">Bayar langsung di kasir</span>
              </div>
            </button>

            {/* QRIS Option */}
            <button
              type="button"
              onClick={() => {
                setPaymentMethod('QRIS');
              }}
              className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                paymentMethod === 'QRIS'
                  ? 'border-brand-600 bg-red-50/40 ring-1 ring-brand-500 shadow-xs'
                  : 'border-slate-200 bg-white hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <div className="flex items-center gap-1.5 text-blue-600">
                  <QrCode className="w-4 h-4 text-blue-600" />
                  <span className="font-black text-xs text-slate-900">QRIS</span>
                </div>
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                  paymentMethod === 'QRIS' ? 'border-brand-600 bg-white' : 'border-slate-300 bg-white'
                }`}>
                  {paymentMethod === 'QRIS' && <span className="w-2 h-2 rounded-full bg-brand-600" />}
                </div>
              </div>
              <div>
                <span className="text-xs font-bold text-slate-800 block">Barcode Dinamis</span>
                <span className="text-[10px] text-slate-400 leading-tight block">Scan via e-wallet / m-bank</span>
              </div>
            </button>
          </div>
        </section>

      </div>

      {/* 4. Bottom Sticky Action Bar - CONSTRAINED to 480px & iOS Safe Area! */}
      <div className="fixed bottom-0 left-0 right-0 mx-auto w-full max-w-[480px] z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-sticky px-4 pt-2.5 pb-[calc(env(safe-area-inset-bottom,0px)+12px)]">
        <div className="space-y-2">
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="font-bold text-slate-700">{totalMenuCount} Menu ({totalPortionCount} Porsi)</span>
            </div>

            <div className="text-right">
              <span className="text-xs font-medium text-slate-500 mr-1.5">Total:</span>
              <span className="font-black text-lg text-brand-700 tracking-tight">
                {formatRupiah(totalAmount)}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSubmitOrder}
            disabled={isSubmitting || totalAmount === 0}
            className={`w-full h-11 rounded-xl text-white font-black text-sm tracking-wide flex items-center justify-center gap-2 transition-all shadow-md ${
              totalAmount > 0
                ? 'bg-brand-700 hover:bg-brand-800 active:scale-[0.99] shadow-brand-700/25'
                : 'bg-brand-900/60 cursor-not-allowed text-white/60 shadow-none'
            }`}
          >
            {isSubmitting ? (
              <span className="animate-spin text-white">⏳</span>
            ) : (
              <>
                <ReceiptText className="w-4 h-4 stroke-[2.5]" />
                + TAMBAH KE PESANAN
              </>
            )}
          </button>

        </div>
      </div>
    </div>
  );
};

// Clean and tidy individual menu row matching Image 2
interface MenuItemRowProps {
  menu: any;
  qty: number;
  onIncrement: () => void;
  onDecrement: () => void;
}

const MenuItemRow: React.FC<MenuItemRowProps> = ({
  menu,
  qty,
  onIncrement,
  onDecrement,
}) => {
  return (
    <div className="p-3.5 flex items-center justify-between gap-3">
      {/* Name and Price */}
      <div className="flex-1 min-w-0">
        <h4 className="font-bold text-[13px] text-slate-900 truncate">{menu.name}</h4>
        <span className="font-bold text-xs text-brand-700 block mt-0.5">
          {formatRupiah(menu.price)}
        </span>
      </div>

      {/* Stepper with [-] [ 0 ] [+] matching image 2 */}
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          type="button"
          onClick={onDecrement}
          disabled={qty === 0}
          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
            qty > 0
              ? 'bg-slate-100 text-slate-700 hover:bg-slate-200 active:scale-95'
              : 'bg-slate-100/70 text-slate-300 cursor-not-allowed'
          }`}
        >
          <Minus className="w-4 h-4 stroke-[2.5]" />
        </button>

        <span className={`w-7 text-center font-black text-sm ${qty > 0 ? 'text-brand-700' : 'text-slate-400'}`}>
          {qty}
        </span>

        <button
          type="button"
          onClick={onIncrement}
          className="w-9 h-9 rounded-xl bg-brand-600 hover:bg-brand-700 text-white flex items-center justify-center active:scale-95 transition-all shadow-xs"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
};
