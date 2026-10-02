import { jsPDF } from 'jspdf';
import { FinancialSummary, Order } from '../types';
import { formatRupiah } from './format';

export function exportOmzetPDF(
  summary: FinancialSummary,
  orders: Order[],
  _cashierName?: string,
  _outletName?: string
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  let currentY = 18;

  // Header Bar
  doc.setFillColor(197, 34, 31); // #C5221F
  doc.rect(14, currentY, pageWidth - 28, 20, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('TAICHAN PORTAL', 20, currentY + 8.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text('REKAP OMZET & LAPORAN PENJUALAN', 20, currentY + 14.5);

  // Right side header info (only print date/time, no cashier name)
  doc.setFontSize(8);
  doc.text(
    `Dicetak: ${new Date().toLocaleDateString('id-ID')} ${new Date().toLocaleTimeString('id-ID')}`,
    pageWidth - 20,
    currentY + 11.5,
    { align: 'right' }
  );

  currentY += 26;

  // Period Details (No Lokasi / Tanpa Shift subtitle)
  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(`Periode: ${summary.dateLabel} (${summary.period.toUpperCase()})`, 14, currentY);

  currentY += 7;

  // Metrics Card: TOTAL OMZET BERSIH (No Rata-rata/Meja)
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, currentY, pageWidth - 28, 24, 3, 3, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text('TOTAL OMZET BERSIH', 20, currentY + 7);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(197, 34, 31);
  doc.text(formatRupiah(summary.totalOmzet), 20, currentY + 16.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(5, 150, 105); // Green
  doc.text(`• ${summary.totalTransactions} Transaksi Sukses`, pageWidth - 22, currentY + 13, { align: 'right' });

  currentY += 29;

  // Payment Breakdown side-by-side
  const colWidth = (pageWidth - 28 - 6) / 2;

  // CASH Box
  doc.setFillColor(255, 251, 235);
  doc.setDrawColor(253, 230, 138);
  doc.roundedRect(14, currentY, colWidth, 22, 2, 2, 'FD');

  doc.setTextColor(180, 83, 9);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(`PEMBAYARAN CASH (${summary.cashPercent}%)`, 18, currentY + 7);

  doc.setFontSize(12);
  doc.text(formatRupiah(summary.cashAmount), 18, currentY + 14);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(`${summary.cashCount} Transaksi Tunai`, 18, currentY + 19);

  // QRIS Box
  doc.setFillColor(239, 246, 255);
  doc.setDrawColor(191, 219, 254);
  doc.roundedRect(14 + colWidth + 6, currentY, colWidth, 22, 2, 2, 'FD');

  doc.setTextColor(29, 78, 216);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(`PEMBAYARAN QRIS (${summary.qrisPercent}%)`, 18 + colWidth + 6, currentY + 7);

  doc.setFontSize(12);
  doc.text(formatRupiah(summary.qrisAmount), 18 + colWidth + 6, currentY + 14);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(`${summary.qrisCount} Transaksi Non-Tunai`, 18 + colWidth + 6, currentY + 19);

  currentY += 28;

  // Transaction History Table Title
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Daftar Transaksi Selesai', 14, currentY);

  currentY += 5;

  // Table Header (NOMOR ORDERAN, MEJA / KETERANGAN, METODE, TOTAL (RP) - WAKTU SELESAI REMOVED)
  doc.setFillColor(241, 245, 249);
  doc.rect(14, currentY, pageWidth - 28, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);

  doc.text('NOMOR ORDERAN', 18, currentY + 5.5);
  doc.text('MEJA / KETERANGAN', 75, currentY + 5.5);
  doc.text('METODE', 140, currentY + 5.5);
  doc.text('TOTAL (RP)', pageWidth - 20, currentY + 5.5, { align: 'right' });

  currentY += 8;

  // Table Rows
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);

  orders.slice(0, 22).forEach((order, index) => {
    if (currentY > 270) {
      doc.addPage();
      currentY = 20;
    }

    if (index % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(14, currentY, pageWidth - 28, 7, 'F');
    }

    doc.setTextColor(15, 23, 42);
    doc.text(order.id, 18, currentY + 4.8);
    doc.text(order.tableInfo, 75, currentY + 4.8);

    doc.setFont('helvetica', 'bold');
    if (order.paymentMethod === 'CASH') {
      doc.setTextColor(180, 83, 9);
    } else {
      doc.setTextColor(29, 78, 216);
    }
    doc.text(order.paymentMethod, 140, currentY + 4.8);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(formatRupiah(order.totalAmount), pageWidth - 20, currentY + 4.8, { align: 'right' });
    doc.setFont('helvetica', 'normal');

    currentY += 7;
  });

  // Footer Note
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text('Taichan Portal POS • Offline-First Progressive Web App', pageWidth / 2, 288, { align: 'center' });

  // Save the PDF
  const filename = `Rekap-Omzet-Taichan-Portal-${summary.period}-${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
}
