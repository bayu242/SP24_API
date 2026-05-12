import { Request, Response } from "express";
import * as studentService from "../services/student.service.js";

export const getStudentById = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);

    if (isNaN(id)) {
      res
        .status(400)
        .json({ success: false, message: "ID harus berupa angka!" });
      return;
    }

    const student = await studentService.getStudentByIdService(id);

    res.status(200).json({
      success: true,
      message: "Data siswa berhasil ditemukan",
      data: student,
    });
  } catch (error: any) {
    res.status(404).json({ success: false, message: error.message });
  }
};

export const createStudent = async (req: Request, res: Response) => {
  try {
    const student = await studentService.createStudentService(req.body);
    res.status(201).json({ success: true, data: student });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getStudents = async (req: Request, res: Response) => {
  try {
    const students = await studentService.getAllStudentsService();
    res.status(200).json({ success: true, data: students });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateStudent = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    const updated = await studentService.updateStudentService(id, req.body);
    res.status(200).json({ success: true, data: updated });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteStudent = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    await studentService.deleteStudentService(id);
    res
      .status(200)
      .json({ success: true, message: "Data siswa berhasil dihapus" });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

import { uploadStudentImageService } from "../services/student.service.js";

export const uploadStudentPhoto = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);

    if (!req.file) {
      res.status(400).json({
        success: false,
        message: "Tidak ada file foto yang diunggah.",
      });
      return;
    }

    const imageBuffer = req.file.buffer;
    const student = await uploadStudentImageService(id, imageBuffer);

    res.status(200).json({
      success: true,
      message: "Foto siswa berhasil diunggah.",
      data: student,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};
