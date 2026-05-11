import { Router } from "express";
import {
  tapAttendance,
  checkParentPortal,
} from "../controllers/presence.controller.js";
import { verifyToken, isAdmin } from "../middlewares/auth.middleware.js";

const router = Router();

// 1. Endpoint untuk Mesin Absensi / Aplikasi Guru (Membutuhkan Auth Admin/Guru)
router.post("/tap", verifyToken, tapAttendance);

// 2. Endpoint Portal Orang Tua (Public/Tanpa Auth, hanya butuh NIS)
router.get("/parent/:nis", checkParentPortal);

export default router;
