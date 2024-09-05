# Medicine Management Backend

Proyek ini adalah backend untuk sistem manajemen obat yang dibangun menggunakan Express.js dengan struktur mirip Laravel.

## Fitur Utama

1. **Autentikasi**

   - Registrasi pengguna baru
   - Login pengguna
   - Lupa password
   - Reset password

2. **Manajemen Obat**

   - Melihat daftar obat
   - Menambah obat baru
   - Melihat detail obat
   - Mengupdate informasi obat
   - Menghapus obat

3. **Manajemen Pengguna**

   - Membuat pengguna baru
   - Melihat daftar pengguna
   - Melihat detail pengguna
   - Mengupdate informasi pengguna
   - Mengubah password
   - Mengupdate username
   - Mengupdate email
   - Mengupdate peran pengguna

4. **Manajemen Supplier**

   - Menambah supplier baru
   - Melihat daftar supplier
   - Melihat detail supplier
   - Mengupdate informasi supplier
   - Menghapus supplier

5. **Manajemen Pembelian**

   - Membuat pembelian baru
   - Melihat daftar pembelian
   - Melihat detail pembelian
   - Mengupdate informasi pembelian
   - Menghapus pembelian

6. **Manajemen Penjualan**

   - Membuat penjualan baru
   - Melihat daftar penjualan
   - Melihat detail penjualan
   - Mengupdate informasi penjualan
   - Menghapus penjualan

7. **Dashboard**

   - Melihat informasi ringkasan (home)

8. **Laporan**
   - Menghasilkan laporan keuntungan
   - Menghasilkan laporan inventaris
   - Menghasilkan laporan obat kadaluarsa
   - Menghasilkan laporan penjualan

## Struktur Proyek

```
medicine-BE/
│
├── config/                 # Konfigurasi aplikasi
├── controllers/            # Logic bisnis
├── data/                   # Data statis atau sementara
├── docs/                   # Dokumentasi tambahan
├── middleware/             # Middleware Express
├── migrations/             # Migrasi database
├── models/                 # Model Sequelize
├── routes/                 # Definisi rute API
├── seeder/                 # Seeder database
├── utils/                  # Fungsi utilitas
├── .env                    # Variabel lingkungan
├── .gitignore              # File yang diabaikan Git
├── app.js                  # Entry point aplikasi
├── package.json            # Dependensi dan skrip
└── README.md               # Dokumentasi proyek
```

## Instalasi

1. Clone repositori ini
2. Jalankan `npm install` untuk menginstall dependensi
3. Salin `.env.example` ke `.env` dan sesuaikan konfigurasi
4. Jalankan migrasi database dengan `npm run migrate`
5. (Opsional) Jalankan seeder dengan `npm run seed`
6. Mulai server dengan `npm start`

## Penggunaan API

API ini menggunakan autentikasi bearer token JWT. Untuk mengakses endpoint yang dilindungi, sertakan token di header Authorization:

```
Authorization: Bearer <your_token_here>
```

Untuk dokumentasi lengkap API, lihat file OpenAPI/Swagger di folder `docs/`.

## Kontribusi

Silakan buat issue atau pull request untuk kontribusi pada proyek ini.

## Lisensi

[MIT License](https://opensource.org/licenses/MIT)
