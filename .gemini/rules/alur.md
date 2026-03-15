
List Status Step: 

1 Booking

- Keterangan: Customer baru saja membuat pesanan dan menyetujui biaya dasar (Booking Fee/Biaya Kunjungan).
- Action: Admin perlu melihat dan menjadwalkan.

2 Menunggu Jadwal

- Keterangan: Admin sudah melihat booking, tapi belum menetapkan teknisi/waktu spesifik.
- Action: Admin menetapkan Teknisi & Tanggal.

3 Teknisi Dikonfirmasi

- Keterangan: Jadwal & Teknisi sudah fix. Teknisi bersiap jalan ke lokasi.
- Action: Teknisi datang ke lokasi customer.
- Action: Teknisi Mengecek Kerusakan dan mengkonfirmasi apakah servis yang ada di pesanan sesuai dengan kerusakan customer. 
- Action: Teknisi menyesuaikan servis yang di butuhkan dengan kerusakan, dan menambah barang yang diperlukan dari inventori.

4 Menunggu Persetujuan Customer (Crucial Step)

- Keterangan: Teknisi sudah input biaya. Sistem menunggu Customer klik "Setuju" atau "Tolak" di aplikasi.
- Action: Customer review & approval.

5 Sedang Dikerjakan

- Keterangan: Customer sudah Setuju . Teknisi mulai bekerja (bongkar/pasang/perbaikan).
- Action: Teknisi bekerja & upload foto bukti (Before/After).
- Action: Setelah teknisi selesai proses servis dan upload bukti, Sistem generate Invoice Final.

6 Menunggu Pembayaran

- Keterangan: Invoice sudah keluar. Menunggu Customer transfer/bayar.
- Action: Customer melakukan pembayaran.

7 Selesai (Garansi Aktif)

- Keterangan: Pembayaran lunas. Garansi mulai berjalan. Transaksi tutup.
- Action: Customer bisa klaim garansi jika ada masalah dalam periode tertentu.
- Dibatalkan

8 Dibatalkan

- Keterangan: Booking dibatalkan oleh Customer sebelum teknisi jalan, atau Customer Menolak biaya perbaikan di tahap 5 (hanya bayar biaya kunjungan)
