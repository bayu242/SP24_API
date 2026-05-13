// File: src/routes/teacher.routes.ts
import { Router } from "express";
import {
  createTeacher,
  getTeachers,
  getTeacherById,
  updateTeacher,
  deleteTeacher,
  getPhoto,
} from "../controllers/teacher.controller.js";
import { verifyToken, isAdmin } from "../middlewares/auth.middleware.js";
import { uploadPhoto } from "../controllers/teacher.controller.js";
import { uploadImage } from "../middlewares/uploadImage.middleware.js";

const router = Router();

// Semua rute ini hanya bisa diakses oleh ADMIN
router.post("/", verifyToken, isAdmin, createTeacher);
router.get("/", verifyToken, isAdmin, getTeachers);
router.get("/:id", verifyToken, isAdmin, getTeacherById);
router.put("/:id", verifyToken, isAdmin, updateTeacher);
router.delete("/:id", verifyToken, isAdmin, deleteTeacher);
router.get("/:id/photo", getPhoto); // Publicly accessible or verifyToken if needed
router.post(
  "/:id/photo",
  verifyToken,
  isAdmin,
  uploadImage.single("photo"),
  uploadPhoto,
);

export default router;
