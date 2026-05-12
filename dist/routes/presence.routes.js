import { Router } from "express";
import { tapAttendance, checkParentPortal, getAllPresences, } from "../controllers/presence.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
const router = Router();
// 1. Endpoint untuk Mesin Absensi / Aplikasi Guru (Membutuhkan Auth Admin/Guru)
router.post("/tap", verifyToken, tapAttendance);
// 2. Endpoint Portal Orang Tua (Public/Tanpa Auth, hanya butuh NIS)
router.get("/parent/:nis", checkParentPortal);
// Ambil semua data absensi (Wajib Auth Admin/Guru)
router.get("/", verifyToken, getAllPresences);
export default router;
