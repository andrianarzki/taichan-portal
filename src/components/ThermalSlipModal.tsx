import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { formatRupiah, formatTimeWIB, formatDateIndonesian } from '../utils/format';
import { Printer, X } from 'lucide-react';

export const ThermalSlipModal: React.FC = () => {
  const { thermalModalData, closeThermalModal, cashierName, outletName } = useAppStore();

  if (!thermalModalData.isOpen) return null;

  const { order, isSummary, summaryData } = thermalModalData;

  const handlePrint = () => {
    window.print();
  };

  const totalQuantity = order
    ? order.items.reduce((sum, item) => sum + item.quantity, 0)
    : 0;

  const orderDate = order?.createdAt ? new Date(order.createdAt) : new Date();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-3 overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 print:shadow-none print:rounded-none print:w-full">
        
        {/* Modal Toolbar (hidden when printing) */}
        <div className="print:hidden flex items-center justify-between p-3.5 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-600 animate-pulse"></span>
            <span className="font-extrabold text-xs text-slate-800">
              {isSummary ? 'Slip Ringkasan Omzet (58mm)' : 'Slip Struk Transaksi (58mm)'}
            </span>
          </div>
          <button
            onClick={closeThermalModal}
            className="w-7 h-7 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 58mm Thermal Paper Simulator */}
        <div className="p-4 sm:p-5 max-h-[75vh] overflow-y-auto bg-slate-100/80 flex justify-center print:p-0 print:bg-white print:max-h-none print:overflow-visible">
          <div 
            id="thermal-receipt"
            className="w-full max-w-[310px] bg-white p-4 sm:p-5 shadow-sm border border-dashed border-slate-300 text-slate-900 font-mono text-[11px] leading-tight select-text print:w-full print:border-none print:shadow-none print:p-0"
          >
            {/* Store Header */}
            <div className="text-center pb-2.5 border-b border-dashed border-slate-400 space-y-0.5">
              <h3 className="font-black text-sm tracking-widest uppercase">TAICHAN PORTAL</h3>
              <p className="text-[10px] font-bold text-slate-700">Sate Taichan Senayan Asli</p>
              <p className="text-[9px] text-slate-500 font-sans">{outletName}</p>
            </div>

            {/* Content for Single Order */}
            {!isSummary && order && (
              <>
                {/* Order Metadata */}
                <div className="py-2 border-b border-dashed border-slate-400 space-y-1 text-[10px]">
                  <div className="flex justify-between">
                    <span className="text-slate-600">No. Order:</span>
                    <span className="font-bold text-slate-950">{order.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Waktu:</span>
                    <span className="font-semibold text-slate-800">
                      {formatDateIndonesian(orderDate)} • {formatTimeWIB(order.createdAt)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Kasir:</span>
                    <span className="font-medium text-slate-800">{cashierName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Tujuan / Meja:</span>
                    <span className="font-black text-slate-950 uppercase">{order.tableInfo}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Status:</span>
                    <span className="font-bold text-emerald-700">LUNAS</span>
                  </div>
                </div>

                {/* Items List - Full Name Without Ellipsis */}
                <div className="py-2 border-b border-dashed border-slate-400 space-y-2">
                  <div className="flex justify-between text-[9px] font-bold text-slate-500 pb-0.5 border-b border-dotted border-slate-200">
                    <span>MENU PESANAN</span>
                    <span>TOTAL</span>
                  </div>

                  {order.items.map((item, idx) => (
                    <div key={idx} className="space-y-0.5">
                      {/* Full Item Name (Wraps naturally, NO '...' truncation) */}
                      <div className="font-bold text-slate-950 break-words leading-tight text-[11px]">
                        {item.name}
                      </div>

                      {/* Quantity, Unit Price, and Subtotal */}
                      <div className="flex justify-between items-center text-[10px] text-slate-600">
                        <span className="pl-1">
                          {item.quantity} × {formatRupiah(item.unitPrice)}
                        </span>
                        <span className="font-bold text-slate-900">
                          {formatRupiah(item.subtotal)}
                        </span>
                      </div>

                      {/* Optional Note */}
                      {item.note && (
                        <div className="text-[9px] text-brand-700 italic pl-1 font-sans bg-amber-50/70 rounded px-1 py-0.5 border border-amber-200/50 mt-0.5">
                          * {item.note}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Totals Section */}
                <div className="py-2 border-b border-dashed border-slate-400 space-y-1">
                  <div className="flex justify-between text-[10px] text-slate-600">
                    <span>Jumlah Item:</span>
                    <span>{totalQuantity} porsi/menu</span>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-600">
                    <span>Metode Bayar:</span>
                    <span className="font-bold text-slate-900">{order.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between text-xs font-black text-slate-950 pt-1 border-t border-dotted border-slate-300">
                    <span>TOTAL BAYAR:</span>
                    <span className="text-sm">{formatRupiah(order.totalAmount)}</span>
                  </div>
                </div>
              </>
            )}

            {/* Content for Summary Slip */}
            {isSummary && summaryData && (
              <div className="py-2 border-b border-dashed border-slate-400 space-y-1.5 text-[10px]">
                <div className="text-center font-black text-xs pb-1 uppercase tracking-wide">
                  RINGKASAN REKAP OMZET
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Periode:</span>
                  <span className="font-bold text-slate-900">{summaryData.summary.dateLabel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Waktu Cetak:</span>
                  <span className="font-semibold text-slate-800">{formatTimeWIB(new Date().toISOString())}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Kasir Bertugas:</span>
                  <span className="font-medium text-slate-800">{cashierName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Total Transaksi:</span>
                  <span className="font-bold text-slate-900">{summaryData.summary.totalTransactions} Struk Selesai</span>
                </div>
                <div className="flex justify-between text-xs font-black pt-1.5 border-t border-dotted border-slate-300 text-slate-950">
                  <span>TOTAL OMZET:</span>
                  <span className="text-sm">{formatRupiah(summaryData.summary.totalOmzet)}</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-slate-600">• CASH ({summaryData.summary.cashPercent}%):</span>
                  <span className="font-bold">{formatRupiah(summaryData.summary.cashAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">• QRIS ({summaryData.summary.qrisPercent}%):</span>
                  <span className="font-bold">{formatRupiah(summaryData.summary.qrisAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">• Rata-rata / Meja:</span>
                  <span>{formatRupiah(summaryData.summary.averagePerTable)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">• Total Porsi Sate:</span>
                  <span className="font-bold text-slate-900">{summaryData.summary.totalPortionsSold} Porsi</span>
                </div>
              </div>
            )}

            {/* Barcode & Footer Simulation */}
            <div className="pt-3 text-center space-y-2">
              <div className="flex justify-center items-end h-7 gap-[2px]">
                {[3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 3, 1, 2, 3, 4, 1, 2, 3, 2, 4, 1].map((h, i) => (
                  <div
                    key={i}
                    className="bg-slate-900"
                    style={{
                      width: `${(i % 3) === 0 ? 2 : 1}px`,
                      height: `${12 + h * 3}px`
                    }}
                  />
                ))}
              </div>
              <p className="text-[9.5px] font-bold text-slate-700">
                Terima Kasih Atas Kunjungan Anda!
              </p>
              <p className="text-[8.5px] text-slate-500 font-sans">
                Simpan struk ini sebagai bukti pembayaran yang sah.
              </p>
              <p className="text-[8px] text-slate-400 font-sans tracking-wide">
                Follow IG: @taichanportal
              </p>
            </div>

          </div>
        </div>

        {/* Modal Actions (hidden when printing) */}
        <div className="print:hidden p-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2.5">
          <button
            type="button"
            onClick={closeThermalModal}
            className="flex-1 h-11 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold hover:bg-slate-100 active:scale-95 transition-all shadow-2xs"
          >
            Tutup
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="flex-1 h-11 rounded-xl bg-brand-600 hover:bg-brand-700 active:scale-95 text-white text-xs font-black flex items-center justify-center gap-2 shadow-md shadow-brand-600/25 transition-all"
          >
            <Printer className="w-4 h-4" />
            Cetak Slip
          </button>
        </div>

      </div>
    </div>
  );
};
