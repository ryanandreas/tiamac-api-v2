# Prompt Perancangan UI/UX Admin Panel & Teknisi Panel

Aplikasi: Sistem Manajemen Servis AC Berbasis Website

Buatkan perencanaan tampilan (UI/UX structure) untuk aplikasi web dengan 2 role utama:
**Admin Panel** dan **Teknisi Panel**.

Fokus desain:

* Dashboard operasional real-time
* Kemudahan penggunaan
* Alur kerja servis end-to-end
* Manajemen inventory & sparepart
* Otomatisasi biaya servis dari pemakaian barang

---

# 🔁 SERVICE WORKFLOW TERINTEGRASI INVENTORY

## 1. Booking (Pre-Service)

Customer melakukan booking servis
Sistem menampilkan Estimasi Biaya Dasar (Biaya Kunjungan/Diagnosa)
Customer wajib menyetujui biaya dasar

Status: **Booking**

---

## 2. Menunggu Jadwal (Scheduling)

Admin menentukan:

* Teknisi
* Tanggal & waktu kunjungan

Sistem kirim notifikasi ke Customer & Teknisi

Status:
**Menunggu Jadwal → Teknisi Dikonfirmasi**

---

## 3. Dalam Pengecekan

Teknisi tiba di lokasi & diagnosa unit

Teknisi input:

* Rincian kerusakan
* Estimasi biaya jasa

Status: **Dalam Pengecekan**

---

## 4. Persetujuan Biaya Awal

Customer melihat estimasi awal
Customer memilih:

* Setuju → lanjut pengerjaan
* Tolak → hanya bayar biaya kunjungan

Status: **Menunggu Persetujuan Customer**

---

## 5. Pengerjaan Servis + Pemakaian Inventory

Teknisi mulai pengerjaan.

Selama servis, teknisi dapat:

* Menambahkan sparepart dari inventory
* Input jumlah barang yang dipakai
* Sistem otomatis:

  * Mengurangi stok inventory
  * Menambahkan biaya sparepart ke rincian servis

Status: **Sedang Dikerjakan**

---

## 6. Pekerjaan Selesai & Bukti

Teknisi wajib upload:

* Foto Before
* Foto After
* Foto sparepart bekas (jika ada)

Status: **Pekerjaan Selesai**

---

## 7. Invoice Final & Pembayaran

Sistem generate Invoice Final otomatis dari:

* Biaya jasa
* Total sparepart terpakai (dari inventory)
* Biaya tambahan lain

Customer melakukan pembayaran

Setelah lunas:

* Sistem aktifkan garansi servis (misal 30 hari)

Status:
**Menunggu Pembayaran → Selesai (Garansi Aktif)**

---

# 📦 SISTEM INVENTORY (SPAREPART MANAGEMENT)

Inventory terintegrasi langsung dengan proses servis.

## Alur Inventory

1. Admin mengelola stok barang
2. Teknisi menggunakan barang saat servis
3. Stok otomatis berkurang
4. Biaya barang otomatis masuk invoice

---

# 🖥️ ADMIN PANEL — UI PLANNING

## 🎯 Tujuan

Mengelola operasional, teknisi, servis, transaksi, dan inventory.

---

## 🧭 Struktur Menu Admin

1. Dashboard
2. Manajemen Pesanan
3. Jadwal Servis
4. Teknisi
5. Pelanggan
6. Layanan & Harga
7. Inventory & Sparepart
8. Pembayaran & Transaksi
9. Laporan
10. Notifikasi
11. Pengaturan Sistem

---

## 📊 Halaman & Fitur Admin

### 1. Dashboard Admin

KPI Operasional:

* Total Pesanan Hari Ini
* Servis Berjalan
* Menunggu Persetujuan Customer
* Stok Menipis
* Total Pendapatan
* Grafik Tren Servis
* Aktivitas Terbaru

---

### 2. Manajemen Pesanan

Fitur:

* Tabel pesanan
* Filter berdasarkan status
* Detail pesanan:

  * Data pelanggan
  * Lokasi
  * Keluhan
  * Estimasi biaya dasar
  * Teknisi
  * Timeline status
  * Rincian biaya jasa
  * Rincian sparepart terpakai
  * Foto bukti servis
  * Invoice & status bayar

Aksi:

* Konfirmasi booking
* Jadwalkan servis
* Tugaskan teknisi
* Ubah status
* Batalkan pesanan

---

### 3. Jadwal Servis

* Calendar view
* Drag & drop penjadwalan
* Jadwal per teknisi
* Indikator warna status

---

### 4. Manajemen Teknisi

* List teknisi
* Status aktif / bertugas / offline
* Profil teknisi
* Riwayat pekerjaan
* Rating performa

---

### 5. Manajemen Pelanggan

* Database pelanggan
* Riwayat servis
* Total transaksi

---

### 6. Layanan & Harga

* Daftar layanan servis AC
* Pengaturan harga jasa
* Biaya kunjungan dasar

---

### 7. Inventory & Sparepart (NEW — CORE FEATURE)

#### Fitur Utama:

* Daftar barang
* Kategori sparepart
* Stok tersedia
* Harga beli
* Harga jual
* Supplier

#### Manajemen Stok:

* Tambah stok masuk
* Edit data barang
* Riwayat pergerakan stok
* Stok minimum alert

#### Monitoring:

* Barang paling sering dipakai
* Penggunaan per teknisi
* Nilai aset inventory

---

### 8. Pembayaran & Transaksi

* Status bayar: Belum Bayar / DP / Lunas
* Detail invoice:

  * Biaya jasa
  * Sparepart terpakai (auto dari inventory)
  * Biaya tambahan
* Bukti pembayaran
* Riwayat transaksi

---

### 9. Laporan

* Pendapatan servis
* Jumlah pesanan
* Performa teknisi
* Penggunaan sparepart
* Stok masuk & keluar
* Garansi aktif
* Export PDF/Excel

---

# 🧑‍🔧 TEKNISI PANEL — UI PLANNING

## 🎯 Tujuan

Membantu teknisi bekerja cepat di lapangan (mobile-friendly).

---

## 🧭 Struktur Menu Teknisi

1. Dashboard Teknisi
2. Tugas Saya
3. Jadwal Saya
4. Input Pengerjaan
5. Inventory Digunakan
6. Riwayat Servis
7. Profil

---

## 📱 Halaman & Fitur Teknisi

### 1. Dashboard Teknisi

* Jumlah tugas hari ini
* Jadwal berikutnya
* Status kerja

---

### 2. Tugas Saya

Detail tugas:

* Data pelanggan
* Alamat + maps
* Jenis layanan
* Keluhan
* Estimasi biaya dasar

Tombol aksi:

* Terima tugas
* Mulai perjalanan
* Tiba di lokasi
* Mulai servis

---

### 3. Input Pengerjaan

Form:

* Rincian kerusakan
* Biaya jasa
* Catatan teknisi

---

### 4. Inventory Digunakan (CRITICAL)

Saat servis berjalan:

Teknisi dapat:

* Cari sparepart
* Lihat stok tersedia
* Pilih barang
* Input jumlah pakai

Sistem otomatis:

* Hitung total biaya sparepart
* Kurangi stok inventory
* Tambahkan ke rincian servis

---

### 5. Selesaikan Pekerjaan

Upload wajib:

* Foto Before
* Foto After
* Foto sparepart bekas

Submit pekerjaan selesai

---

### 6. Riwayat Servis

* List pekerjaan selesai
* Detail servis
* Total penghasilan

---

### 7. Profil Teknisi

* Data diri
* Status aktif
* Rating
* Statistik performa

---

# 📌 MASTER STATUS LIST

1. Booking
2. Menunggu Jadwal
3. Teknisi Dikonfirmasi
4. Dalam Pengecekan
5. Menunggu Persetujuan Customer
6. Sedang Dikerjakan
7. Pekerjaan Selesai
8. Menunggu Pembayaran
9. Selesai (Garansi Aktif)
10. Dibatalkan

---

# 🎨 UI DESIGN GUIDELINES

* Design system berbasis shadcn/ui
* Clean modern dashboard
* Card-based layout
* Tabel interaktif
* Notifikasi real-time

Warna:

* Hijau muda → Primary
* Biru → Selesai
* Oranye → Proses
* Merah → Urgent/Batal

Responsiveness:

* Admin → Desktop-first
* Teknisi → Mobile-first

---

# ⚙️ OUTPUT YANG DIHARAPKAN DARI AI BUILDER

1. Sitemap halaman
2. User flow diagram
3. Wireframe low-fidelity
4. UI component system
5. Dashboard layout
6. Responsive design (Admin Desktop / Teknisi Mobile)
7. Inventory-to-Invoice automation flow
