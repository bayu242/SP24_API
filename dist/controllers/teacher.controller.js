import { createTeacherService } from "../services/teacher.service.js";
import { getTeachersService, getTeacherByIdService, updateTeacherService, deleteTeacherService, } from "../services/teacher.service.js";
import { uploadTeacherImageService } from "../services/teacher.service.js";
export const createTeacher = async (req, res) => {
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
    }
    catch (error) {
        // 5. Tangani jika ada error (misal: username sudah ada)
        res.status(400).json({
            success: false,
            message: error.message || "Gagal menambahkan guru",
        });
    }
};
export const getTeachers = async (req, res) => {
    try {
        const teachers = await getTeachersService();
        res.status(200).json({ success: true, data: teachers });
    }
    catch (error) {
        res
            .status(500)
            .json({ success: false, message: "Gagal mengambil data guru" });
    }
};
export const getTeacherById = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const teacher = await getTeacherByIdService(id);
        res.status(200).json({ success: true, data: teacher });
    }
    catch (error) {
        res.status(404).json({ success: false, message: error.message });
    }
};
export const updateTeacher = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const updateData = req.body;
        const teacher = await updateTeacherService(id, updateData);
        res.status(200).json({
            success: true,
            message: "Data guru berhasil diubah",
            data: teacher,
        });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
export const deleteTeacher = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        await deleteTeacherService(id);
        res
            .status(200)
            .json({ success: true, message: "Data guru berhasil dihapus" });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
export const uploadPhoto = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
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
        await uploadTeacherImageService(id, imageBuffer);
        res.status(200).json({
            success: true,
            message: "Foto profil berhasil diunggah dan disimpan.",
        });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
