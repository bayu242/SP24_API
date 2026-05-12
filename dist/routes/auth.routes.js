// File: src/routes/auth.routes.ts
import { Router } from "express";
import { loginAdmin, getNewAccessToken, loginTeacher, } from "../controllers/auth.controller.js";
const router = Router();
// Rute PUBLIK untuk login Admin
router.post("/admin/login", loginAdmin);
router.post("/teacher/login", loginTeacher);
// Route untuk meminta access token baru (Tidak pakai middleware karena access token lama sudah mati)
router.post("/refresh-token", getNewAccessToken);
export default router;
