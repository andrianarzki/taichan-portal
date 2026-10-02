### File 2: `design.md`

```markdown
# Design System & UI Specification
## Aplikasi Kasir PWA — TAICHAN PORTAL

---

## 1. Filosofi & Pendekatan Desain
Antarmuka mengadopsi tema **Clean Light Mode** dengan latar belakang putih bersih dan abu-abu terang netral, dipadukan dengan aksen merah cabai khas banner Taichan Portal[cite: 1, 4, 12]. Seluruh elemen tombol sentuh dioptimalkan untuk pengoperasian cepat dengan satu tangan pada layar ponsel pintar di lingkungan gerobak[cite: 2, 3].

---

## 2. Palet Warna (Color Tokens)

| Peran Token | Nilai Hex | Penggunaan Antarmuka |
| :--- | :--- | :--- |
| **Brand Primary Red** | `#C5221F` / `#B91C1C` | Tombol aksi utama, counter `+`, chip meja terpilih, header aktif[cite: 12]. |
| **Brand Red Hover/Active** | `#991B1B` | State tekan (*active/pressed*) pada tombol utama. |
| **Surface Background** | `#F8FAFC` / `#FFFFFF` | Latar utama aplikasi, kartu menu, dan kartu antrean[cite: 12, 14]. |
| **Text Primary (Dark)** | `#0F172A` / `#1E293B` | Judul, nama menu, identitas meja, dan total harga[cite: 12, 14]. |
| **Text Muted / Secondary** | `#64748B` / `#94A3B8` | Kategori menu, keterangan takaran, dan penanda waktu[cite: 12, 14]. |
| **Success Green** | `#059669` / `#10B981` | Tombol selesaikan pesanan, badge online, dan banner omzet. |
| **Warning / Cash Gold** | `#D97706` / `#F59E0B` | Label harga menu dan tag metode pembayaran CASH[cite: 12, 14]. |
| **Accent Blue / QRIS** | `#2563EB` / `#3B82F6` | Tag metode pembayaran QRIS dan aksen pelengkap[cite: 13, 14]. |
| **Border / Divider** | `#E2E8F0` / `#F1F5F9` | Pembatas kartu, garis pisah menu, dan container[cite: 12, 14]. |

---

## 3. Tipografi & Tata Huruf
* **Font Family:** `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`.
* **Skala Tipografi:**
  * Header Brand: `18px`, Font Weight 900, tracking wide[cite: 12].
  * Judul Kartu / Meja: `15px` – `16px`, Font Weight 800[cite: 14].
  * Nama Menu: `14px`, Font Weight 700[cite: 12].
  * Angka Total / Banner Omzet: `20px` – `26px`, Font Weight 900[cite: 12, 13].
  * Keterangan / Sub-label: `11px` – `12px`, Font Weight 500 – 600[cite: 12, 13].

---

## 4. Spesifikasi Tata Letak Komponen UI

### A. Top Navigation Bar (Fixed Top)
* **Ketinggian:** 56px.
* **Isi:**
  * Sisi kiri: Logo sate merah melingkar + teks "Taichan Portal" + badge status koneksi (`• Online`)[cite: 12].
  * Sisi kanan: Tombol profil kasir berbentuk lingkaran merah[cite: 12].
* **Tab Bar Segmented Control:**
  * Tab 1: `⊕ 1. Input Pesanan`[cite: 12]
  * Tab 2: `📄 2. Pesanan (Badge Hitung)`[cite: 12]
  * Tab 3: `📊 3. Omzet & Riwayat`[cite: 12]

---

### B. Spesifikasi Komponen Tab 1 (Input Pesanan)
1. **Kotak Nomor Meja:**
   * Container putih dengan border halus (`#E2E8F0`), label "NO. MEJA / IDENTITAS ANTREAN", dan badge "Wajib"[cite: 12].
   * Input teks utama dengan tombol pembersih cepat (`✕`)[cite: 12].
   * Deretan chips cepat di bawah input: `Meja 01`, `Meja 02`, `Meja 03` (aktif: latar merah, teks putih), `Meja 04`, dan tombol reset[cite: 12].
2. **Katalog Menu:**
   * Dikelompokkan dalam 3 section berjarak rapi:
     * **Sate Taichan** (sub-label "Porsi & Satuan")[cite: 12]
     * **Makanan Pendamping** (sub-label "Karbohidrat")[cite: 12]
     * **Minuman** (sub-label "Dingin & Hangat")[cite: 12]
   * Setiap baris menu menyertakan:
     * Nama menu, takaran/deskripsi porsi, dan harga berformat tebal[cite: 12].
     * Stepper tombol kuantitas: tombol minus (`-`) berlatar abu-abu netral, angka kuantitas tebal di tengah, dan tombol plus (`+`) berlatar merah tegas[cite: 12].
3. **Selector Metode Pembayaran:**
   * Dua kartu pilihan berdampingan dengan rasio seimbang:
     * Kartu **CASH**: ikon dompet kasir, radio indicator merah, keterangan "Bayar langsung di kasir"[cite: 12].
     * Kartu **QRIS**: ikon barcode, radio indicator abu-abu, keterangan "Scan via e-wallet / m-bank"[cite: 12].
4. **Bottom Sticky Action Bar:**
   * Menempel di dasar layar (`bottom: 0`, z-index 40) dengan elevasi bayangan halus[cite: 12].
   * Baris atas: status item terhitung (`• X Menu (Y Porsi)`) di kiri, dan `Total: Rp XX.XXX` berukuran 18px tebal di kanan[cite: 12].
   * Tombol aksi penuh berlatar merah solid: `+ TAMBAH KE PESANAN` dengan sudut membulat (*rounded-xl*) dan tinggi minimal 48px[cite: 12].

---

### C. Spesifikasi Komponen Tab 2 (Pesanan Aktif / Antrean)
1. **Header Antrean Dapur:**
   * Banner status: `• Antrean Dapur X Aktif` berlatar abu-abu terang[cite: 14].
   * Penanda aturan: `Urutan Masuk` & `Prioritas FIFO (First In, First Out)`[cite: 14].
2. **Kartu Tiket Pesanan (*Order Ticket Card*):**
   * Latar kartu putih bersih dengan radius 16px dan border tipis[cite: 14].
   * Baris atas: nomor tiket berlatar biru pudar (contoh `#ORD-001`), label meja tebal (contoh `MEJA 03`), dan badge pembayaran (contoh `CASH (LUNAS)`)[cite: 14].
   * Baris waktu: ikon jam + waktu pemesanan (contoh `20:15 WIB (6 mnt lalu)`)[cite: 14].
   * Area rincian item: daftar pesanan porsi dan tusukan satuan lengkap dengan catatan (contoh: "Es batu normal", "Potong daun pisang")[cite: 14].
   * Baris footer kartu: nilai total tagihan di kiri dan tombol hijau solid **`✓ SELESAIKAN PESANAN`** di kanan bawah[cite: 14].

---

### D. Spesifikasi Komponen Tab 3 (Omzet & Riwayat Transaksi)
1. **Segmented Filter Switcher:**
   * Tiga tab switcher: `Harian`, `Bulanan`, dan `Tahunan`[cite: 13]. Tab aktif memiliki latar putih/merah dengan bayangan kontras[cite: 13].
2. **Hero Metric Card (Omzet Bersih):**
   * Container berlatar putih dengan border lembut[cite: 13].
   * Header kartu: penanggalan kalender lengkap dan total transaksi sukses (contoh `5 Transaksi Selesai`)[cite: 13].
   * Nominal omzet utama: angka besar tebal (contoh `Rp 320.000`) disertai indikator tren hijau (`+18% dari kemarin`)[cite: 13].
   * Sub-banner: stempel operasional `Tutup Kas Otomatis Aktif`[cite: 13].
3. **Metrik Kanal Pembayaran:**
   * Kartu CASH: total rupiah tunai, jumlah struk, dan garis persentase oranye[cite: 13].
   * Kartu QRIS: total rupiah non-tunai, jumlah struk, dan garis persentase ungu/biru[cite: 13].
4. **Metrik Operasional Rata-rata:**
   * Kartu metrik `Rata-rata / Meja` (contoh `Rp 64.000`)[cite: 13].
   * Kartu metrik `Total Terjual` (contoh `26 Porsi`)[cite: 13].
5. **Daftar Riwayat Selesai:**
   * Setiap baris transaksi menyertakan centang hijau di dalam lingkaran, nomor tiket, stempel waktu, metode bayar, dan nominal akhir transaksi[cite: 13].
6. **Tombol Aksi Laporan:**
   * Tombol sekunder bergaris (*outline*): `Cetak Slip Ringkasan`[cite: 13].
   * Tombol primer merah solid: `Unduh Laporan Rekap PDF`[cite: 13].