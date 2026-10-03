# Panduan Implementasi: Supabase & Deployment Vercel
## TAICHAN PORTAL — Sistem Kasir & Manajemen Antrean PWA

Dokumen ini berisi panduan langkah demi langkah untuk:
1. Menghubungkan basis data lokal (IndexedDB Dexie.js) ke **Supabase** (PostgreSQL Cloud).
2. Melakukan deployment aplikasi web PWA ke **Vercel** dengan HTTPS otomatis.

---

## BAGIAN 1: Menghubungkan ke Supabase (Database Cloud)

Aplikasi Taichan Portal menggunakan arsitektur **Offline-First**:
* Transaksi dicatat terlebih dahulu di IndexedDB browser (Dexie.js) secara instan (0 ms).
* Ketika perangkat online, modul `syncPendingOrders()` di [`src/services/supabase.ts`](file:///d:/taichan-portal/src/services/supabase.ts) akan otomatis melakukan sinkronisasi data ke Supabase.

### Langkah 1: Buat Proyek di Supabase
1. Buka [https://supabase.com](https://supabase.com) dan buat akun / login.
2. Klik **New Project**, beri nama `taichan-portal`, dan pilih region terdekat (misal: `Singapore`).
3. Simpan database password Anda.

### Langkah 2: Buat Tabel `orders` di Supabase SQL Editor
Buka menu **SQL Editor** di dashboard Supabase Anda, lalu jalankan perintah SQL berikut:

```sql
-- 1. Buat tabel orders
CREATE TABLE IF NOT EXISTS public.orders (
    id VARCHAR(50) PRIMARY KEY,              -- Contoh: #ORD-001
    table_info VARCHAR(100) NOT NULL,        -- Contoh: Meja 03, Bungkus
    items JSONB NOT NULL DEFAULT '[]'::jsonb, -- Rincian pesanan (array of objects)
    total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
    payment_method VARCHAR(20) NOT NULL CHECK (payment_method IN ('CASH', 'QRIS')),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'DONE', 'completed', 'COMPLETED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    notes TEXT
);

-- 2. Buat index untuk pencarian cepat
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);

-- 3. Aktifkan Row Level Security (RLS)
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- 4. Buat Policy agar kasir/aplikasi dapat membaca dan menulis data
CREATE POLICY "Allow public read-write for orders" 
ON public.orders 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- CATATAN: Jika tabel orders sudah Anda buat sebelumnya di Supabase, jalankan baris berikut di SQL Editor agar status 'completed' dan Realtime Multi-Device Sync aktif:
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE public.orders ADD CONSTRAINT orders_status_check CHECK (status IN ('ACTIVE', 'DONE', 'completed', 'COMPLETED'));

-- 5. Aktifkan Supabase Realtime agar semua HP / Laptop sinkron secara live
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'orders'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
  END IF;
END $$;

ALTER TABLE public.orders REPLICA IDENTITY FULL;
```

### Langkah 3 & 4: Kredensial & Konfigurasi Supabase

Kredensial proyek Supabase Anda:
* **Project URL:**
  ```text
  https://psbwmursjhotbrzidjcb.supabase.co
  ```
* **Project API Key (anon / public):**
  ```text
  eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  ```

#### Konfigurasi Kredensial di Aplikasi & Vercel:
* **Lokal / Development:**
  Kredensial di atas sudah otomatis terpasang pada file [`.env`](file:///d:/taichan-portal/.env).
* **Di Vercel (Production):**
  Di dashboard Vercel pada proyek Anda, buka **Settings > Environment Variables**, lalu tambahkan:
  - `VITE_SUPABASE_URL` = `https://psbwmursjhotbrzidjcb.supabase.co`
  - `VITE_SUPABASE_ANON_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

---

## BAGIAN 2: Deployment Aplikasi ke Vercel

Vercel mendukung Vite React PWA secara *out-of-the-box* dengan sertifikat SSL/HTTPS gratis yang diperlukan untuk fitur PWA Service Worker.

### Langkah 1: Push Proyek ke GitHub
Jika belum di-push ke GitHub:
1. Buka terminal di folder `d:\taichan-portal`:
   ```bash
   git init
   git add .
   git commit -m "feat: Sistem Kasir Taichan Portal selesai dengan 14 penyesuaian"
   ```
2. Buat repository baru di GitHub (misal: `taichan-portal`).
3. Sambungkan dan push:
   ```bash
   git remote add origin https://github.com/USERNAME/taichan-portal.git
   git branch -M main
   git push -u origin main
   ```

### Langkah 2: Deploy di Vercel Dashboard
1. Buka [https://vercel.com](https://vercel.com) dan login dengan akun GitHub Anda.
2. Klik tombol **Add New...** > **Project**.
3. Pilih repository `taichan-portal` lalu klik **Import**.
4. Konfigurasi Project Settings:
   - **Framework Preset:** `Vite`
   - **Root Directory:** `./`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. (Opsional) Tambahkan Environment Variables di bagian **Environment Variables**:
   - `VITE_SUPABASE_URL` = `https://xyzabcdefgh.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `eyJhbGciOi...`
6. Klik **Deploy**.
7. Tunggu sekitar 1 menit hingga status *Ready*. Anda akan mendapatkan domain URL seperti:
   `https://taichan-portal.vercel.app`

### Langkah 3: Install PWA di Ponsel Kasir / Tablet
1. Buka link Vercel di browser Google Chrome (Android) atau Safari (iOS) di ponsel kasir.
2. Di Chrome: Tekan menu titik tiga `⋮` > Pilih **"Tambahkan ke Layar Utama" (Install App)**.
3. Di Safari: Tekan tombol *Share* `⎋` > Pilih **"Add to Home Screen"**.
4. Aplikasi Taichan Portal kini terpasang sebagai aplikasi mandiri (*standalone*) tanpa bilah alamat browser, siap digunakan secara offline maupun online!
