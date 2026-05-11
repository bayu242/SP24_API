import * as studentService from "../services/student.service.js";
export const createStudent = async (req, res) => {
    try {
        const student = await studentService.createStudentService(req.body);
        res.status(201).json({ success: true, data: student });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
export const getStudents = async (req, res) => {
    try {
        const students = await studentService.getAllStudentsService();
        res.status(200).json({ success: true, data: students });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
export const updateStudent = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const updated = await studentService.updateStudentService(id, req.body);
        res.status(200).json({ success: true, data: updated });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
export const deleteStudent = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        await studentService.deleteStudentService(id);
        res
            .status(200)
            .json({ success: true, message: "Data siswa berhasil dihapus" });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
import { uploadStudentImageService } from "../services/student.service.js";
export const uploadStudentPhoto = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
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
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
