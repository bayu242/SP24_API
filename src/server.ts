// File: src/server.ts
import app from "./app.js";
import prisma from "./lib/prisma.js";
import http from "http";
import { Server } from "socket.io";
import { syncAdminWithEnv } from "./utils/init-admin.utils.js";

const PORT = process.env.PORT || 3000;

// 1. Inisialisasi HTTP Server
const server = http.createServer(app);

// 2. Konfigurasi Socket.io
const io = new Server(server, {
  cors: {
    origin: "*", // Di produksi, ganti dengan domain frontend kamu
    methods: ["GET", "POST"],
  },
});

// Fungsi helper untuk membuat 6 digit angka acak
const generateUniqueCode = () => {
  let code;
  do {
    code = Math.floor(100000 + Math.random() * 900000).toString();
  } while (activePairingCodes.has(code)); // Ulangi jika kebetulan kodenya sudah ada yang pakai
  return code;
};

// === DEKLARASI DATABASE SEMENTARA (GLOBAL SCOPE) ===
// Pastikan ketiga variabel ini berada di LUAR io.on("connection")
const activePairingCodes = new Set<string>();
const socketToCode = new Map<string, string>();
const lastProcessedTags = new Map<string, { tagId: string; time: number }>();

/**
 * LOGIKA WEBSOCKET
 */
io.on("connection", (socket) => {
  console.log(`🔌 Device connected: ${socket.id}`);
  // Server mengirim sinyal sapaan ke HP yang baru terhubung
  socket.emit("server-ready", { status: "OK", message: "Server siap!" });
  // 1. WebApp meminta kode pairing
  socket.on("request-pairing-code", () => {
    const newCode = generateUniqueCode(); // Pastikan fungsi ini sudah ada di atas

    activePairingCodes.add(newCode);
    socket.join(newCode);

    // Simpan ke Map agar saat WebApp disconnect bisa dihapus
    socketToCode.set(socket.id, newCode);

    socket.emit("pairing-code-generated", newCode);
    console.log(`🎟️ Kode [${newCode}] aktif untuk WebApp [${socket.id}]`);
  });

  // 2. Android melakukan verifikasi status pairing
  socket.on("check-pairing-code", (code: string) => {
    if (activePairingCodes.has(code)) {
      socket.emit("pairing-verified", { success: true });
      // Beritahu WebApp di room tersebut bahwa Android sudah terhubung
      io.to(code).emit("device-connected", { socketId: socket.id });
      console.log(`✅ Verifikasi sukses: Kode ${code} (Android: ${socket.id})`);
    } else {
      socket.emit("pairing-verified", { success: false });
      console.log(`❌ Verifikasi gagal: Kode ${code} tidak valid`);
    }
  });

  // 3. Android mengirim tag (Dengan proteksi Debounce / Double-Scan)
  socket.on(
    "android-send-tag",
    (data: { pairingCode: string; tagId: string }) => {
      const { pairingCode, tagId } = data;
      const now = Date.now();
      const lastEntry = lastProcessedTags.get(socket.id);

      // Mencegah pengiriman ganda: Abaikan jika TagID sama & selisih waktu < 1.5 detik
      if (
        lastEntry &&
        lastEntry.tagId === tagId &&
        now - lastEntry.time < 1500
      ) {
        return;
      }

      if (activePairingCodes.has(pairingCode)) {
        // Catat waktu scan untuk keperluan debounce berikutnya
        lastProcessedTags.set(socket.id, { tagId, time: now });

        io.to(pairingCode).emit("nfc-received", {
          tagId,
          timestamp: new Date().toISOString(),
        });
        console.log(`📲 NFC Bridge: Tag [${tagId}] -> Room [${pairingCode}]`);
      } else {
        socket.emit("pairing-error", "Kode tidak valid atau sudah kadaluarsa!");
      }
    },
  );

  // 4. Cleanup saat ada perangkat (Android/WebApp) yang terputus
  socket.on("disconnect", () => {
    // A. Cleanup jika yang terputus adalah WebApp
    if (socketToCode.has(socket.id)) {
      const codeToDelete = socketToCode.get(socket.id);
      if (codeToDelete) {
        activePairingCodes.delete(codeToDelete);
        console.log(`🗑️ WebApp ditutup. Kode [${codeToDelete}] dihapus.`);
      }
      socketToCode.delete(socket.id);
    }

    // B. Cleanup jika yang terputus adalah Android (Hapus histori debounce)
    if (lastProcessedTags.has(socket.id)) {
      lastProcessedTags.delete(socket.id);
    }

    console.log(`❌ Device disconnected: ${socket.id}`);
  });
});

/**
 * START ENGINE
 */
const startServer = async () => {
  try {
    // Jalankan database & sinkronisasi admin sebelum server listen
    await prisma.$connect();
    console.log("✅ Berhasil terhubung ke database MySQL");

    await syncAdminWithEnv();

    // Gunakan server.listen (Express + Socket.io)
    server.listen(PORT, () => {
      console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
      console.log(
        `⚡ WebSocket Bridge Active: Ready for Android-to-Web NFC pairing`,
      );
    });
  } catch (error) {
    console.error("❌ Critical Error during startup:", error);
    await prisma.$disconnect();
    process.exit(1);
  }
};

startServer();
