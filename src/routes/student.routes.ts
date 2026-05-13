import { Router } from "express";
import {
  getStudentById,
  createStudent,
  getStudents,
  updateStudent,
  deleteStudent,
  uploadStudentPhoto,
  getStudentPhoto,
} from "../controllers/student.controller.js";
import { verifyToken, isAdmin } from "../middlewares/auth.middleware.js";
import { uploadImage } from "../middlewares/uploadImage.middleware.js"; 

const router = Router();

// Endpoint khusus ambil foto siswa (Bisa diakses tanpa login agar mudah ditampilkan sebagai URL)
router.get("/:id/photo", getStudentPhoto);

// 1. Penjaga Gerbang Utama: SEMUA rute wajib Login (punya Token JWT)
router.use(verifyToken);

// ==========================================
// AKSES: ADMIN & TEACHER
// ==========================================
// Karena Teacher butuh melihat data, rute ini TIDAK dipasangi isAdmin
router.get("/", getStudents);
router.get("/:id", getStudentById);

// ==========================================
// AKSES: KHUSUS ADMIN SAJA
// ==========================================
router.post("/", isAdmin, createStudent);
router.put("/:id", isAdmin, updateStudent);
router.delete("/:id", isAdmin, deleteStudent);

// Endpoint khusus upload foto siswa
// Pastikan key-nya adalah 'photo'
router.post("/:id/photo", uploadImage.single("photo"), uploadStudentPhoto);

export default router;
