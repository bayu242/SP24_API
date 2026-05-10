import express, { Application, Request, Response } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import teacherRoutes from "./routes/teacher.routes.js";
import authRoutes from "./routes/auth.routes.js";

// 1. Inisialisasi variabel environment dari .env
dotenv.config();

const app: Application = express();

// 2. Middleware Global
app.use(cors()); // Mengizinkan akses dari domain lain
app.use(express.json()); // Mem-parsing body request berformat JSON
app.use(cookieParser());

// 3. Route Dasar (Health Check) untuk memastikan API menyala
app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "API Absensi Sekolah berjalan dengan baik!",
  });
});

// routes

app.use("/api/teachers", teacherRoutes);
app.use("/api/auth", authRoutes);

// 4. Middleware Error Handling Global (Menangkap error dari seluruh rute)
app.use((err: any, req: Request, res: Response, next: any) => {
  console.error("Terjadi Error:", err.message);
  res.status(500).json({
    success: false,
    message: "Terjadi kesalahan pada server internal.",
  });
});

export default app;
