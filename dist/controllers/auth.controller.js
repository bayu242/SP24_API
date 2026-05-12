import { loginAdminService, refreshTokenService, teacherLoginService, } from "../services/auth.service.js";
export const loginAdmin = async (req, res) => {
    try {
        const loginData = req.body;
        const result = await loginAdminService(loginData);
        // 1. Tanam Refresh Token ke dalam HTTP-Only Cookie
        res.cookie("refreshToken", result.refreshToken, {
            httpOnly: true, // Mencegah akses via JavaScript (Anti XSS)
            secure: process.env.NODE_ENV === "production", // True jika di production (wajib HTTPS)
            sameSite: "strict", // Mencegah pengiriman cookie dari situs lain (Anti CSRF)
            maxAge: 7 * 24 * 60 * 60 * 1000, // Umur 7 Hari (sesuaikan dengan jwt.util.ts)
        });
        // 2. Kirim respons HANYA dengan Access Token. Refresh Token disembunyikan.
        const { refresh_token, ...safeData } = result.admin;
        res.status(200).json({
            success: true,
            message: "Login Administrator berhasil",
            data: {
                admin: safeData,
                accessToken: result.accessToken,
            },
        });
    }
    catch (error) {
        res.status(401).json({ success: false, message: error.message });
    }
};
export const loginTeacher = async (req, res) => {
    try {
        const payload = req.body;
        if (!payload.username || !payload.password) {
            res.status(400).json({
                success: false,
                message: "Username dan password wajib diisi!",
            });
            return;
        }
        // Panggil service (sekarang cukup passing 'payload' secara utuh)
        const loginData = await teacherLoginService(payload);
        // 1. Tanam Refresh Token ke dalam HTTP-Only Cookie
        res.cookie("refreshToken", loginData.refreshToken, {
            httpOnly: true, // Mencegah akses via JavaScript (Anti XSS)
            secure: process.env.NODE_ENV === "production", // True jika di production (wajib HTTPS)
            sameSite: "strict", // Mencegah pengiriman cookie dari situs lain (Anti CSRF)
            maxAge: 7 * 24 * 60 * 60 * 1000, // Umur 7 Hari (sesuaikan dengan jwt.util.ts)
        });
        // 2. Kirim respons HANYA dengan Access Token. Refresh Token disembunyikan.
        const { refreshToken, ...safeData } = loginData;
        res.status(200).json({
            success: true,
            message: "Login berhasil",
            data: safeData,
        });
    }
    catch (error) {
        res.status(401).json({
            success: false,
            message: error.message,
        });
    }
};
export const getNewAccessToken = async (req, res) => {
    try {
        // Ambil Refresh Token dari Cookie, bukan dari body request lagi!
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            res.status(400).json({
                success: false,
                message: "Refresh token tidak ditemukan di cookie.",
            });
            return;
        }
        const newTokens = await refreshTokenService(refreshToken);
        // Update Cookie dengan Refresh Token yang baru hasil rotasi
        res.cookie("refreshToken", newTokens.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        res.status(200).json({
            success: true,
            message: "Token berhasil diperbarui",
            data: {
                accessToken: newTokens.accessToken, // Hanya kirim access token ke JSON
            },
        });
    }
    catch (error) {
        // Hapus cookie jika token kedaluwarsa atau tidak valid
        res.clearCookie("refreshToken");
        res.status(403).json({ success: false, message: error.message });
    }
};
