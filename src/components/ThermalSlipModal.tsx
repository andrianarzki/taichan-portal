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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Toolbar (hidden when printing) */}
        <div className="print:hidden flex items-center justify-between p-3.5 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-600"></span>
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
        <div className="p-5 max-h-[75vh] overflow-y-auto bg-slate-100/70 flex justify-center">
          <div 
            id="thermal-receipt"
            className="w-[280px] bg-white p-4 shadow-sm border border-dashed border-slate-300 text-slate-900 font-mono text-[11px] leading-tight select-text print:w-full print:border-none print:shadow-none print:p-0"
          >
            {/* Header */}
            <div className="text-center pb-2 border-b border-dashed border-slate-400">
              <h3 className="font-black text-sm tracking-wider uppercase">TAICHAN PORTAL</h3>
            </div>

            {/* Content for Single Order */}
            {!isSummary && order && (
              <>
                <div className="py-2 border-b border-dashed border-slate-400 space-y-0.5 text-[10px]">
                  <div className="flex justify-between">
                    <span>Nomor Orderan:</span>
                    <span className="font-bold">{order.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tujuan:</span>
                    <span className="font-bold">{order.tableInfo}</span>
                  </div>
                </div>

                {/* Items */}
                <div className="py-2 border-b border-dashed border-slate-400 space-y-1.5">
                  {order.items.map((item, idx) => (
                    <div key={idx}>
                      <div className="flex justify-between font-bold">
                        <span className="truncate pr-1">{item.name}</span>
                        <span>{formatRupiah(item.subtotal)}</span>
                      </div>
                      <div className="text-[9px] text-slate-500 pl-2">
                        {item.quantity} × {formatRupiah(item.unitPrice)}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Total */}
                <div className="py-2 border-b border-dashed border-slate-400 font-bold">
                  <div className="flex justify-between text-xs">
                    <span>TOTAL:</span>
                    <span>{formatRupiah(order.totalAmount)}</span>
                  </div>
                </div>
              </>
            )}

            {/* Content for Summary */}
            {isSummary && summaryData && (
              <div className="py-2 border-b border-dashed border-slate-400 space-y-1.5 text-[10px]">
                <div className="text-center font-bold text-xs pb-1">
                  RINGKASAN REKAP OMZET
                </div>
                <div className="flex justify-between">
                  <span>Periode:</span>
                  <span className="font-bold">{summaryData.summary.dateLabel}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Transaksi:</span>
                  <span className="font-bold">{summaryData.summary.totalTransactions} Struk</span>
                </div>
                <div className="flex justify-between text-xs font-black pt-1 border-t border-dotted border-slate-300">
                  <span>TOTAL OMZET:</span>
                  <span>{formatRupiah(summaryData.summary.totalOmzet)}</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span>• CASH ({summaryData.summary.cashPercent}%):</span>
                  <span>{formatRupiah(summaryData.summary.cashAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>• QRIS ({summaryData.summary.qrisPercent}%):</span>
                  <span>{formatRupiah(summaryData.summary.qrisAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>• Rata-rata/Meja:</span>
                  <span>{formatRupiah(summaryData.summary.averagePerTable)}</span>
                </div>
                <div className="flex justify-between">
                  <span>• Total Porsi Sate:</span>
                  <span>{summaryData.summary.totalPortionsSold} Porsi</span>
                </div>
              </div>
            )}

            {/* Barcode & Footer simulation */}
            <div className="pt-3 text-center space-y-2">
              <div className="flex justify-center items-end h-8 gap-0.5">
                {[3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 3, 1, 2, 3, 4, 1, 2, 3].map((h, i) => (
                  <div
                    key={i}
                    className="bg-slate-800"
                    style={{
                      width: `${(i % 3) + 1}px`,
                      height: `${14 + h * 3}px`
                    }}
                  />
                ))}
              </div>
              <p className="text-[9px] text-slate-500">
                Terima Kasih Atas Kunjungan Anda!
              </p>
              <p className="text-[8px] text-slate-400">
                Simpan struk ini sebagai bukti pembayaran yang sah.
              </p>
            </div>

          </div>
        </div>

        {/* Modal Actions (hidden when printing) */}
        <div className="print:hidden p-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={closeThermalModal}
            className="flex-1 h-10 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold hover:bg-slate-100 transition-colors"
          >
            Tutup
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="flex-1 h-10 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-black flex items-center justify-center gap-1.5 shadow-md shadow-brand-600/20 active:scale-95 transition-all"
          >
            <Printer className="w-4 h-4" />
            Cetak Slip
          </button>
        </div>

      </div>
    </div>
  );
};
