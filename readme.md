# **Dokumentasi Pengembangan: REST API Sistem Presensi**

Dokumentasi ini berisi ringkasan teknis, konfigurasi, dan alur kerja pengembangan proyek REST API Sistem Presensi menggunakan Node.js, TypeScript, dan Prisma 7\.

## **1\. Gambaran Umum Proyek**

Sistem ini dirancang untuk mengelola absensi sekolah dengan tiga level akses utama:

* **Administrator:** Memiliki akses penuh untuk manajemen data Guru dan Siswa (CRUD). Kredensial admin dikelola melalui file environment (.env).  
* **Teacher (Guru):** Dapat login untuk melihat dashboard absensi. Akun dibuat oleh Administrator.  
* **Student (Siswa):** Tidak memiliki akun login. Absensi dilakukan melalui sistem pemindaian (misal: RFID/Tag ID).

## **2\. Tech Stack & Konfigurasi**

Proyek ini menggunakan teknologi modern untuk memastikan performa dan skalabilitas:

| Kategori | Teknologi / Library |
| :---- | :---- |
| Runtime | Node.js (v20+) |
| Language | TypeScript (Mode ESM) |
| Database | MySQL |
| ORM | Prisma 7 |
| Development Runner | tsx (watch mode) |

### **Konfigurasi TypeScript (tsconfig.json)**

`{`  
  `"compilerOptions": {`  
    `"module": "ESNext",`  
    `"moduleResolution": "bundler",`  
    `"target": "ES2023",`  
    `"strict": true,`  
    `"esModuleInterop": true,`  
    `"types": ["node"],`  
    `"outDir": "./dist",`  
    `"rootDir": "./src",`  
    `"forceConsistentCasingInFileNames": true`  
  `}`  
`}`

## **3\. Struktur Folder**

Menggunakan arsitektur bersih untuk memisahkan tanggung jawab setiap komponen:

* **src/config/:** Variabel lingkungan dan pengaturan global.  
* **src/lib/:** Inisialisasi singleton seperti prisma.ts.  
* **src/services/:** Logika bisnis dan query database.  
* **src/controllers/:** Penangan request dan response HTTP.  
* **src/routes/:** Definisi jalur endpoint API.  
* **src/utils/:** Fungsi bantuan reusable (Hashing, JWT).  
* **src/middlewares/:** Logika keamanan dan validasi (Satpam jalur).

## **4\. Keamanan & Autentikasi**

Sistem keamanan dibangun dengan standar industri:

* **Password Hashing:** Menggunakan bcryptjs untuk mengenkripsi password sebelum disimpan ke database.  
* **JWT (JSON Web Token):**  
  * **Access Token:** Digunakan untuk otorisasi setiap request, berumur pendek (15 menit), tidak disimpan di database.  
  * **Refresh Token:** Digunakan untuk mendapatkan access token baru, berumur panjang (7 hari), disimpan di database untuk fitur logout/revoke.  
* **Multi-Role JWT:** Endpoint refresh token otomatis mengidentifikasi role (ADMIN atau TEACHER) berdasarkan payload token dan merotasi token dengan aman ke tabel database yang sesuai.

## **5\. Skema Database (Prisma 7\)**

Prisma 7 memisahkan konfigurasi migrasi dan runtime. URL koneksi untuk migrasi diletakkan di prisma.config.ts di root proyek.

### **Contoh Model Utama:**

* **Teacher:** Menggunakan @@map("teachers") untuk penamaan tabel jamak di MySQL namun tetap tunggal di kode program. Ditambah kolom refresh\_token untuk sesi login.  
* **Relation:** Relasi One-to-Many antara Guru/Siswa dengan tabel Presensi.

## **6\. Perintah Kerja (Scripts)**

Otomatisasi dijalankan melalui package.json:

* npm run dev: Menjalankan server pengembangan dengan auto-reload (tsx watch).  
* npm run build: Mengompilasi TypeScript ke JavaScript untuk produksi.  
* npm start: Menjalankan aplikasi hasil kompilasi.  
* npx prisma migrate dev: Melakukan migrasi database.

## **7\. Daftar Endpoint API (Update Terkini)**

Berikut adalah daftar lengkap seluruh Endpoint REST API dan WebSocket yang tersedia dalam sistem SP24 NFC Reader:

### **1\. Modul Auth (Otentikasi)**

* **POST /api/auth/login**  
  * **Fungsi:** Login untuk Admin atau Guru.  
  * **Body:** { "username": "...", "password": "..." } (Menggunakan LoginDTO).  
  * **Respons:** Mengembalikan profil pengguna, accessToken, dan refreshToken.  
* **POST /api/auth/refresh-token**  
  * **Fungsi:** Memperbarui akses token yang kedaluwarsa untuk sesi Admin maupun Teacher.  
  * **Body:** { "refreshToken": "..." }

### **2\. Modul Teacher (Manajemen Guru)**

Seluruh endpoint ini wajib membutuhkan Auth Admin (middleware isAdmin).

* **GET /api/teachers** \- Menampilkan semua daftar guru.  
* **POST /api/teachers** \- Menambahkan data guru baru.  
* **PUT /api/teachers/:id** \- Mengedit data guru.  
* **DELETE /api/teachers/:id** \- Menghapus data guru dari sistem.

### **3\. Modul Student (Manajemen Siswa & Kartu NFC)**

* **GET /api/students** \- Menampilkan semua data siswa beserta tag\_id NFC (Dapat diakses Admin & Teacher).  
* **GET /api/students/:id** \- Mengambil data profil lengkap 1 siswa spesifik beserta ringkasan 5 absensi terakhir (Dapat diakses Admin & Teacher).  
* **POST /api/students** \- Menyimpan siswa baru (Wajib Admin).  
* **PUT /api/students/:id** \- Mengedit data siswa (Wajib Admin).  
* **DELETE /api/students/:id** \- Menghapus data siswa (Wajib Admin).

### **4\. Modul Presence (Absensi)**

* **GET /api/presences**  
  * **Fungsi:** Mengambil semua rekapitulasi riwayat data absensi beserta relasi nama Siswa dan Guru.  
  * **Auth:** Wajib Token (Admin/Guru).  
* **POST /api/presences/tap**  
  * **Fungsi:** Mencatat absensi (Masuk/Pulang). *Dilengkapi dengan fitur **Anti Double-Tap** (jeda waktu minimal 1 jam untuk absen pulang).*  
  * **Auth:** Wajib Token (Admin/Guru).  
  * **Body:** { "tag\_id": "UID-KARTU", "teacher\_id": 1 }  
* **GET /api/presences/parent/:nis**  
  * **Fungsi:** Portal orang tua untuk melihat 30 riwayat absensi terakhir anaknya secara publik (Tanpa Token).

### **5\. Modul WebSocket (Jembatan Pendaftaran Kartu)**

* **Event Klien ke Server:** request-pairing-code, android-send-tag  
* **Event Server ke Klien:** pairing-code-generated, nfc-received, pairing-error

*Dokumen ini di-generate secara otomatis untuk mengakomodasi seluruh endpoint terbaru dan fitur cooldown/Anti Double-Tap presensi.*