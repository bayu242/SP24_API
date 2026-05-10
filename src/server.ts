// File: src/server.ts
// Wajib pakai .js di akhir untuk modul ESNext
import app from "./app.js";
import prisma from "./lib/prisma.js";
import { syncAdminWithEnv } from "./utils/init-admin.utils.js";

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // 1. Tes koneksi database terlebih dahulu
    await prisma.$connect();
    console.log("✅ Berhasil terhubung ke database MySQL");

    // 2. Jalankan sinkronisasi Admin dari .env
    await syncAdminWithEnv();

    // 3. Jika database sukses, jalankan server API
    app.listen(PORT, () => {
      console.log(`🚀 Server API berjalan di http://localhost:${PORT}`);
    });
  } catch (error) {
    // 4. Jika gagal, tampilkan pesan dan matikan proses
    console.error("❌ Gagal terhubung ke database atau server:", error);
    await prisma.$disconnect();
    process.exit(1);
  }
};

// Eksekusi fungsi utama
startServer();
