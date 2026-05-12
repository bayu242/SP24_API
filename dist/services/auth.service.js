// File: src/services/auth.service.ts
import prisma from "../lib/prisma.js";
import { verifyPassword } from "../utils/hash.util.js";
import { generateTokens } from "../utils/jwt.util.js";
import { verifyRefreshToken } from "../utils/jwt.util.js";
export const loginAdminService = async (data) => {
    // 1. Cari admin berdasarkan username di database
    const admin = await prisma.administrator.findUnique({
        where: { username: data.username },
    });
    // 2. Jika admin tidak ditemukan
    if (!admin) {
        throw new Error("Username atau password salah.");
    }
    // 3. Verifikasi apakah password yang diinput cocok dengan hash di database
    const isPasswordValid = await verifyPassword(data.password, admin.password);
    if (!isPasswordValid) {
        throw new Error("Username atau password salah.");
    }
    // 4. Jika cocok, buatkan Token.
    // Ingat payload kita butuh 'id' dan 'role' (sesuai TokenPayload di jwt.util.ts)
    const tokens = generateTokens({
        id: admin.admin_id,
        role: "ADMIN",
    });
    // 5. Simpan Refresh Token ke database agar bisa digunakan untuk validasi sesi
    await prisma.administrator.update({
        where: { admin_id: admin.admin_id },
        data: { refresh_token: tokens.refreshToken },
    });
    // 6. Kembalikan data yang aman (tanpa password) beserta tokennya
    const { password, ...safeAdminData } = admin;
    return {
        admin: safeAdminData,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
    };
};
export const teacherLoginService = async (data) => {
    // 1. Cari guru berdasarkan username di database
    const teacher = await prisma.teacher.findUnique({
        where: { username: data.username },
    });
    // 2. Jika guru tidak ditemukan (Pesan error disamarkan demi keamanan)
    if (!teacher) {
        throw new Error("Username atau password salah.");
    }
    // 3. Verifikasi apakah password yang diinput cocok dengan hash di database
    const isPasswordValid = await verifyPassword(data.password, teacher.password);
    if (!isPasswordValid) {
        throw new Error("Username atau password salah.");
    }
    // 4. Jika cocok, buatkan Token.
    const tokens = generateTokens({
        id: teacher.teacher_id,
        role: "TEACHER",
    });
    // 5. Simpan Refresh Token ke database agar bisa digunakan untuk validasi sesi
    await prisma.teacher.update({
        where: { teacher_id: teacher.teacher_id },
        data: { refresh_token: tokens.refreshToken },
    });
    // 6. Kembalikan data yang aman (tanpa password) beserta tokennya
    const { password, refresh_token, ...safeTeacherData } = teacher;
    return {
        teacher: safeTeacherData,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
    };
};
export const refreshTokenService = async (refreshTokenFromClient) => {
    try {
        // 1. Verifikasi payload token
        const decodedPayload = verifyRefreshToken(refreshTokenFromClient);
        let userData = null;
        // 2. Cek Role untuk menentukan tabel database
        if (decodedPayload.role === "ADMIN") {
            userData = await prisma.administrator.findUnique({
                where: { admin_id: decodedPayload.id },
            });
        }
        else if (decodedPayload.role === "TEACHER") {
            userData = await prisma.teacher.findUnique({
                where: { teacher_id: decodedPayload.id },
            });
        }
        // 3. Validasi: User ditemukan dan token di DB cocok
        if (!userData || userData.refresh_token !== refreshTokenFromClient) {
            throw new Error("Refresh token tidak valid atau sesi telah berakhir.");
        }
        // 4. Buat pasangan token baru (Rotasi Token)
        const newTokens = generateTokens({
            id: decodedPayload.role === "ADMIN"
                ? userData.admin_id
                : userData.teacher_id,
            role: decodedPayload.role, // Gunakan role yang sama dari payload sebelumnya
        });
        // 5. Update Refresh Token baru ke tabel yang sesuai
        if (decodedPayload.role === "ADMIN") {
            await prisma.administrator.update({
                where: { admin_id: userData.admin_id },
                data: { refresh_token: newTokens.refreshToken },
            });
        }
        else if (decodedPayload.role === "TEACHER") {
            await prisma.teacher.update({
                where: { teacher_id: userData.teacher_id },
                data: { refresh_token: newTokens.refreshToken },
            });
        }
        return {
            accessToken: newTokens.accessToken,
            refreshToken: newTokens.refreshToken,
        };
    }
    catch (error) {
        throw new Error("Sesi kedaluwarsa. Silakan login kembali.");
    }
};
