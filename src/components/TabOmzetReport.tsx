import React, { useState, useMemo, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { Order, FilterPeriod, FinancialSummary } from '../types';
import { formatRupiah, formatTimeWIB, formatDateIndonesian } from '../utils/format';
import { exportOmzetPDF } from '../utils/pdfGenerator';
import { useAppStore } from '../store/useAppStore';
import { 
  Calendar, 
  Wallet, 
  QrCode, 
  Printer, 
  Download, 
  CheckCircle2, 
  Sparkles, 
  ChevronLeft, 
  ChevronRight, 
  Flame 
} from 'lucide-react';

const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export const TabOmzetReport: React.FC = () => {
  const [period, setPeriod] = useState<FilterPeriod>('daily');
  
  // Year filter logic: starts from 2026, dynamic up to current year
  const currentYear = new Date().getFullYear();
  const availableYears = useMemo(() => {
    const startYear = 2026;
    const endYear = Math.max(startYear, currentYear);
    const years: number[] = [];
    for (let y = startYear; y <= endYear; y++) {
      years.push(y);
    }
    return years;
  }, [currentYear]);

  const [selectedYear, setSelectedYear] = useState<number>(() => {
    return Math.max(2026, new Date().getFullYear());
  });

  const [selectedMonth, setSelectedMonth] = useState<number>(() => new Date().getMonth());
  const [selectedDailyDate, setSelectedDailyDate] = useState<Date>(() => new Date());
  const [currentPage, setCurrentPage] = useState<number>(1);

  const { openThermalSlip, openThermalSummary, cashierName, outletName } = useAppStore();

  // Helper date functions
  const formatToISODate = (d: Date): string => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const isToday = (d: Date): boolean => {
    const now = new Date();
    return (
      d.getDate() === now.getDate() &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear()
    );
  };

  const handlePrevDay = () => {
    const prev = new Date(selectedDailyDate);
    prev.setDate(prev.getDate() - 1);
    setSelectedDailyDate(prev);
  };

  const handleNextDay = () => {
    const next = new Date(selectedDailyDate);
    next.setDate(next.getDate() + 1);
    const now = new Date();
    if (next <= now || isToday(next)) {
      setSelectedDailyDate(next);
    }
  };

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [period, selectedYear, selectedMonth, selectedDailyDate]);

  // Live query all completed orders
  const completedOrders = useLiveQuery(
    async () => {
      const orders = await db.orders.filter(o => o.status === 'DONE' || o.status === 'completed').toArray();
      // Sort reverse chronological (newest completed first)
      return orders.sort((a, b) => {
        const timeA = new Date(a.completedAt || a.createdAt).getTime();
        const timeB = new Date(b.completedAt || b.createdAt).getTime();
        return timeB - timeA;
      });
    },
    [],
    []
  );

  // Active days in selected month with completed transactions
  const activeDaysInMonth = useMemo(() => {
    const set = new Set<number>();
    if (!completedOrders) return set;
    const m = selectedDailyDate.getMonth();
    const y = selectedDailyDate.getFullYear();
    completedOrders.forEach((o) => {
      const d = new Date(o.completedAt || o.createdAt);
      if (d.getMonth() === m && d.getFullYear() === y) {
        set.add(d.getDate());
      }
    });
    return set;
  }, [completedOrders, selectedDailyDate]);

  // Generate all calendar days in the selected month for horizontal strip
  const daysInSelectedMonth = useMemo(() => {
    const year = selectedDailyDate.getFullYear();
    const month = selectedDailyDate.getMonth();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const days: { date: Date; dayNum: number; dayName: string; hasTransactions: boolean; isTodayDate: boolean }[] = [];
    const today = new Date();

    for (let d = 1; d <= totalDays; d++) {
      const dateObj = new Date(year, month, d);
      const dayNameShort = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'][dateObj.getDay()];
      const isTodayDate =
        d === today.getDate() &&
        month === today.getMonth() &&
        year === today.getFullYear();
      const hasTransactions = activeDaysInMonth.has(d);

      days.push({
        date: dateObj,
        dayNum: d,
        dayName: dayNameShort,
        hasTransactions,
        isTodayDate
      });
    }
    return days;
  }, [selectedDailyDate, activeDaysInMonth]);

  // Filter orders according to period, month, and year
  const filteredOrders = useMemo(() => {
    if (!completedOrders) return [];

    return completedOrders.filter((order) => {
      const orderDate = new Date(order.completedAt || order.createdAt);
      const orderYear = orderDate.getFullYear();
      const orderMonth = orderDate.getMonth();

      if (period === 'daily') {
        return (
          orderDate.getDate() === selectedDailyDate.getDate() &&
          orderMonth === selectedDailyDate.getMonth() &&
          orderYear === selectedDailyDate.getFullYear()
        );
      } else if (period === 'monthly') {
        return orderMonth === selectedMonth && orderYear === selectedYear;
      } else {
        // yearly
        return orderYear === selectedYear;
      }
    });
  }, [completedOrders, period, selectedMonth, selectedYear, selectedDailyDate]);

  // Aggregate metrics
  const summary: FinancialSummary = useMemo(() => {
    let totalOmzet = 0;
    let cashAmount = 0;
    let cashCount = 0;
    let qrisAmount = 0;
    let qrisCount = 0;
    let totalPortionsSold = 0;

    filteredOrders.forEach((o) => {
      totalOmzet += o.totalAmount;
      if (o.paymentMethod === 'CASH') {
        cashAmount += o.totalAmount;
        cashCount += 1;
      } else {
        qrisAmount += o.totalAmount;
        qrisCount += 1;
      }

      // Count portion skewers (robust fallback for category, menuId prefix tc-, or name contains taichan)
      o.items?.forEach((item) => {
        const isTaichan =
          item.category === 'taichan' ||
          item.menuId?.startsWith('tc-') ||
          item.name?.toLowerCase().includes('taichan');

        if (isTaichan) {
          totalPortionsSold += Number(item.quantity) || 0;
        }
      });
    });

    const totalTransactions = filteredOrders.length;
    const cashPercent = totalOmzet > 0 ? Math.round((cashAmount / totalOmzet) * 100) : 0;
    const qrisPercent = totalOmzet > 0 ? Math.round((qrisAmount / totalOmzet) * 100) : 0;
    const averagePerTable = totalTransactions > 0 ? Math.round(totalOmzet / totalTransactions) : 0;

    let dateLabel = '';
    if (period === 'daily') {
      dateLabel = formatDateIndonesian(selectedDailyDate);
    } else if (period === 'monthly') {
      dateLabel = `${MONTH_NAMES[selectedMonth]} ${selectedYear}`;
    } else {
      dateLabel = `Tahun ${selectedYear}`;
    }

    return {
      period,
      dateLabel,
      totalOmzet,
      totalTransactions,
      cashAmount,
      cashCount,
      cashPercent,
      qrisAmount,
      qrisCount,
      qrisPercent,
      averagePerTable,
      totalPortionsSold
    };
  }, [filteredOrders, period, selectedMonth, selectedYear, selectedDailyDate]);

  // Pagination per 10 items
  const PAGE_SIZE = 10;
  const totalPages = Math.ceil(filteredOrders.length / PAGE_SIZE) || 1;
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredOrders.slice(start, start + PAGE_SIZE);
  }, [filteredOrders, currentPage]);

  const handleDownloadPDF = () => {
    exportOmzetPDF(summary, filteredOrders, cashierName, outletName);
  };

  const handlePrintSummarySlip = () => {
    openThermalSummary({
      summary,
      orders: filteredOrders,
      cashierName,
      outletName
    });
  };

  return (
    <div className="pb-[calc(env(safe-area-inset-bottom,0px)+80px)] pt-2">
      <div className="w-full px-4 space-y-4">
        
        {/* 1. Segmented Filter Switcher */}
        <section className="space-y-2.5">
          <div className="bg-slate-100 p-1 rounded-2xl grid grid-cols-3 gap-1 shadow-xs">
            {(['daily', 'monthly', 'yearly'] as FilterPeriod[]).map((p) => {
              const labels: Record<FilterPeriod, string> = {
                daily: 'Harian',
                monthly: 'Bulanan',
                yearly: 'Tahunan'
              };
              const isSelected = period === p;
              return (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`py-2 text-xs font-bold rounded-xl transition-all ${
                    isSelected
                      ? 'bg-white text-brand-700 shadow-xs border border-slate-200/60'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {labels[p]}
                </button>
              );
            })}
          </div>

          {/* Conditional Sub-Filters for Day, Month & Year */}
          {period === 'daily' && (
            <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs space-y-2.5">
              {/* Header Navigasi Tanggal */}
              <div className="flex items-center justify-between gap-1.5">
                <button
                  type="button"
                  onClick={handlePrevDay}
                  className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors active:scale-95 shrink-0"
                  title="Hari Sebelumnya"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {/* Date Display with Native Calendar Trigger */}
                <div className="relative flex items-center justify-center flex-1 mx-1">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-brand-400 transition-colors w-full justify-center">
                    <Calendar className="w-4 h-4 text-brand-600 shrink-0" />
                    <span className="text-xs font-black text-slate-800 text-center truncate">
                      {formatDateIndonesian(selectedDailyDate)}
                    </span>
                  </div>
                  {/* Invisible native date picker over the label */}
                  <input
                    type="date"
                    value={formatToISODate(selectedDailyDate)}
                    onChange={(e) => {
                      if (e.target.value) {
                        const [y, m, d] = e.target.value.split('-').map(Number);
                        setSelectedDailyDate(new Date(y, m - 1, d));
                      }
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    title="Klik untuk memilih tanggal kalender"
                  />
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {!isToday(selectedDailyDate) && (
                    <button
                      type="button"
                      onClick={() => setSelectedDailyDate(new Date())}
                      className="px-2 py-1 rounded-lg text-[10px] font-black bg-brand-50 text-brand-700 border border-brand-200 hover:bg-brand-100 transition-all"
                      title="Kembali ke Hari Ini"
                    >
                      Hari Ini
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleNextDay}
                    disabled={isToday(selectedDailyDate)}
                    className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
                      isToday(selectedDailyDate)
                        ? 'bg-slate-50 text-slate-300 cursor-not-allowed border border-slate-100'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 active:scale-95'
                    }`}
                    title="Hari Berikutnya"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Strip Tanggal dalam Bulan Ini (Horizontal Scrollable) */}
              <div className="space-y-1.5 pt-1.5 border-t border-slate-100">
                <div className="flex items-center justify-between text-[10px] text-slate-500 font-semibold px-0.5">
                  <span className="font-extrabold uppercase text-slate-500">
                    TANGGAL BULAN {MONTH_NAMES[selectedDailyDate.getMonth()].toUpperCase()}
                  </span>
                  <span className="flex items-center gap-1 text-[9px] text-emerald-600 font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    Ada Transaksi
                  </span>
                </div>

                <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none scroll-smooth">
                  {daysInSelectedMonth.map((item) => {
                    const isSelected =
                      item.date.getDate() === selectedDailyDate.getDate() &&
                      item.date.getMonth() === selectedDailyDate.getMonth() &&
                      item.date.getFullYear() === selectedDailyDate.getFullYear();
                    return (
                      <button
                        key={item.dayNum}
                        type="button"
                        onClick={() => setSelectedDailyDate(item.date)}
                        className={`shrink-0 w-11 h-13 rounded-xl flex flex-col items-center justify-center transition-all relative ${
                          isSelected
                            ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30 font-black'
                            : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/70 font-bold'
                        }`}
                      >
                        <span className={`text-[9px] ${isSelected ? 'text-white/80' : 'text-slate-400'}`}>
                          {item.dayName}
                        </span>
                        <span className="text-xs leading-none mt-1">
                          {item.dayNum}
                        </span>
                        {item.hasTransactions && (
                          <span
                            className={`w-1.5 h-1.5 rounded-full absolute bottom-1 ${
                              isSelected ? 'bg-amber-300' : 'bg-emerald-500'
                            }`}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {period === 'monthly' && (
            <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black tracking-wider text-slate-500 uppercase">
                  PILIH BULAN & TAHUN
                </span>
                {/* Year selector (only shows 2026 onwards) */}
                {availableYears.length > 1 ? (
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    className="text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 focus:outline-none"
                  >
                    {availableYears.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span className="text-xs font-black text-brand-700 bg-brand-50 px-2 py-0.5 rounded-md border border-brand-200/60">
                    {availableYears[0]}
                  </span>
                )}
              </div>

              {/* Month Pills */}
              <div className="grid grid-cols-4 gap-1.5">
                {MONTH_NAMES.map((name, index) => {
                  const isSelected = selectedMonth === index;
                  return (
                    <button
                      key={name}
                      type="button"
                      onClick={() => setSelectedMonth(index)}
                      className={`py-1.5 px-1 rounded-lg text-[11px] font-bold text-center transition-all truncate ${
                        isSelected
                          ? 'bg-brand-600 text-white shadow-xs'
                          : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {name.slice(0, 3)}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {period === 'yearly' && (
            <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
              <span className="text-[11px] font-black tracking-wider text-slate-500 uppercase">
                PILIHAN TAHUN
              </span>
              {availableYears.length > 1 ? (
                <div className="flex items-center gap-1.5">
                  {availableYears.map((year) => (
                    <button
                      key={year}
                      type="button"
                      onClick={() => setSelectedYear(year)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        selectedYear === year
                          ? 'bg-brand-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {year}
                    </button>
                  ))}
                </div>
              ) : (
                <span className="text-xs font-black text-brand-700 bg-brand-50 px-2.5 py-1 rounded-lg border border-brand-200/60">
                  {availableYears[0]}
                </span>
              )}
            </div>
          )}
        </section>

        {/* 2. Hero Metric Card (Omzet Bersih) */}
        <section className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-soft space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-1.5 font-semibold text-slate-700">
              <Calendar className="w-3.5 h-3.5 text-brand-600" />
              <span>{summary.dateLabel}</span>
            </div>
            <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/70">
              {summary.totalTransactions} Transaksi Selesai
            </span>
          </div>

          <div>
            <span className="text-[11px] font-extrabold tracking-wider text-slate-400 uppercase block">
              TOTAL OMSET BERSIH
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="font-black text-2xl tracking-tight text-slate-900">
                {formatRupiah(summary.totalOmzet)}
              </span>
            </div>
          </div>

          {/* Operational Sub-banners */}
          <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-1 text-[10px] text-slate-500 font-semibold">
            <span className="flex items-center gap-1 text-slate-600">
              <Sparkles className="w-3 h-3 text-amber-500" />
              Sistem Otomatis (Tanpa Shift) • Real-time Cloud
            </span>
            <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/60 font-bold">
              ✓ Tutup Kas Otomatis Aktif
            </span>
          </div>
        </section>

        {/* 3. Pemisahan Metode Pembayaran (CASH vs QRIS) */}
        <section className="grid grid-cols-2 gap-2.5">
          {/* CASH Metric Card */}
          <div className="bg-white rounded-2xl border border-amber-200/80 p-3.5 shadow-soft space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-amber-800">
                <Wallet className="w-4 h-4 text-amber-600" />
                <span className="font-extrabold text-xs">CASH</span>
              </div>
              <span className="text-[10px] font-black text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                {summary.cashPercent}%
              </span>
            </div>
            <div>
              <div className="font-black text-sm text-slate-900">
                {formatRupiah(summary.cashAmount)}
              </div>
              <div className="text-[10px] font-semibold text-slate-400 mt-0.5">
                {summary.cashCount} Struk Tunai
              </div>
            </div>
            {/* Progress bar */}
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-amber-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${summary.cashPercent}%` }}
              />
            </div>
          </div>

          {/* QRIS Metric Card */}
          <div className="bg-white rounded-2xl border border-blue-200/80 p-3.5 shadow-soft space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-blue-800">
                <QrCode className="w-4 h-4 text-blue-600" />
                <span className="font-extrabold text-xs">QRIS</span>
              </div>
              <span className="text-[10px] font-black text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                {summary.qrisPercent}%
              </span>
            </div>
            <div>
              <div className="font-black text-sm text-slate-900">
                {formatRupiah(summary.qrisAmount)}
              </div>
              <div className="text-[10px] font-semibold text-slate-400 mt-0.5">
                {summary.qrisCount} Struk Non-Tunai
              </div>
            </div>
            {/* Progress bar */}
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-blue-600 h-full rounded-full transition-all duration-500" 
                style={{ width: `${summary.qrisPercent}%` }}
              />
            </div>
          </div>
        </section>

        {/* 4. Metrik Total Terjual (Rata-rata meja telah dihilangkan sesuai point 11) */}
        <section className="bg-white rounded-2xl border border-slate-200/90 p-3.5 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center font-bold">
              <Flame className="w-4 h-4 text-brand-600" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Total Porsi Terjual</span>
              <div className="font-black text-sm text-slate-900">
                {summary.totalPortionsSold} Porsi Sate Taichan
              </div>
            </div>
          </div>

          <span className="text-xs font-bold text-brand-700 bg-brand-50 px-2 py-1 rounded-lg border border-brand-200/60">
            Terjual
          </span>
        </section>

        {/* 5. Tombol Aksi Laporan & Cetak */}
        <section className="grid grid-cols-2 gap-2.5 pt-1">
          <button
            type="button"
            onClick={handlePrintSummarySlip}
            className="h-11 rounded-xl border-2 border-slate-300 hover:border-slate-400 bg-white text-slate-800 font-extrabold text-xs flex items-center justify-center gap-1.5 active:scale-98 transition-all shadow-xs"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            Cetak Slip Ringkasan
          </button>

          <button
            type="button"
            onClick={handleDownloadPDF}
            className="h-11 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 active:scale-98 shadow-md shadow-brand-600/20 transition-all"
          >
            <Download className="w-4 h-4" />
            Unduh Rekap PDF
          </button>
        </section>

        {/* 6. Daftar Riwayat Transaksi Selesai dengan Pagination per 10 data */}
        <section className="space-y-2 pt-2">
          <div className="flex items-center justify-between px-1">
            <h4 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider">
              Riwayat Transaksi Selesai
            </h4>
            <span className="text-[11px] font-semibold text-slate-400">
              {filteredOrders.length} Pesanan Total
            </span>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center text-xs text-slate-400">
              Belum ada transaksi selesai pada periode ini.
            </div>
          ) : (
            <>
              <div className="space-y-2">
                {paginatedOrders.map((order) => (
                  <div
                    key={order.id}
                    onClick={() => openThermalSlip(order)}
                    className="bg-white rounded-xl border border-slate-200/80 p-3 hover:border-slate-300 flex items-center justify-between gap-3 shadow-2xs cursor-pointer active:bg-slate-50 transition-all"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-200/70">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-extrabold text-xs text-slate-900 truncate">
                            {order.id}
                          </span>
                          <span className="text-[11px] font-bold text-slate-500 truncate">
                            • {order.tableInfo}
                          </span>
                        </div>
                        <div className="text-[10px] mt-0.5">
                          <span
                            className={`font-black ${
                              order.paymentMethod === 'CASH' ? 'text-amber-700' : 'text-blue-700'
                            }`}
                          >
                            {order.paymentMethod}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-black text-xs text-slate-900 block">
                        {formatRupiah(order.totalAmount)}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-400 hover:text-brand-600">
                        Lihat Struk ❯
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination Controls (Point 12) */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-3 pb-2 px-1">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 border transition-all ${
                      currentPage === 1
                        ? 'bg-slate-100 text-slate-300 border-slate-200 cursor-not-allowed'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 shadow-2xs'
                    }`}
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    Sebelumnya
                  </button>

                  <span className="text-xs font-bold text-slate-500">
                    Hal <span className="text-slate-900">{currentPage}</span> dari <span className="text-slate-900">{totalPages}</span>
                  </span>

                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 border transition-all ${
                      currentPage === totalPages
                        ? 'bg-slate-100 text-slate-300 border-slate-200 cursor-not-allowed'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 shadow-2xs'
                    }`}
                  >
                    Selanjutnya
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </>
          )}
        </section>

      </div>
    </div>
  );
};
