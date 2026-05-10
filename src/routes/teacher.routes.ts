// File: src/routes/teacher.routes.ts
import { Router } from "express";
import {
  createTeacher,
  getTeachers,
  getTeacherById,
  updateTeacher,
  deleteTeacher,
} from "../controllers/teacher.controller.js";
import { verifyToken, isAdmin } from "../middlewares/auth.middleware.js";

const router = Router();

// Semua rute ini hanya bisa diakses oleh ADMIN
router.post("/", verifyToken, isAdmin, createTeacher);
router.get("/", verifyToken, isAdmin, getTeachers);
router.get("/:id", verifyToken, isAdmin, getTeacherById);
router.put("/:id", verifyToken, isAdmin, updateTeacher);
router.delete("/:id", verifyToken, isAdmin, deleteTeacher);

export default router;
