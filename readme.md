# **Dokumentasi Pengembangan: REST API Sistem Presensi**

Dokumentasi ini berisi ringkasan teknis, konfigurasi, dan alur kerja pengembangan proyek REST API Sistem Presensi menggunakan Node.js, TypeScript, dan Prisma 7\.

## **1\. Gambaran Umum Proyek**

Sistem ini dirancang untuk mengelola absensi sekolah dengan tiga level akses utama:

- **Administrator:** Memiliki akses penuh untuk manajemen data Guru dan Siswa (CRUD). Kredensial admin dikelola melalui file environment (.env).
- **Teacher (Guru):** Dapat login untuk melihat dashboard absensi. Akun dibuat oleh Administrator.
- **Student (Siswa):** Tidak memiliki akun login. Absensi dilakukan melalui sistem pemindaian (misal: RFID/Tag ID).

## **2\. Tech Stack & Konfigurasi**

Proyek ini menggunakan teknologi modern untuk memastikan performa dan skalabilitas:

| Kategori           | Teknologi / Library   |
| :----------------- | :-------------------- |
| Runtime            | Node.js (v20+)        |
| Language           | TypeScript (Mode ESM) |
| Database           | MySQL                 |
| ORM                | Prisma 7              |
| Development Runner | tsx (watch mode)      |

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

- **src/config/:** Variabel lingkungan dan pengaturan global.
- **src/lib/:** Inisialisasi singleton seperti prisma.ts.
- **src/services/:** Logika bisnis dan query database.
- **src/controllers/:** Penangan request dan response HTTP.
- **src/routes/:** Definisi jalur endpoint API.
- **src/utils/:** Fungsi bantuan reusable (Hashing, JWT).
- **src/middlewares/:** Logika keamanan dan validasi (Satpam jalur).

## **4\. Keamanan & Autentikasi**

Sistem keamanan dibangun dengan standar industri:

- **Password Hashing:** Menggunakan bcryptjs untuk mengenkripsi password sebelum disimpan ke database.
- **JWT (JSON Web Token):**
  - **Access Token:** Digunakan untuk otorisasi setiap request, berumur pendek (15 menit), tidak disimpan di database.
  - **Refresh Token:** Digunakan untuk mendapatkan access token baru, berumur panjang (7 hari), disimpan di database untuk fitur logout/revoke.
- **Admin Provisioning:** Sinkronisasi otomatis kredensial admin dari file .env ke database setiap kali server dijalankan.

## **5\. Skema Database (Prisma 7\)**

Prisma 7 memisahkan konfigurasi migrasi dan runtime. URL koneksi untuk migrasi diletakkan di prisma.config.ts di root proyek.

### **Contoh Model Utama:**

- **Teacher:** Menggunakan @@map("teachers") untuk penamaan tabel jamak di MySQL namun tetap tunggal di kode program.
- **Relation:** Relasi One-to-Many antara Guru/Siswa dengan tabel Presensi.

## **6\. Perintah Kerja (Scripts)**

Otomatisasi dijalankan melalui package.json:

- npm run dev: Menjalankan server pengembangan dengan auto-reload (tsx watch).
- npm run build: Mengompilasi TypeScript ke JavaScript untuk produksi.
- npm start: Menjalankan aplikasi hasil kompilasi.
- npx prisma migrate dev: Melakukan migrasi database.

---

_Dokumentasi ini diperbarui secara berkala seiring dengan perkembangan progres pengembangan API._
