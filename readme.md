📝 Aturan Penamaan (Naming Convention)
File: kebab-case dengan dot notation (nama-fitur.jenis.ts).

Contoh: teacher.controller.ts, auth.middleware.ts.

Class/Interface/Model: PascalCase.

Variable/Function: camelCase.

Import: Wajib menggunakan ekstensi .js (Syarat ESM mode) meskipun file aslinya .ts.

🔄 Workflow & Fitur Saat Ini
Admin Provisioning: - Admin disinkronisasi otomatis dari .env (ADMIN_USERNAME, ADMIN_PASSWORD) setiap kali server menyala via syncAdminWithEnv().

Admin tidak bisa diubah via API, hanya via .env.

Security:

Password disimpan menggunakan hash bcryptjs.

Sistem Token ganda (JWT): Access Token (umur pendek, tidak di DB) & Refresh Token (umur panjang, disimpan di DB).

Teacher Management:

Admin dapat menambahkan Guru via POST /api/teachers.

Logika pemisahan data sensitif (password/token) menggunakan Object Destructuring.

🚀 Perintah Terminal (Scripts)
npm run dev: Menjalankan server dalam mode pengembangan (auto-reload via tsx watch).

npm run build: Kompilasi TypeScript ke JavaScript (/dist).

npm start: Menjalankan server hasil build.

npx prisma migrate dev: Menjalankan migrasi database jika ada perubahan di schema.prisma.

📍 Langkah Selanjutnya (To-Do)
[ ] Implementasi auth.middleware.ts untuk melindungi rute Admin.

[ ] Implementasi Login Controller untuk Admin & Teacher.

[ ] Implementasi Student CRUD (Hanya Admin).

[ ] Implementasi Presence Scan Logic (Logic untuk RFID/Student tap).
# SP24_API
# SP24_API
