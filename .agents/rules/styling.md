---
trigger: always_on
---

only use pnpm
Alur Utama Project : E:\Project\Merge\tiamac-mysql-api-v2\tiamac-api-v2\.gemini\rules\alur.md
referensi : E:\Project\Merge\tiamac-mysql-api-v2\tiamac-api-v2\reference-nodejs
planning file : E:\Project\Merge\tiamac-mysql-api-v2\tiamac-api-v2\.gemini\rules\planning.md
styling file : E:\Project\Merge\tiamac-mysql-api-v2\tiamac-api-v2\.gemini\rules\styling.md
shadcn-ui sebagai acuan style


saat pembuatan panel gunakan admin panel theme sebagai acuan style
project ini adalah proses pembaharusan frontend dari project referensi semua logika backend tetap dipertahankan


# 🎨 UI DESIGN GUIDELINES

* Logo project : E:\Project\Merge\tiamac-mysql-api-v2\tiamac-api-v2\public\images\logo.png
* Gunakan warna hijau muda sebagai warna utama
* Design system berbasis shadcn/ui
* Setiap pembuatan alert gunakan style floating seperti yang ada pada page /booking
* Clean modern dashboard
* Card-based layout
* Tabel interaktif
* Notifikasi real-time
* semua tampilan list table, gunakan pagination
* Gunakan Plus Jakarta Sans sebagai font utama
* untuk setiap pembuatan tampilan pop up detail servis gunakan tampilan yang ada pada " dashboard/jadwal-saya"
* pembuatan page panel admin atau teknisi, gunakan /dashboard/tugas sebagai acuan layout seperti  breadcrumb, padding, card, dan style lainnya
* UUID untuk service ID gunakan format Hex (#XXXXXXXX upper case) sebagai tampilan Frontend. untuk di level databasenya tetap pake format UUID (seperti d935dc90-6d74-496f-ba2a-03f4398b31a7)

Warna:

* Hijau muda → Primary
* Biru → Selesai
* Oranye → Proses
* Merah → Urgent/Batal

# 🎨 SEARCH COMPONENT 

* Untuk panduan pembuatan search component (search bar, filter) bisa mengikuti yang sudah jadi di page "/customer-panel/pesanan?tab=ongoing"

