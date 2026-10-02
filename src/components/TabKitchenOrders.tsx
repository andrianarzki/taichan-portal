import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { Order } from '../types';
import { formatRupiah, formatTimeWIB, formatRelativeTime } from '../utils/format';
import { useAppStore } from '../store/useAppStore';
import { 
  Clock, 
  CheckCircle, 
  Printer, 
  UtensilsCrossed, 
  Sparkles,
  ArrowRight,
  Flame,
  ChefHat
} from 'lucide-react';

export const TabKitchenOrders: React.FC = () => {
  const { setActiveTab, openThermalSlip, effectiveOnline, performSync } = useAppStore();

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

  const handleCompleteOrder = async (order: Order) => {
    try {
      const completedAt = new Date().toISOString();
      await db.orders.update(order.id, {
        status: 'DONE',
        completedAt,
        synced: effectiveOnline
      });

      if (effectiveOnline) {
        performSync();
      }
    } catch (err) {
      console.error('Failed to complete order:', err);
    }
  };

  return (
    <div className="pb-24 pt-2">
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
                  Antrean Dapur: <span className="text-brand-600">{activeOrders.length} Aktif</span>
                </h3>
              </div>
              <p className="text-[11px] font-semibold text-slate-400">
                Prioritas FIFO (First In, First Out)
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-bold text-slate-500 bg-white px-2 py-1 rounded-md border border-slate-200 shadow-2xs">
              Urutan Masuk
            </span>
          </div>
        </section>

        {/* List of active orders */}
        {activeOrders.length === 0 ? (
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
          <div className="space-y-3.5">
            {activeOrders.map((order, idx) => (
              <OrderCard
                key={order.id}
                order={order}
                queueNumber={idx + 1}
                onComplete={() => handleCompleteOrder(order)}
                onPrint={() => openThermalSlip(order)}
              />
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

// Order Ticket Card Component
interface OrderCardProps {
  order: Order;
  queueNumber: number;
  onComplete: () => void;
  onPrint: () => void;
}

const OrderCard: React.FC<OrderCardProps> = ({ order, queueNumber, onComplete, onPrint }) => {
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
          {order.tableInfo.toLowerCase().includes('takeaway') || order.tableInfo.toLowerCase().includes('bungkus') ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500 text-white font-black text-xs tracking-wide shadow-2xs">
              🛍️ {order.tableInfo.toUpperCase()}
            </span>
          ) : (
            <span className="font-extrabold text-[15px] text-slate-900 uppercase">
              {order.tableInfo}
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
      <div className="flex items-center justify-between pt-1">
        <div>
          <span className="text-[10px] font-semibold text-slate-400 block">Total Pesanan:</span>
          <span className="font-black text-base text-slate-900">
            {formatRupiah(order.totalAmount)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Thermal Slip Print */}
          <button
            type="button"
            onClick={onPrint}
            title="Cetak Slip Kasir / Dapur (Thermal 58mm)"
            className="w-10 h-10 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 flex items-center justify-center hover:bg-slate-100 active:scale-95 transition-all shadow-2xs"
          >
            <Printer className="w-4 h-4" />
          </button>

          {/* Selesaikan Pesanan Button */}
          <button
            type="button"
            onClick={onComplete}
            className="h-10 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all"
          >
            <CheckCircle className="w-4 h-4 stroke-[2.5]" />
            SELESAIKAN PESANAN
          </button>
        </div>
      </div>

    </article>
  );
};
