
List Status Step: 

1 Booking

- Keterangan: Customer baru saja membuat pesanan dan menyetujui biaya dasar (Booking Fee/Biaya Kunjungan).
- Action: customer harus bayar DP booking fee untuk melanjutkan ke tahap selanjutnya (Menunggu Jadwal).

2 Menunggu Jadwal

- Keterangan: customer sudah bayar DP booking fee. 
- Action: Admin menetapkan Teknisi & Tanggal kunjungan lalu status berubah ke status "Konfirmasi Teknisi".

3 Konfirmasi Teknisi

- Teknisi mendapatkan informasi jadwal servis dan mengkonfirmasi pesanan lalu status berubah ke status "Pengecekan Unit".

4 Pengecekan Unit   

- Keterangan: Jadwal & Teknisi sudah fix. Teknisi bersiap jalan ke lokasi.
- Action: Teknisi datang ke lokasi customer.
- Action: Teknisi Mengecek Kerusakan dan mengkonfirmasi apakah servis yang ada di pesanan sesuai dengan kerusakan unit AC. 
- Action: Teknisi menyesuaikan servis yang di butuhkan dengan kerusakan, dan menambah barang yang diperlukan dari inventori.
- setelah selesai pengecekan, teknisi mengkonfirmasi biaya servis dan status berubah ke status "Menunggu Persetujuan Customer".

5 Menunggu Persetujuan Customer (Crucial Step)

- Keterangan: Teknisi sudah input biaya. Sistem menunggu Customer klik "Setuju" atau "Tolak" di aplikasi.
- Action: Customer review & approval.
- jika customer setuju maka status berubah ke status "Sedang Dikerjakan".
- jika customer menolak maka status berubah ke status "Dibatalkan".

6 Sedang Dikerjakan

- Keterangan: Customer sudah Setuju . Teknisi mulai bekerja (bongkar/pasang/perbaikan).
- Action: Teknisi bekerja & upload foto bukti (Before/After).
- Action: Setelah teknisi selesai proses servis dan upload bukti maka status berubah ke status "Menunggu Pembayaran".
- Customer sudah bisa mulai bayar pelunasan di tahap ini 

7 Menunggu Pembayaran

- Keterangan: Invoice sudah keluar. Menunggu Customer transfer/bayar.
- Action: Customer melakukan pembayaran.
- jika customer sudah membayar maka status berubah ke status "Selesai (Garansi Aktif)".

8 Selesai (Garansi Aktif)

- Keterangan: Pembayaran lunas. Garansi mulai berjalan. Transaksi tutup.
- Action: Customer bisa klaim garansi jika ada masalah dalam periode tertentu.
- Dibatalkan

9 Dibatalkan

- Keterangan: Booking dibatalkan oleh Customer sebelum teknisi jalan, atau Customer Menolak biaya perbaikan di tahap 5 (hanya bayar biaya kunjungan)
