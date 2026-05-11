// File: src/routes/student.routes.ts
import { Router } from "express";
import { createStudent, getStudents, updateStudent, deleteStudent, uploadStudentPhoto, // Import controller baru
 } from "../controllers/student.controller.js";
import { verifyToken, isAdmin } from "../middlewares/auth.middleware.js";
import { uploadImage } from "../middlewares/uploadImage.middleware.js"; // Gunakan middleware upload yang sudah ada
const router = Router();
// Middleware global untuk rute ini (Wajib Login & Admin)
router.use(verifyToken, isAdmin);
router.get("/", getStudents);
router.post("/", createStudent);
router.put("/:id", updateStudent);
router.delete("/:id", deleteStudent);
// Endpoint khusus upload foto siswa
// Pastikan di Postman key-nya adalah 'photo'
router.post("/:id/photo", uploadImage.single("photo"), uploadStudentPhoto);
export default router;
