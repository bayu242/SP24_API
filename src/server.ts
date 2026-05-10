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

/**
 * LOGIKA WEBSOCKET PAIRING (Android -> Server -> WebApp)
 */
io.on("connection", (socket) => {
  console.log(`🔌 Connection established: ${socket.id}`);

  // Langkah 1: WebApp atau Android masuk ke 'Room' berdasarkan 6 digit pairing code
  socket.on("join-pairing", (pairingCode: string) => {
    if (!pairingCode) return;
    socket.join(pairingCode);
    console.log(
      `📡 Device ${socket.id} is now listening/sending to Room: ${pairingCode}`,
    );
  });

  // Langkah 2: Android mengirim tag_id (Hanya lewat, tidak simpan ke DB)
  socket.on(
    "android-send-tag",
    (data: { pairingCode: string; tagId: string }) => {
      const { pairingCode, tagId } = data;

      if (pairingCode && tagId) {
        // Teruskan data ke WebApp yang berada di room yang sama
        io.to(pairingCode).emit("nfc-received", {
          tagId: tagId,
          timestamp: new Date().toISOString(),
        });

        console.log(
          `📲 NFC Bridge: Tag [${tagId}] forwarded to WebApp in Room [${pairingCode}]`,
        );
      }
    },
  );

  socket.on("disconnect", () => {
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
