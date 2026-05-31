# Product Requirements Document

## RescueFood — Platform Distribusi Surplus Makanan

## 1. Ringkasan Produk

**RescueFood** adalah platform yang menghubungkan penyedia makanan surplus, seperti restoran, bakery, katering, kantin, dan toko makanan, dengan pembeli, relawan, atau organisasi penerima donasi. Platform ini bertujuan mengurangi limbah makanan dengan membuat makanan berlebih tetap dapat dimanfaatkan sebelum melewati batas konsumsi yang aman.

RescueFood bukan hanya aplikasi pemesanan makanan, tetapi sebuah **platform multi-sided** yang menyediakan infrastruktur, layanan, dan aturan main bagi berbagai pihak untuk menciptakan nilai: merchant dapat mengurangi kerugian, pengguna mendapat makanan dengan harga lebih murah, dan organisasi sosial dapat menerima donasi makanan.

---

## 2. Latar Belakang dan Problem Statement

Banyak bisnis makanan menghasilkan surplus harian akibat prediksi permintaan yang tidak selalu akurat. Makanan tersebut sering kali masih layak konsumsi, tetapi akhirnya dibuang karena tidak ada kanal distribusi cepat, terstruktur, dan terpercaya.

Di sisi lain, terdapat pengguna yang membutuhkan makanan terjangkau serta komunitas atau organisasi sosial yang dapat menyalurkan makanan kepada pihak yang membutuhkan. Masalah utamanya adalah belum adanya platform yang menghubungkan pihak-pihak tersebut secara real-time dengan mekanisme transaksi, validasi, dan pengambilan yang jelas.

**Masalah utama yang ingin diselesaikan:**

1. Merchant tidak memiliki sistem mudah untuk mempublikasikan makanan surplus secara cepat.
2. Pengguna sulit mengetahui makanan surplus yang tersedia di sekitar mereka.
3. Organisasi sosial tidak memiliki kanal terstruktur untuk menerima atau mengambil donasi makanan.
4. Tidak ada sistem trust yang memastikan makanan, merchant, dan transaksi dapat dipercaya.
5. Pengelolaan pickup, status pesanan, dan bukti pengambilan masih manual.

---

## 3. Tujuan Produk

Tujuan utama RescueFood adalah membangun platform yang memungkinkan distribusi makanan surplus secara cepat, aman, dan terukur.

**Tujuan spesifik:**

1. Menyediakan tempat bagi merchant untuk mengunggah makanan surplus.
2. Memungkinkan pengguna membeli atau mengklaim makanan surplus.
3. Memungkinkan organisasi sosial menerima makanan donasi.
4. Menyediakan sistem booking dan pickup yang jelas.
5. Menyediakan sistem governance untuk menjaga keamanan, validasi, dan kepercayaan.
6. Memberikan insentif agar merchant dan pengguna terus memakai platform.

---

## 4. Target Pengguna

### 4.1 Merchant

Pihak yang memiliki makanan surplus dan ingin menjual dengan harga diskon atau mendonasikannya.

Contoh:

* Restoran
* Bakery
* Katering
* Kantin
* Coffee shop
* Toko makanan

### 4.2 Customer

Pengguna umum yang ingin membeli makanan surplus dengan harga lebih murah.

### 4.3 Charity / Organization

Organisasi, komunitas, atau relawan yang dapat mengambil makanan donasi untuk disalurkan.

### 4.4 Admin Platform

Pihak pengelola RescueFood yang memverifikasi merchant, memantau transaksi, menangani laporan, dan menjaga kualitas ekosistem.

---

## 5. Value Proposition

### Untuk Merchant

* Mengurangi makanan terbuang.
* Mendapat tambahan pendapatan dari stok yang hampir tidak terjual.
* Meningkatkan citra bisnis sebagai brand ramah lingkungan.
* Mendapat laporan dampak, seperti jumlah makanan terselamatkan.

### Untuk Customer

* Mendapat makanan dengan harga lebih murah.
* Bisa melihat makanan surplus terdekat.
* Bisa mengetahui batas waktu pengambilan dan informasi makanan dengan jelas.

### Untuk Charity / Organization

* Mendapat akses makanan donasi dari merchant.
* Bisa mengatur jadwal pickup.
* Mendapat bukti transaksi dan histori donasi.

### Untuk Platform

* Membangun ekosistem berkelanjutan antara merchant, customer, dan organisasi sosial.
* Memiliki potensi monetisasi melalui komisi, subscription merchant, dan fitur promosi.

---

## 6. Ruang Lingkup Produk

### 6.1 In Scope — Versi MVP

Fitur yang akan dikembangkan pada versi awal:

1. Registrasi dan login user.
2. Role user: Customer, Merchant, Charity, Admin.
3. Merchant dapat membuat listing makanan surplus.
4. Customer dapat melihat, mencari, dan memesan makanan surplus.
5. Charity dapat mengklaim makanan donasi.
6. Sistem status order: Pending, Confirmed, Ready for Pickup, Completed, Cancelled.
7. QR code atau kode pickup sederhana.
8. Rating dan review untuk merchant.
9. Dashboard merchant.
10. Dashboard admin untuk verifikasi dan monitoring.
11. Riwayat transaksi.
12. Laporan sederhana jumlah makanan terselamatkan.

### 6.2 Out of Scope — Tidak Dibangun pada MVP

Fitur yang tidak menjadi prioritas awal:

1. Pembayaran online asli.
2. Integrasi kurir pihak ketiga.
3. Sistem rekomendasi berbasis machine learning.
4. Prediksi stok makanan otomatis.
5. Integrasi IoT atau smart fridge.
6. Multi-city deployment skala besar.
7. Refund otomatis.

---

## 7. Core Interaction

Core interaction RescueFood adalah **pertukaran nilai antara merchant sebagai penyedia makanan surplus dan customer/charity sebagai penerima makanan**.

### Alur utama untuk pembelian makanan surplus

1. Merchant login ke dashboard.
2. Merchant membuat listing makanan surplus.
3. Merchant mengisi nama makanan, foto, jumlah stok, harga diskon, batas waktu konsumsi, dan waktu pickup.
4. Customer membuka halaman marketplace.
5. Customer mencari makanan berdasarkan lokasi, kategori, harga, atau waktu pickup.
6. Customer memilih item dan membuat order.
7. Sistem mengurangi stok sementara.
8. Merchant mengonfirmasi order.
9. Customer datang mengambil makanan.
10. Customer menunjukkan QR code atau kode pickup.
11. Merchant memvalidasi pickup.
12. Order berubah menjadi Completed.
13. Customer dapat memberi rating dan review.

### Alur utama untuk donasi makanan

1. Merchant memilih mode listing sebagai donasi.
2. Charity melihat daftar makanan donasi.
3. Charity mengajukan klaim.
4. Merchant menyetujui klaim.
5. Charity mengambil makanan sesuai jadwal.
6. Merchant memvalidasi pickup.
7. Sistem mencatat dampak donasi.

---

## 8. Kebutuhan Fungsional

## 8.1 Authentication & Authorization

### Deskripsi

Sistem harus mendukung login dan registrasi untuk beberapa jenis role.

### Requirement

* User dapat registrasi sebagai Customer, Merchant, atau Charity.
* Admin dibuat melalui seed data atau akses khusus.
* User dapat login menggunakan email dan password.
* Sistem menggunakan token/session untuk autentikasi.
* Setiap role memiliki akses berbeda.

### Role Access

| Role     | Akses                                                                 |
| -------- | --------------------------------------------------------------------- |
| Customer | Melihat listing, membuat order, melihat riwayat, memberi review       |
| Merchant | Membuat listing, mengelola stok, mengonfirmasi order, validasi pickup |
| Charity  | Melihat listing donasi, klaim donasi, melihat riwayat pickup          |
| Admin    | Verifikasi merchant, melihat semua data, menangani laporan            |

---

## 8.2 Merchant Verification

### Deskripsi

Merchant harus diverifikasi agar listing yang muncul di platform lebih terpercaya.

### Requirement

* Merchant dapat mengisi data bisnis.
* Merchant mengunggah dokumen sederhana atau informasi validasi.
* Admin dapat menyetujui atau menolak merchant.
* Merchant yang belum diverifikasi tidak dapat mempublikasikan listing.
* Status merchant terdiri dari Pending, Verified, dan Rejected.

---

## 8.3 Food Surplus Listing

### Deskripsi

Merchant dapat membuat listing makanan surplus.

### Requirement

Merchant dapat mengisi:

* Nama makanan
* Deskripsi
* Kategori makanan
* Foto makanan
* Harga normal
* Harga diskon
* Jumlah stok
* Mode: jual atau donasi
* Lokasi pickup
* Waktu pickup
* Batas konsumsi
* Informasi alergen
* Status listing

### Listing Status

* Draft
* Active
* Sold Out
* Expired
* Removed

---

## 8.4 Marketplace Discovery

### Deskripsi

Customer dan Charity dapat menemukan makanan surplus yang tersedia.

### Requirement

* User dapat melihat daftar makanan.
* User dapat mencari berdasarkan keyword.
* User dapat filter berdasarkan kategori, lokasi, harga, mode jual/donasi, dan waktu pickup.
* Listing yang expired tidak ditampilkan.
* Listing sold out tidak dapat dipesan.
* Customer hanya dapat memesan listing mode jual.
* Charity hanya dapat mengklaim listing mode donasi.

---

## 8.5 Order Management

### Deskripsi

Customer dapat membuat order untuk makanan surplus.

### Requirement

* Customer memilih listing.
* Customer memasukkan jumlah item.
* Sistem mengecek ketersediaan stok.
* Sistem membuat order dengan status Pending atau Confirmed.
* Merchant dapat menerima atau membatalkan order.
* Customer dapat melihat detail order.
* Merchant dapat melihat daftar order masuk.

### Order Status

* Pending
* Confirmed
* Ready for Pickup
* Completed
* Cancelled
* Expired

---

## 8.6 Donation Claim Management

### Deskripsi

Charity dapat mengklaim makanan donasi dari merchant.

### Requirement

* Charity memilih listing donasi.
* Charity mengajukan klaim.
* Merchant dapat menyetujui atau menolak klaim.
* Jika disetujui, sistem membuat pickup code.
* Charity mengambil makanan sesuai jadwal.
* Merchant memvalidasi pickup.

---

## 8.7 Pickup Validation

### Deskripsi

Sistem harus memastikan makanan diberikan kepada penerima yang benar.

### Requirement

* Setiap order atau klaim donasi memiliki pickup code unik.
* Customer atau charity menunjukkan kode kepada merchant.
* Merchant memasukkan kode atau melakukan scan QR.
* Jika kode valid, status berubah menjadi Completed.
* Jika kode tidak valid, sistem menolak validasi.

---

## 8.8 Rating & Review

### Deskripsi

Customer dapat memberikan ulasan setelah transaksi selesai.

### Requirement

* Review hanya dapat dibuat untuk order Completed.
* Customer memberi rating 1–5.
* Customer dapat menulis komentar.
* Rating merchant dihitung dari rata-rata rating.
* Admin dapat menghapus review yang melanggar aturan.

---

## 8.9 Impact Dashboard

### Deskripsi

Platform menampilkan dampak penggunaan RescueFood.

### Requirement

Dashboard dapat menampilkan:

* Jumlah makanan terselamatkan.
* Estimasi porsi makanan.
* Jumlah transaksi selesai.
* Jumlah donasi selesai.
* Merchant paling aktif.
* Customer atau charity paling aktif.

---

## 8.10 Admin Dashboard

### Deskripsi

Admin mengelola governance dan trust platform.

### Requirement

Admin dapat:

* Melihat daftar user.
* Melihat daftar merchant.
* Memverifikasi merchant.
* Melihat semua listing.
* Melihat semua order.
* Melihat laporan pengguna.
* Menonaktifkan listing bermasalah.
* Menonaktifkan akun bermasalah.

---

## 9. Kebutuhan Non-Fungsional

### 9.1 Performance

* Halaman marketplace harus dapat dimuat dalam waktu kurang dari 3 detik untuk data normal.
* API utama seperti login, listing, dan order harus memberikan response cepat.
* Sistem harus mampu menangani banyak listing tanpa perubahan arsitektur besar.

### 9.2 Security

* Password harus disimpan dalam bentuk hashed.
* API dilindungi dengan token/session.
* Role-based access control wajib diterapkan.
* User tidak boleh mengakses data milik user lain tanpa izin.
* Input dari user harus divalidasi.

### 9.3 Reliability

* Order tidak boleh dibuat jika stok tidak cukup.
* Listing expired tidak boleh dipesan.
* Pickup code harus unik.
* Status order harus konsisten.

### 9.4 Usability

* Merchant harus bisa membuat listing dalam waktu singkat.
* Customer harus bisa menemukan makanan dengan mudah.
* Charity harus bisa membedakan listing donasi dan listing berbayar.
* Admin dashboard harus sederhana dan mudah dipahami.

### 9.5 Maintainability

* Frontend, backend, dan database harus dipisahkan.
* Business logic diletakkan di service layer.
* API dibuat modular agar dapat digunakan oleh web, mobile, atau sistem lain di masa depan.

---

## 10. Platform Architecture

## 10.1 High-Level Architecture

RescueFood menggunakan arsitektur tiga lapisan:

1. **Interface Layer**

   * Web app untuk customer, merchant, charity, dan admin.
   * Berfungsi sebagai tampilan dan tempat interaksi pengguna.

2. **Service Layer**

   * API backend.
   * Menangani authentication, listing, order, donation, review, dan admin service.
   * Business logic tidak diletakkan langsung di frontend.

3. **Infrastructure Layer**

   * Database relasional.
   * File storage untuk foto makanan dan dokumen merchant.
   * Optional: external storage service seperti Cloudinary atau Supabase Storage.

---

## 10.2 Service Layer Modules

### Auth Service

Mengelola registrasi, login, session/token, dan role user.

### User Service

Mengelola profil customer, merchant, charity, dan admin.

### Merchant Service

Mengelola data bisnis, status verifikasi, dan profil merchant.

### Listing Service

Mengelola pembuatan, pembaruan, pencarian, dan penghapusan listing makanan.

### Order Service

Mengelola transaksi pembelian makanan surplus.

### Donation Service

Mengelola klaim makanan donasi oleh charity.

### Pickup Service

Mengelola kode pickup dan validasi pengambilan makanan.

### Review Service

Mengelola rating dan ulasan.

### Impact Service

Menghitung jumlah makanan terselamatkan dan statistik platform.

### Admin Service

Mengelola verifikasi, moderasi, dan monitoring aktivitas platform.

---

## 11. Data Model Awal

## 11.1 Users

| Field         | Type     | Keterangan                         |
| ------------- | -------- | ---------------------------------- |
| id            | UUID     | ID user                            |
| name          | String   | Nama user                          |
| email         | String   | Email                              |
| password_hash | String   | Password terenkripsi               |
| role          | Enum     | CUSTOMER, MERCHANT, CHARITY, ADMIN |
| status        | Enum     | ACTIVE, SUSPENDED                  |
| created_at    | DateTime | Tanggal dibuat                     |

---

## 11.2 Merchants

| Field               | Type   | Keterangan                  |
| ------------------- | ------ | --------------------------- |
| id                  | UUID   | ID merchant                 |
| user_id             | UUID   | Relasi ke users             |
| business_name       | String | Nama bisnis                 |
| address             | Text   | Alamat                      |
| phone               | String | Nomor telepon               |
| verification_status | Enum   | PENDING, VERIFIED, REJECTED |
| average_rating      | Float  | Rata-rata rating            |

---

## 11.3 Charities

| Field               | Type   | Keterangan                  |
| ------------------- | ------ | --------------------------- |
| id                  | UUID   | ID charity                  |
| user_id             | UUID   | Relasi ke users             |
| organization_name   | String | Nama organisasi             |
| address             | Text   | Alamat                      |
| verification_status | Enum   | PENDING, VERIFIED, REJECTED |

---

## 11.4 Food Listings

| Field             | Type     | Keterangan                                |
| ----------------- | -------- | ----------------------------------------- |
| id                | UUID     | ID listing                                |
| merchant_id       | UUID     | Pemilik listing                           |
| title             | String   | Nama makanan                              |
| description       | Text     | Deskripsi                                 |
| category          | String   | Kategori                                  |
| image_url         | String   | Foto makanan                              |
| original_price    | Integer  | Harga normal                              |
| discounted_price  | Integer  | Harga diskon                              |
| quantity          | Integer  | Stok                                      |
| mode              | Enum     | SALE, DONATION                            |
| pickup_location   | Text     | Lokasi pickup                             |
| pickup_start_time | DateTime | Awal pickup                               |
| pickup_end_time   | DateTime | Akhir pickup                              |
| consume_before    | DateTime | Batas konsumsi                            |
| allergen_info     | Text     | Info alergen                              |
| status            | Enum     | DRAFT, ACTIVE, SOLD_OUT, EXPIRED, REMOVED |

---

## 11.5 Orders

| Field       | Type     | Keterangan                                                          |
| ----------- | -------- | ------------------------------------------------------------------- |
| id          | UUID     | ID order                                                            |
| customer_id | UUID     | Pembeli                                                             |
| listing_id  | UUID     | Listing                                                             |
| merchant_id | UUID     | Merchant                                                            |
| quantity    | Integer  | Jumlah pesanan                                                      |
| total_price | Integer  | Total harga                                                         |
| status      | Enum     | PENDING, CONFIRMED, READY_FOR_PICKUP, COMPLETED, CANCELLED, EXPIRED |
| pickup_code | String   | Kode pickup                                                         |
| created_at  | DateTime | Tanggal order                                                       |

---

## 11.6 Donation Claims

| Field       | Type     | Keterangan                                          |
| ----------- | -------- | --------------------------------------------------- |
| id          | UUID     | ID klaim                                            |
| charity_id  | UUID     | Organisasi pengambil                                |
| listing_id  | UUID     | Listing donasi                                      |
| merchant_id | UUID     | Merchant                                            |
| quantity    | Integer  | Jumlah klaim                                        |
| status      | Enum     | REQUESTED, APPROVED, REJECTED, COMPLETED, CANCELLED |
| pickup_code | String   | Kode pickup                                         |
| created_at  | DateTime | Tanggal klaim                                       |

---

## 11.7 Reviews

| Field       | Type     | Keterangan     |
| ----------- | -------- | -------------- |
| id          | UUID     | ID review      |
| order_id    | UUID     | Relasi order   |
| customer_id | UUID     | Pemberi review |
| merchant_id | UUID     | Merchant       |
| rating      | Integer  | Rating 1–5     |
| comment     | Text     | Komentar       |
| created_at  | DateTime | Tanggal review |

---

## 12. API Endpoint Awal

## 12.1 Auth

| Method | Endpoint       | Deskripsi                   |
| ------ | -------------- | --------------------------- |
| POST   | /auth/register | Registrasi user             |
| POST   | /auth/login    | Login user                  |
| POST   | /auth/logout   | Logout user                 |
| GET    | /auth/me       | Mendapatkan data user login |

---

## 12.2 Listings

| Method | Endpoint               | Deskripsi                   |
| ------ | ---------------------- | --------------------------- |
| GET    | /listings              | Melihat semua listing aktif |
| GET    | /listings/:id          | Detail listing              |
| POST   | /merchant/listings     | Merchant membuat listing    |
| PATCH  | /merchant/listings/:id | Merchant mengubah listing   |
| DELETE | /merchant/listings/:id | Merchant menghapus listing  |

---

## 12.3 Orders

| Method | Endpoint                    | Deskripsi                       |
| ------ | --------------------------- | ------------------------------- |
| POST   | /orders                     | Customer membuat order          |
| GET    | /orders/my                  | Customer melihat order miliknya |
| GET    | /merchant/orders            | Merchant melihat order masuk    |
| PATCH  | /merchant/orders/:id/status | Merchant mengubah status order  |
| POST   | /pickup/validate            | Validasi pickup code            |

---

## 12.4 Donations

| Method | Endpoint                             | Deskripsi                      |
| ------ | ------------------------------------ | ------------------------------ |
| GET    | /donations                           | Charity melihat listing donasi |
| POST   | /donations/:listingId/claim          | Charity klaim donasi           |
| GET    | /charity/claims                      | Charity melihat klaim miliknya |
| PATCH  | /merchant/donation-claims/:id/status | Merchant approve/reject klaim  |

---

## 12.5 Reviews

| Method | Endpoint               | Deskripsi               |
| ------ | ---------------------- | ----------------------- |
| POST   | /reviews               | Membuat review          |
| GET    | /merchants/:id/reviews | Melihat review merchant |

---

## 12.6 Admin

| Method | Endpoint                     | Deskripsi               |
| ------ | ---------------------------- | ----------------------- |
| GET    | /admin/users                 | Melihat daftar user     |
| GET    | /admin/merchants             | Melihat daftar merchant |
| PATCH  | /admin/merchants/:id/verify  | Verifikasi merchant     |
| GET    | /admin/listings              | Melihat semua listing   |
| PATCH  | /admin/listings/:id/moderate | Moderasi listing        |
| GET    | /admin/orders                | Melihat semua order     |

---

## 13. Governance & Trust

Governance & Trust adalah bagian penting dari RescueFood karena platform melibatkan makanan, transaksi, dan kepercayaan antar pengguna.

### Mekanisme governance:

1. **Role-Based Access Control**

   * Customer, merchant, charity, dan admin memiliki akses berbeda.

2. **Merchant Verification**

   * Merchant harus diverifikasi sebelum dapat mempublikasikan listing.

3. **Charity Verification**

   * Charity diverifikasi agar donasi tidak disalahgunakan.

4. **Pickup Code**

   * Setiap transaksi memiliki kode unik untuk mencegah pengambilan oleh pihak yang salah.

5. **Listing Expiration**

   * Listing otomatis tidak aktif jika melewati batas pickup atau batas konsumsi.

6. **Review System**

   * Customer dapat memberi rating untuk merchant setelah transaksi selesai.

7. **Admin Moderation**

   * Admin dapat menghapus listing, menangguhkan akun, dan menangani laporan.

8. **Food Safety Disclaimer**

   * Merchant wajib mengisi batas konsumsi, informasi alergen, dan waktu pickup.

---

## 14. Ecosystem Incentives

Agar platform berkelanjutan, RescueFood memberikan insentif kepada semua pihak.

### Untuk Merchant

* Badge “Food Saver Merchant”.
* Statistik makanan terselamatkan.
* Ranking merchant berdasarkan rating dan kontribusi.
* Promosi listing untuk merchant aktif.
* Potensi subscription untuk fitur analytics lanjutan.

### Untuk Customer

* Poin setiap transaksi selesai.
* Badge “Food Saver”.
* Riwayat kontribusi pengurangan food waste.
* Diskon atau voucher simulasi.

### Untuk Charity

* Akses prioritas untuk listing donasi tertentu.
* Dashboard jumlah makanan yang berhasil disalurkan.
* Badge organisasi aktif.

### Untuk Platform

* Komisi kecil dari transaksi.
* Paket langganan merchant.
* Fitur promosi listing.
* Data insight agregat untuk laporan sustainability.

---

## 15. User Flow

## 15.1 User Flow Customer

1. Customer registrasi atau login.
2. Customer membuka marketplace.
3. Customer mencari makanan.
4. Customer membuka detail listing.
5. Customer membuat order.
6. Customer menerima pickup code.
7. Customer datang ke lokasi merchant.
8. Merchant memvalidasi kode.
9. Order selesai.
10. Customer memberi review.

---

## 15.2 User Flow Merchant

1. Merchant registrasi.
2. Merchant mengisi profil bisnis.
3. Admin memverifikasi merchant.
4. Merchant membuat listing makanan surplus.
5. Merchant menerima order atau klaim donasi.
6. Merchant menyiapkan makanan.
7. Merchant memvalidasi pickup.
8. Merchant melihat statistik transaksi dan dampak.

---

## 15.3 User Flow Charity

1. Charity registrasi.
2. Charity mengisi profil organisasi.
3. Admin memverifikasi charity.
4. Charity melihat listing donasi.
5. Charity mengajukan klaim.
6. Merchant menyetujui klaim.
7. Charity mengambil makanan.
8. Sistem mencatat donasi selesai.

---

## 15.4 User Flow Admin

1. Admin login.
2. Admin melihat daftar merchant dan charity pending.
3. Admin memverifikasi atau menolak pendaftaran.
4. Admin memantau listing dan order.
5. Admin menangani laporan.
6. Admin melihat impact dashboard.

---

## 16. Acceptance Criteria

### 16.1 Authentication

* User dapat registrasi dan login.
* User mendapatkan role sesuai saat registrasi.
* User tidak dapat mengakses endpoint yang bukan haknya.

### 16.2 Merchant Listing

* Merchant verified dapat membuat listing.
* Merchant unverified tidak dapat membuat listing aktif.
* Listing aktif muncul di marketplace.
* Listing expired tidak muncul di marketplace.

### 16.3 Order

* Customer dapat membuat order jika stok tersedia.
* Stok berkurang setelah order dibuat.
* Customer mendapat pickup code.
* Merchant dapat menyelesaikan order dengan pickup code valid.

### 16.4 Donation

* Charity dapat melihat listing donasi.
* Charity dapat mengajukan klaim.
* Merchant dapat approve atau reject klaim.
* Klaim selesai setelah pickup divalidasi.

### 16.5 Review

* Customer hanya dapat memberi review setelah order completed.
* Rating merchant berubah setelah review masuk.

### 16.6 Admin

* Admin dapat memverifikasi merchant.
* Admin dapat melihat semua transaksi.
* Admin dapat menonaktifkan listing bermasalah.

---

## 17. MVP Prioritization

### Must Have

* Login dan register
* Role-based access
* Merchant verification
* CRUD listing makanan
* Marketplace listing
* Order makanan
* Klaim donasi
* Pickup code
* Admin dashboard basic
* Riwayat transaksi

### Should Have

* Rating dan review
* Impact dashboard
* Filter pencarian
* Upload foto makanan
* Status expired otomatis

### Could Have

* Leaderboard food saver
* Voucher simulasi
* Map view
* Notification
* Report system

### Won’t Have for MVP

* Payment gateway asli
* Delivery tracking
* Machine learning recommendation
* Mobile app native
* Integrasi kurir

---

## 18. Metrik Keberhasilan

Metrik keberhasilan RescueFood dapat diukur melalui:

1. Jumlah merchant terdaftar.
2. Jumlah merchant verified.
3. Jumlah listing aktif.
4. Jumlah order completed.
5. Jumlah klaim donasi completed.
6. Jumlah makanan terselamatkan.
7. Rata-rata rating merchant.
8. Persentase order yang berhasil diambil.
9. Jumlah pengguna aktif.
10. Jumlah transaksi berulang.

---

## 19. Risiko dan Mitigasi

| Risiko                       | Dampak                     | Mitigasi                                               |
| ---------------------------- | -------------------------- | ------------------------------------------------------ |
| Makanan tidak layak konsumsi | Kepercayaan turun          | Merchant wajib mengisi consume before dan info makanan |
| User tidak mengambil pesanan | Stok terbuang              | Pickup time limit dan status expired                   |
| Merchant palsu               | Penipuan                   | Merchant verification oleh admin                       |
| Klaim donasi disalahgunakan  | Donasi tidak tepat sasaran | Charity verification                                   |
| Stok tidak sinkron           | Order gagal                | Validasi stok saat order dibuat                        |
| Review palsu                 | Rating tidak akurat        | Review hanya untuk order completed                     |

---

## 20. Tech Stack Rekomendasi

### Frontend

* React.js atau Next.js
* Tailwind CSS
* Axios atau Fetch API

### Backend

* Node.js dengan Express.js atau NestJS
* REST API

### Database

* PostgreSQL atau MySQL

### Authentication

* JWT-based authentication
* Password hashing menggunakan bcrypt

### File Storage

* Cloudinary, Supabase Storage, atau local storage untuk MVP

### Deployment

* Frontend: Vercel atau Netlify
* Backend: Render, Railway, atau VPS
* Database: Supabase, Neon, Railway PostgreSQL, atau PlanetScale jika memakai MySQL

---

## 21. Skenario Demo untuk Video

### Demo 1 — Merchant Membuat Listing

1. Login sebagai merchant.
2. Membuka dashboard merchant.
3. Membuat listing “Paket Roti Sore”.
4. Mengisi stok, harga diskon, waktu pickup, dan batas konsumsi.
5. Listing muncul di marketplace.

### Demo 2 — Customer Membeli Makanan

1. Login sebagai customer.
2. Melihat marketplace.
3. Memilih “Paket Roti Sore”.
4. Membuat order.
5. Mendapat pickup code.

### Demo 3 — Merchant Validasi Pickup

1. Login sebagai merchant.
2. Membuka daftar order.
3. Memasukkan pickup code customer.
4. Status order berubah menjadi Completed.

### Demo 4 — Charity Mengklaim Donasi

1. Login sebagai charity.
2. Melihat listing donasi.
3. Mengajukan klaim.
4. Merchant menyetujui klaim.
5. Charity mendapat pickup code.

### Demo 5 — Admin Governance

1. Login sebagai admin.
2. Melihat merchant pending verification.
3. Memverifikasi merchant.
4. Melihat semua transaksi dan listing.
5. Menonaktifkan listing bermasalah.

---

## 22. Kesimpulan

RescueFood adalah platform distribusi makanan surplus yang mempertemukan merchant, customer, charity, dan admin dalam satu ekosistem. Platform ini memiliki core interaction yang jelas, yaitu distribusi makanan surplus melalui mekanisme order dan klaim donasi. RescueFood juga memiliki infrastructure layer berupa database dan file storage, service layer modular berupa API untuk listing, order, donation, pickup, review, dan admin, serta governance system melalui role-based access, verifikasi merchant, pickup code, dan moderasi admin.

Dengan insentif berupa badge, rating, poin, laporan dampak, dan peluang monetisasi merchant, RescueFood dapat menjadi platform yang berkelanjutan dan relevan untuk menyelesaikan masalah food waste.
