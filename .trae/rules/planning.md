# Prompt Perancangan UI/UX Admin Panel & Teknisi Panel

Aplikasi: Sistem Manajemen Servis AC

Buatkan perencanaan tampilan (UI/UX structure) untuk aplikasi berbasis web dengan 2 role utama: **Admin Panel** dan **Teknisi Panel**.
Fokus pada dashboard operasional, kemudahan penggunaan, dan alur kerja servis AC.

---

## 🎛️ 1. ADMIN PANEL

### Tujuan

Mengelola seluruh operasional: pesanan servis, teknisi, pelanggan, jadwal, dan laporan.

### A. Struktur Menu Utama (Sidebar Navigation)

1. Dashboard
2. Manajemen Pesanan
3. Jadwal Servis
4. Teknisi
5. Pelanggan
6. Layanan & Harga
7. Pembayaran & Transaksi
8. Laporan
9. Notifikasi
10. Pengaturan Sistem

---

### B. Halaman & Fitur

#### 1. Dashboard Admin

Tampilkan ringkasan KPI operasional:

* Total Pesanan Hari Ini
* Pesanan Menunggu Konfirmasi
* Jadwal Servis Hari Ini
* Teknisi Aktif
* Total Pendapatan (Harian/Bulanan)
* Grafik Tren Pesanan
* Aktivitas Terbaru

---

#### 2. Manajemen Pesanan

Fitur:

* Tabel daftar pesanan
* Filter status:

  * Menunggu Konfirmasi
  * Dijadwalkan
  * Dalam Proses
  * Selesai
  * Dibatalkan
* Detail pesanan:

  * Data pelanggan
  * Alamat lokasi
  * Jenis layanan AC
  * Keluhan
  * Estimasi biaya
  * Teknisi yang ditugaskan
* Tombol aksi:

  * Konfirmasi pesanan
  * Jadwalkan servis
  * Tugaskan teknisi
  * Ubah status
  * Batalkan pesanan

---

#### 3. Jadwal Servis

Fitur:

* Kalender jadwal (calendar view)
* Drag & drop penjadwalan
* Lihat jadwal per teknisi
* Indikator warna berdasarkan status servis

---

#### 4. Manajemen Teknisi

Fitur:

* Daftar teknisi
* Status:

  * Aktif
  * Bertugas
  * Offline
* Info teknisi:

  * Nama
  * Kontak
  * Area cakupan
  * Jumlah tugas selesai
  * Rating
* Aksi:

  * Tambah teknisi
  * Edit data
  * Nonaktifkan
  * Lihat riwayat tugas

---

#### 5. Manajemen Pelanggan

Fitur:

* Database pelanggan
* Riwayat servis per pelanggan
* Total transaksi
* Alamat tersimpan

---

#### 6. Layanan & Harga

Fitur:

* Daftar layanan:

  * Cuci AC
  * Bongkar Pasang AC
  * Isi Freon
  * Perbaikan AC
* Kelola harga layanan
* Estimasi biaya dasar kunjungan

---

#### 7. Pembayaran & Transaksi

Fitur:

* Status pembayaran:

  * Belum bayar
  * DP
  * Lunas
* Metode pembayaran
* Upload bukti bayar
* Riwayat transaksi

---

#### 8. Laporan

Fitur:

* Laporan pendapatan
* Laporan jumlah servis
* Performa teknisi
* Ekspor PDF/Excel

---

#### 9. Notifikasi

* Pesanan baru
* Jadwal servis hari ini
* Pembayaran masuk
* Status servis selesai

---

#### 10. Pengaturan Sistem

* Profil perusahaan
* Area layanan
* Jam operasional
* Hak akses user

---

---

## 🧑‍🔧 2. TEKNISI PANEL

### Tujuan

Membantu teknisi mengelola tugas servis di lapangan secara praktis (mobile-friendly).

### A. Struktur Menu

1. Dashboard Teknisi
2. Tugas Saya
3. Jadwal Saya
4. Riwayat Servis
5. Navigasi Lokasi
6. Laporan Pekerjaan
7. Profil

---

### B. Halaman & Fitur

#### 1. Dashboard Teknisi

* Jumlah tugas hari ini
* Jadwal berikutnya
* Status kerja:

  * Siap Bertugas
  * Dalam Perjalanan
  * Sedang Servis

---

#### 2. Tugas Saya

Fitur:

* Daftar tugas aktif
* Detail tugas:

  * Data pelanggan
  * Alamat & maps
  * Jenis layanan
  * Keluhan pelanggan
  * Catatan admin
* Tombol aksi:

  * Terima tugas
  * Mulai perjalanan
  * Mulai servis
  * Selesaikan servis

---

#### 3. Jadwal Saya

* Tampilan kalender
* Timeline tugas harian

---

#### 4. Riwayat Servis

* Daftar pekerjaan selesai
* Detail servis
* Total penghasilan

---

#### 5. Navigasi Lokasi

* Integrasi Google Maps
* Tombol buka rute otomatis

---

#### 6. Laporan Pekerjaan

Setelah servis selesai:

* Checklist pekerjaan
* Catatan perbaikan
* Foto sebelum & sesudah
* Input biaya tambahan
* Tanda tangan pelanggan

---

#### 7. Profil Teknisi

* Data diri
* Status aktif/nonaktif
* Rating
* Riwayat performa

---

---

## 🎨 Desain UI Guidelines

* shadcn/ui sebagai acuan desain
* Clean dashboard
* Warna:

  * Hijau muda (utama)
  * Biru (selesai/sukses)
  * Oranye (proses)
  * Merah (urgent/batal)
* Card-based layout
* Mobile-first untuk teknisi panel
* Tabel interaktif untuk admin
* Notifikasi real-time

---

## ⚙️ Output yang Diharapkan dari AI Builder

* Wireframe struktur halaman
* Komponen UI
* User flow antar halaman
* Dashboard layout
* Mobile & desktop responsive design
