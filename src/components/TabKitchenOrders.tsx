import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { Order } from '../types';
import { pushOrderToSupabase, deleteOrderFromSupabase, addPendingDeletion } from '../services/supabase';
import { formatRupiah, formatTimeWIB } from '../utils/format';
import { useAppStore } from '../store/useAppStore';
import { 
  Clock, 
  CheckCircle, 
  Printer, 
  ArrowRight,
  ChefHat,
  XCircle,
  AlertTriangle
} from 'lucide-react';

export const TabKitchenOrders: React.FC = () => {
  const { setActiveTab, openThermalSlip, effectiveOnline, performSync } = useAppStore();
  const [kitchenTab, setKitchenTab] = useState<'all' | 'dine-in' | 'takeaway'>('all');
  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  // Live query active orders sorted by createdAt ASC (FIFO)
  const activeOrders = useLiveQuery(
    async () => {
      const orders = await db.orders.where('status').equals('ACTIVE').toArray();
      // Sort FIFO (First In, First Out)
      return orders.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    },
    [],
    []
  );

  const isTakeawayOrder = (order: Order) => {
    const info = order.tableInfo.toLowerCase();
    return info.includes('takeaway') || info.includes('bungkus');
  };

  const allActiveOrders = activeOrders || [];
  const dineInOrders = allActiveOrders.filter((o) => !isTakeawayOrder(o));
  const takeawayOrders = allActiveOrders.filter((o) => isTakeawayOrder(o));

  // Map to assign automatic Takeaway queue numbers: Takeaway 1, Takeaway 2, etc.
  const takeawayNumberMap = new Map<string, number>();
  takeawayOrders.forEach((o, index) => {
    takeawayNumberMap.set(o.id, index + 1);
  });

  const getOverallQueueNumber = (orderId: string) => {
    const index = allActiveOrders.findIndex((o) => o.id === orderId);
    return index >= 0 ? index + 1 : 1;
  };

  const handleCompleteOrder = async (order: Order) => {
    try {
      const completedAt = new Date().toISOString();
      const updatedOrder: Order = {
        ...order,
        status: 'DONE',
        completedAt,
        synced: false
      };

      await db.orders.update(order.id, {
        status: 'DONE',
        completedAt,
        synced: false
      });

      if (effectiveOnline) {
        pushOrderToSupabase(updatedOrder).catch((e) => console.error('Cloud sync error on complete:', e));
        performSync();
      }
    } catch (err) {
      console.error('Failed to complete order:', err);
    }
  };

  const confirmCancelOrder = async (order: Order) => {
    setIsCancelling(true);
    try {
      // 1. Hapus dari database lokal (Dexie) agar nomor meja langsung kosong & tidak pernah masuk omzet
      await db.orders.delete(order.id);

      // 2. Hapus dari database cloud (Supabase) jika online, atau catat pending deletion
      if (effectiveOnline) {
        await deleteOrderFromSupabase(order.id);
        performSync();
      } else {
        addPendingDeletion(order.id);
      }
      setOrderToCancel(null);
    } catch (err) {
      console.error('Failed to cancel order:', err);
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className="pb-[calc(env(safe-area-inset-bottom,0px)+80px)] pt-2">
      <div className="max-w-md mx-auto px-4 space-y-4">
        
        {/* Header Antrean Dapur */}
        <section className="bg-slate-50 border border-slate-200/90 rounded-2xl p-3.5 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center font-bold">
              <ChefHat className="w-4 h-4 text-brand-600" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <h3 className="font-extrabold text-sm text-slate-800">
                  Antrean Dapur: <span className="text-brand-600">{allActiveOrders.length} Aktif</span>
                </h3>
              </div>
              <p className="text-[11px] font-semibold text-slate-400">
                Prioritas FIFO ({dineInOrders.length} Meja, {takeawayOrders.length} Takeaway)
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-bold text-slate-500 bg-white px-2 py-1 rounded-md border border-slate-200 shadow-2xs">
              Urutan Masuk
            </span>
          </div>
        </section>

        {/* Pemisah Sub-Tab Dapur: Semua | Meja | Takeaway */}
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl">
          <button
            type="button"
            onClick={() => setKitchenTab('all')}
            className={`py-2 px-2 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1 ${
              kitchenTab === 'all'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Semua ({allActiveOrders.length})
          </button>
          <button
            type="button"
            onClick={() => setKitchenTab('dine-in')}
            className={`py-2 px-2 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1 ${
              kitchenTab === 'dine-in'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>🍽️</span> Meja ({dineInOrders.length})
          </button>
          <button
            type="button"
            onClick={() => setKitchenTab('takeaway')}
            className={`py-2 px-2 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1 ${
              kitchenTab === 'takeaway'
                ? 'bg-brand-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>🛍️</span> Takeaway ({takeawayOrders.length})
          </button>
        </div>

        {/* List of active orders */}
        {allActiveOrders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200/90 p-8 text-center shadow-soft space-y-3">
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle className="w-7 h-7" />
            </div>
            <div>
              <h4 className="font-black text-base text-slate-900">Antrean Dapur Bersih!</h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">
                Semua pesanan sate taichan telah dimasak dan disajikan ke pelanggan.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('input')}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-brand-600 text-white text-xs font-black hover:bg-brand-700 shadow-md shadow-brand-600/20 active:scale-95 transition-all"
            >
              + Buat Pesanan Baru
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            
            {/* View Mode: ALL - Sesuai Urutan Masuk (FIFO Murni: Meja & Takeaway Berurutan) */}
            {kitchenTab === 'all' && (
              <div className="space-y-3">
                {allActiveOrders.map((order, idx) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    queueNumber={idx + 1}
                    takeawayIndex={takeawayNumberMap.get(order.id)}
                    onComplete={() => handleCompleteOrder(order)}
                    onCancel={() => setOrderToCancel(order)}
                    onPrint={() => openThermalSlip(order)}
                  />
                ))}
              </div>
            )}

            {/* View Mode: DINE IN ONLY */}
            {kitchenTab === 'dine-in' && (
              dineInOrders.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center text-xs text-slate-400">
                  Tidak ada antrean pesanan makan di meja saat ini.
                </div>
              ) : (
                <div className="space-y-3">
                  {dineInOrders.map((order) => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      queueNumber={getOverallQueueNumber(order.id)}
                      onComplete={() => handleCompleteOrder(order)}
                      onCancel={() => setOrderToCancel(order)}
                      onPrint={() => openThermalSlip(order)}
                    />
                  ))}
                </div>
              )
            )}

            {/* View Mode: TAKEAWAY ONLY */}
            {kitchenTab === 'takeaway' && (
              takeawayOrders.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center text-xs text-slate-400">
                  Tidak ada antrean pesanan takeaway (bungkus) saat ini.
                </div>
              ) : (
                <div className="space-y-3">
                  {takeawayOrders.map((order) => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      queueNumber={getOverallQueueNumber(order.id)}
                      takeawayIndex={takeawayNumberMap.get(order.id)}
                      onComplete={() => handleCompleteOrder(order)}
                      onCancel={() => setOrderToCancel(order)}
                      onPrint={() => openThermalSlip(order)}
                    />
                  ))}
                </div>
              )
            )}

          </div>
        )}

      </div>

      {/* Modal Konfirmasi Cancel Order */}
      {orderToCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-200 p-5 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              </div>
              <div className="space-y-0.5">
                <h3 className="font-extrabold text-slate-900 text-base leading-tight">
                  Batalkan Pesanan Ini?
                </h3>
                <p className="text-xs text-slate-500">
                  Pesanan akan dihapus dari antrean dapur.
                </p>
              </div>
            </div>

            {/* Info detail */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">ID Pesanan:</span>
                <span className="font-extrabold text-blue-700">{orderToCancel.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">Tujuan / Meja:</span>
                <span className="font-extrabold text-slate-800">{orderToCancel.tableInfo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">Total Tagihan:</span>
                <span className="font-black text-slate-900">{formatRupiah(orderToCancel.totalAmount)}</span>
              </div>
            </div>

            {/* Warning Note */}
            <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 leading-snug space-y-1">
              <div className="font-bold flex items-center gap-1">
                <span>⚠️</span> Efek Pembatalan:
              </div>
              <ul className="list-disc list-inside space-y-0.5 text-amber-800 font-medium">
                <li>Nomor meja akan <strong>kembali tersedia / kosong</strong>.</li>
                <li>Pesanan ini <strong>TIDAK akan masuk ke laporan omzet</strong>.</li>
              </ul>
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => setOrderToCancel(null)}
                disabled={isCancelling}
                className="py-2.5 px-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 font-extrabold text-xs text-slate-700 transition-all active:scale-95 disabled:opacity-50"
              >
                Kembali
              </button>
              <button
                type="button"
                onClick={() => confirmCancelOrder(orderToCancel)}
                disabled={isCancelling}
                className="py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 font-black text-xs text-white shadow-md shadow-rose-600/20 transition-all active:scale-95 flex items-center justify-center disabled:opacity-50"
              >
                {isCancelling ? 'Membatalkan...' : 'Ya, Batalkan'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

// Order Ticket Card Component
interface OrderCardProps {
  order: Order;
  queueNumber: number;
  takeawayIndex?: number;
  onComplete: () => void;
  onCancel: () => void;
  onPrint: () => void;
}

const OrderCard: React.FC<OrderCardProps> = ({ order, queueNumber, takeawayIndex, onComplete, onCancel, onPrint }) => {
  const isTakeaway = order.tableInfo.toLowerCase().includes('takeaway') || order.tableInfo.toLowerCase().includes('bungkus');

  // Format label: Takeaway 1, Takeaway 2, or Meja 1
  const getTableLabel = () => {
    if (isTakeaway) {
      const customerExtra = order.tableInfo
        .replace(/takeaway|bungkus/gi, '')
        .replace(/^[\s\-:]+/, '')
        .trim();
      const numLabel = takeawayIndex ? `Takeaway ${takeawayIndex}` : 'Takeaway';
      return customerExtra ? `${numLabel} (${customerExtra})` : numLabel;
    }
    return order.tableInfo;
  };

  return (
    <article className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-soft hover:border-slate-300 transition-all space-y-3">
      
      {/* Top row: Ticket ID, Table Name, Payment Badge */}
      <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2.5">
        <div className="flex items-center gap-2">
          {/* Order ID Pill */}
          <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200/70 font-black text-xs tracking-wide">
            {order.id}
          </span>
          {/* Table / Takeaway Info */}
          {isTakeaway ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-amber-500 text-white font-black text-xs tracking-wide shadow-2xs">
              🛍️ {getTableLabel().toUpperCase()}
            </span>
          ) : (
            <span className="font-extrabold text-[15px] text-slate-900 uppercase">
              🍽️ {order.tableInfo}
            </span>
          )}
        </div>

        {/* Payment badge */}
        <span
          className={`px-2 py-0.5 rounded-md text-[10px] font-black tracking-wide border ${
            order.paymentMethod === 'CASH'
              ? 'bg-amber-50 text-amber-700 border-amber-300'
              : 'bg-blue-50 text-blue-700 border-blue-300'
          }`}
        >
          {order.paymentMethod} (LUNAS)
        </span>
      </div>

      {/* Timestamp row */}
      <div className="flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-semibold text-slate-600">{formatTimeWIB(order.createdAt)}</span>
        </div>
        <span className="text-[11px] font-bold text-slate-400">
          Urutan #{queueNumber}
        </span>
      </div>

      {/* Items list */}
      <div className="bg-slate-50/80 rounded-xl p-2.5 space-y-2 border border-slate-100">
        {order.items.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 font-bold text-slate-800">
              <span className="w-4 h-4 rounded-md bg-brand-100 text-brand-700 text-[10px] font-black flex items-center justify-center shrink-0">
                {item.quantity}×
              </span>
              <span>{item.name}</span>
            </div>
            <span className="font-semibold text-slate-600 shrink-0 ml-2">
              {formatRupiah(item.subtotal)}
            </span>
          </div>
        ))}
      </div>

      {/* Card Footer: Total & Actions */}
      <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100/80">
        <div className="shrink-0">
          <span className="text-[10px] font-semibold text-slate-400 block leading-tight">Total Pesanan:</span>
          <span className="font-black text-sm sm:text-[15px] text-slate-900 whitespace-nowrap block">
            {formatRupiah(order.totalAmount)}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0 justify-end">
          {/* Thermal Slip Print */}
          <button
            type="button"
            onClick={onPrint}
            title="Cetak Slip Kasir / Dapur (Thermal 58mm)"
            className="w-8.5 h-8.5 sm:w-9 sm:h-9 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 flex items-center justify-center hover:bg-slate-100 active:scale-95 transition-all shadow-2xs shrink-0"
          >
            <Printer className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>

          {/* Cancel Order Button */}
          <button
            type="button"
            onClick={onCancel}
            title="Batalkan Pesanan (Meja kembali kosong & tidak masuk omzet)"
            className="h-8.5 sm:h-9 px-2 sm:px-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 active:scale-95 text-rose-700 border border-rose-200 font-extrabold text-[11px] flex items-center gap-1 transition-all shrink-0 whitespace-nowrap"
          >
            <XCircle className="w-3.5 h-3.5 text-rose-600 stroke-[2.5]" />
            <span>CANCEL ORDER</span>
          </button>

          {/* Selesaikan Pesanan Button */}
          <button
            type="button"
            onClick={onComplete}
            className="h-8.5 sm:h-9 px-2.5 sm:px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold text-[11px] flex items-center gap-1 shadow-md shadow-emerald-600/20 transition-all shrink-0 whitespace-nowrap"
          >
            <CheckCircle className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>SELESAIKAN</span>
          </button>
        </div>
      </div>

    </article>
  );
};
