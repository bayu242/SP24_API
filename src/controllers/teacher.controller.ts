// File: src/controllers/teacher.controller.ts
import { Request, Response } from "express";
import { createTeacherService } from "../services/teacher.service.js";

import {
  getTeachersService,
  getTeacherByIdService,
  updateTeacherService,
  deleteTeacherService,
} from "../services/teacher.service.js";

import { uploadTeacherImageService } from "../services/teacher.service.js";

export const createTeacher = async (req: Request, res: Response) => {
  try {
    // 1. Ambil data dari body request
    const teacherData = req.body;

    // 2. Panggil service untuk menyimpan data
    const teacher = await createTeacherService(teacherData);

    // 3. Hapus data sensitif sebelum dikirim kembali sebagai respons (PENTING!)
    const { password, images, refresh_token, ...safeTeacherData } = teacher;

    // 4. Kirim respons sukses (Status 201: Created)
    res.status(201).json({
      success: true,
      message: "Data guru berhasil ditambahkan",
      data: safeTeacherData,
    });
  } catch (error: any) {
    // 5. Tangani jika ada error (misal: username sudah ada)
    res.status(400).json({
      success: false,
      message: error.message || "Gagal menambahkan guru",
    });
  }
};

export const getTeachers = async (req: Request, res: Response) => {
  try {
    const teachers = await getTeachersService();
    res.status(200).json({ success: true, data: teachers });
  } catch (error: any) {
    res
      .status(500)
      .json({ success: false, message: "Gagal mengambil data guru" });
  }
};

export const getTeacherById = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    const teacher = await getTeacherByIdService(id);
    res.status(200).json({ success: true, data: teacher });
  } catch (error: any) {
    res.status(404).json({ success: false, message: error.message });
  }
};

export const updateTeacher = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    const updateData = req.body;
    const teacher = await updateTeacherService(id, updateData);
    res.status(200).json({
      success: true,
      message: "Data guru berhasil diubah",
      data: teacher,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteTeacher = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    await deleteTeacherService(id);
    res
      .status(200)
      .json({ success: true, message: "Data guru berhasil dihapus" });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const uploadPhoto = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);

    // Middleware multer akan menyisipkan file ke dalam req.file
    if (!req.file) {
      res.status(400).json({
        success: false,
        message: "Tidak ada file foto yang diunggah.",
      });
      return;
    }

    // Ambil Buffer dari file yang diunggah
    const imageBuffer = req.file.buffer;

    const data = await uploadTeacherImageService(id, imageBuffer);

    res.status(200).json({
      success: true,
      message: "Foto profil berhasil diunggah dan disimpan.",
      data: data,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};
