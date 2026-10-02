import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { Order } from '../types';
import { formatRupiah, formatTimeWIB } from '../utils/format';
import { useAppStore } from '../store/useAppStore';
import { 
  Clock, 
  CheckCircle, 
  Printer, 
  ArrowRight,
  ChefHat
} from 'lucide-react';

export const TabKitchenOrders: React.FC = () => {
  const { setActiveTab, openThermalSlip, effectiveOnline, performSync } = useAppStore();
  const [kitchenTab, setKitchenTab] = useState<'all' | 'dine-in' | 'takeaway'>('all');

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

  const handleCompleteOrder = async (order: Order) => {
    try {
      const completedAt = new Date().toISOString();
      await db.orders.update(order.id, {
        status: 'DONE',
        completedAt,
        synced: false
      });

      if (effectiveOnline) {
        performSync();
      }
    } catch (err) {
      console.error('Failed to complete order:', err);
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
            
            {/* View Mode: ALL - Separate sections for Meja and Takeaway */}
            {kitchenTab === 'all' && (
              <>
                {/* Section A: Dine In / Meja */}
                {dineInOrders.length > 0 && (
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between px-1">
                      <h4 className="text-xs font-black text-slate-800 tracking-wide flex items-center gap-1.5 uppercase">
                        <span>🍽️</span> Pesanan Meja (Dine In)
                      </h4>
                      <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                        {dineInOrders.length} Pesanan
                      </span>
                    </div>
                    <div className="space-y-3">
                      {dineInOrders.map((order, idx) => (
                        <OrderCard
                          key={order.id}
                          order={order}
                          queueNumber={idx + 1}
                          onComplete={() => handleCompleteOrder(order)}
                          onPrint={() => openThermalSlip(order)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Section B: Takeaway */}
                {takeawayOrders.length > 0 && (
                  <div className="space-y-2.5 pt-1">
                    <div className="flex items-center justify-between px-1">
                      <h4 className="text-xs font-black text-amber-900 tracking-wide flex items-center gap-1.5 uppercase">
                        <span>🛍️</span> Pesanan Takeaway (Bungkus)
                      </h4>
                      <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200">
                        {takeawayOrders.length} Pesanan
                      </span>
                    </div>
                    <div className="space-y-3">
                      {takeawayOrders.map((order, idx) => (
                        <OrderCard
                          key={order.id}
                          order={order}
                          queueNumber={idx + 1}
                          takeawayIndex={takeawayNumberMap.get(order.id) || idx + 1}
                          onComplete={() => handleCompleteOrder(order)}
                          onPrint={() => openThermalSlip(order)}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* View Mode: DINE IN ONLY */}
            {kitchenTab === 'dine-in' && (
              dineInOrders.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center text-xs text-slate-400">
                  Tidak ada antrean pesanan makan di meja saat ini.
                </div>
              ) : (
                <div className="space-y-3">
                  {dineInOrders.map((order, idx) => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      queueNumber={idx + 1}
                      onComplete={() => handleCompleteOrder(order)}
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
                  {takeawayOrders.map((order, idx) => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      queueNumber={idx + 1}
                      takeawayIndex={takeawayNumberMap.get(order.id) || idx + 1}
                      onComplete={() => handleCompleteOrder(order)}
                      onPrint={() => openThermalSlip(order)}
                    />
                  ))}
                </div>
              )
            )}

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
  takeawayIndex?: number;
  onComplete: () => void;
  onPrint: () => void;
}

const OrderCard: React.FC<OrderCardProps> = ({ order, queueNumber, takeawayIndex, onComplete, onPrint }) => {
  const isTakeaway = order.tableInfo.toLowerCase().includes('takeaway') || order.tableInfo.toLowerCase().includes('bungkus');

  // Format label: Takeaway 1, Takeaway 2, or Meja 01
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
