import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes.js";
import teacherRoutes from "./routes/teacher.routes.js";
import studentRoutes from "./routes/student.routes.js";
import presenceRoutes from "./routes/presence.routes.js";
// 1. Inisialisasi variabel environment dari .env
dotenv.config();
const app = express();
// 2. Middleware Global
app.use(cors()); // Mengizinkan akses dari domain lain
app.use(express.json()); // Mem-parsing body request berformat JSON
app.use(cookieParser());
// 3. Route Dasar (Health Check) untuk memastikan API menyala
app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "API Absensi Sekolah berjalan dengan baik!",
    });
});
// routes
app.use("/api/auth", authRoutes);
app.use("/api/teachers", teacherRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/presences", presenceRoutes);
// 4. Middleware Error Handling Global (Menangkap error dari seluruh rute)
app.use((err, req, res, next) => {
    console.error("Terjadi Error:", err.message);
    res.status(500).json({
        success: false,
        message: "Terjadi kesalahan pada server internal.",
    });
});
export default app;
