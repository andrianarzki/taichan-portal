# Product Requirement Document (PRD) & Implementation Plan
## Sistem Kasir & Manajemen Antrean — TAICHAN PORTAL

---

## 1. Ringkasan Eksekutif & Latar Belakang
**Taichan Portal** adalah bisnis kuliner sate taichan berbasis gerobak/booth kontainer[cite: 2, 3]. Operasional pencatatan pesanan yang sebelumnya menggunakan kertas/buku manual membutuhkan digitalisasi yang ringkas, cepat, dan tidak membebani ritme kerja juru masak dan kasir.

Sistem dirancang sebagai **Web Progressive Web App (PWA)** dengan kapabilitas **Offline-First**:
* Transaksi dan antrean dapat dicatat seketika di ponsel kasir tanpa ketergantungan sinyal internet.
* Data otomatis disinkronisasi ke basis data awan (*cloud*) ketika perangkat terhubung kembali ke jaringan.
* Menghilangkan proses administratif buka/tutup shift kasir agar operasional berjalan tanpa jeda.

---

## 2. Arsitektur & Tech Stack
* **Platform:** Progressive Web App (PWA) — responsif untuk layar ponsel pintar (viewport max 480px)[cite: 8, 9, 11].
* **Frontend:** Vite + React (TypeScript) + Tailwind CSS.
* **Komponen Ikon:** Lucide Icons / Heroicons.
* **Penyimpanan Lokal (Offline-First):** Dexie.js (IndexedDB) untuk pencatatan instan dengan latensi 0 ms.
* **Basis Data Awan & Sinkronisasi:** Supabase (PostgreSQL) dengan sinkronisasi otomatis (*background sync* via Service Worker).
* **State Management:** Zustand.
* **Ekspor Dokumen:** jsPDF (cetak rekap PDF) dan Web Bluetooth API / browser print (slip thermal 58mm)[cite: 13].

---

## 3. Spesifikasi Fitur Berdasarkan Struktur 3 Tab

### Tab 1: Input Pesanan
Halaman utama kasir untuk merekam pesanan baru secara cepat[cite: 12].

1. **Header Sistem:**
   * Logo Taichan Portal, indikator status koneksi (`• Online` / `• Offline`), dan profil pengguna[cite: 12].
2. **Identifikasi Meja / Antrean (Wajib):**
   * Field teks input fleksibel dengan tombol hapus cepat (`✕`)[cite: 12].
   * Tombol pintas (*quick-select chips*): `Meja 01`, `Meja 02`, `Meja 03`, `Meja 04`, serta tombol opsi hapus/reset[cite: 12].
   * Mendukung keterangan non-meja seperti "Bungkus", "Takeaway", atau ciri pakaian pembeli[cite: 13].
3. **Katalog Menu & Kontrol Kuantitas (`- / +`):**
   * **Sate Taichan (Porsi & Satuan):**
     * Taichan Daging (Porsi 10 tsk) — Rp 20.000[cite: 12]
     * Taichan Daging (Satuan / 1 tsk) — Rp 2.000[cite: 12]
     * Taichan Kulit (Porsi 10 tsk) — Rp 16.000[cite: 12]
     * Taichan Kulit (Satuan / 1 tsk) — Rp 1.500[cite: 12]
     * Taichan Campur (10 tsk) — Rp 18.000[cite: 12]
     * Taichan Krispy (10 tsk) — Rp 20.000[cite: 12]
   * **Makanan Pendamping (Karbohidrat):**
     * Nasi Daun Jeruk — Rp 4.000[cite: 12]
     * Lontong Tradisional — Rp 3.000[cite: 12]
   * **Minuman (Dingin & Hangat):**
     * Es Teh Manis / Tawar — Rp 4.000[cite: 12]
     * Nutrisari Jeruk Dingin — Rp 6.000[cite: 12]
     * Air Mineral 600ml — Rp 5.000[cite: 12]
4. **Metode Pembayaran (Dipilih saat Input):**
   * Kartu radio ganda: **CASH** (Tunai Kasir) dan **QRIS** (Barcode Dinamis)[cite: 12].
5. **Sticky Bottom Action Bar:**
   * Ringkasan kuantitas (`X Menu (Y Porsi)`)[cite: 12].
   * Kalkulasi total tagihan (`Total: Rp XX.XXX`)[cite: 12].
   * Tombol aksi utama: **`+ TAMBAH KE PESANAN`** yang memvalidasi isi keranjang lalu mengarahkan ke Tab 2[cite: 12].

---

### Tab 2: Pesanan Aktif (Kitchen Display / Antrean Dapur)
Layar kendali pesanan berjalan untuk staf dapur dan kasir[cite: 14].

1. **Header Antrean:**
   * Indikator antrean aktif (`Antrean Dapur X Aktif`)[cite: 14].
   * Penanda urutan masuk dengan aturan **FIFO (First In, First Out)**[cite: 14].
2. **Komponen Kartu Pesanan (*Order Card*):**
   * Identifikasi tiket: nomor pesanan (contoh: `#ORD-001`), label meja/identitas, badge pembayaran (`CASH (LUNAS)` / `QRIS (LUNAS)`), dan stempel waktu relatif (contoh: `20:15 WIB (6 mnt lalu)`)[cite: 14].
   * Rincian item pesanan lengkap dengan takaran porsi, kuantitas satuan, harga satuan, dan subtotal[cite: 14].
   * Total nilai pesanan[cite: 14].
   * Tombol aksi di bawah kartu: **`✓ SELESAIKAN PESANAN`** yang mengubah status pesanan dari `ACTIVE` ke `DONE`[cite: 14].

---

### Tab 3: Omzet & Riwayat
Laporan analitik finansial otomatis tanpa batasan shift[cite: 13].

1. **Filter Periode:** Segmented control tiga opsi: **Harian**, **Bulanan**, dan **Tahunan**[cite: 13].
2. **Kartu Ringkasan Metrik:**
   * Tampilan stempel tanggal dan total transaksi sukses[cite: 13].
   * **TOTAL OMSET BERSIH** dalam tipografi kontras[cite: 13].
   * Indikator pertumbuhan performa (contoh: `+18% dari kemarin`)[cite: 13].
   * Badge informasi: `Sistem Otomatis (Tanpa Shift) • Real-time Cloud` dan `Tutup Kas Otomatis Aktif`[cite: 13].
3. **Pemisahan Metode Pembayaran:**
   * Kotak metrik **CASH**: akumulasi nominal, jumlah struk, dan progress bar persentase kontribusi[cite: 13].
   * Kotak metrik **QRIS**: akumulasi nominal, jumlah struk, dan progress bar persentase kontribusi[cite: 13].
4. **Metrik Operasional Tambahan:**
   * Rata-rata nominal per meja[cite: 13].
   * Total akumulasi porsi sate yang terjual[cite: 13].
5. **Daftar Riwayat Transaksi Selesai:**
   * Item riwayat terurut mundur (terbaru di atas) menampilkan ID transaksi, label meja/tujuan, waktu bayar, metode pembayaran, dan nominal transaksi[cite: 13].
6. **Ekspor & Cetak:**
   * Tombol **Cetak Slip Ringkasan**[cite: 13].
   * Tombol **Unduh Laporan Rekap PDF**[cite: 13].

---

## 4. Struktur Data (Schema Database)

### Skema IndexedDB (Dexie.js) & PostgreSQL (Supabase)

```typescript
interface MenuItem {
  id: string;
  name: string;
  category: 'taichan' | 'side' | 'drink';
  type: 'portion' | 'unit';
  price: number;
}

interface OrderItem {
  menuId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
  note?: string;
}

interface Order {
  id: string; // Format: ORD-001, ORD-002, dst.
  tableInfo: string;
  items: OrderItem[];
  totalAmount: number;
  paymentMethod: 'CASH' | 'QRIS';
  status: 'ACTIVE' | 'DONE';
  createdAt: string; // ISO 8601
  completedAt?: string; // ISO 8601
  synced: boolean; // Flag sinkronisasi lokal ke Supabase
}