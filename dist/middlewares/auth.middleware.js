import { verifyAccessToken } from "../utils/jwt.util.js";
/**
 * Middleware untuk memverifikasi JWT Access Token
 */
export const verifyToken = (req, res, next) => {
    // 1. Ambil token dari header 'Authorization'
    const authHeader = req.headers.authorization;
    // 2. Cek apakah formatnya 'Bearer <token>'
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({
            success: false,
            message: "Akses ditolak. Token tidak ditemukan atau format salah.",
        });
        return; // Hentikan proses jika tidak ada token
    }
    // 3. Pisahkan kata 'Bearer' dan ambil token aslinya
    const token = authHeader.split(" ")[1];
    try {
        // 4. Verifikasi token menggunakan utilitas yang kita buat sebelumnya
        const decoded = verifyAccessToken(token);
        // 5. Simpan data user ke dalam request agar bisa dibaca oleh Controller nanti
        req.user = decoded;
        // 6. Persilakan masuk (Lanjut ke proses berikutnya)
        next();
    }
    catch (error) {
        res.status(401).json({
            success: false,
            message: "Akses ditolak. Token tidak valid atau sudah kedaluwarsa.",
        });
    }
};
/**
 * Middleware untuk memastikan user adalah Administrator
 * WAJIB diletakkan setelah verifyToken
 */
export const isAdmin = (req, res, next) => {
    // Cek role yang tersimpan di req.user (hasil dari verifyToken)
    if (!req.user || req.user.role !== "ADMIN") {
        res.status(403).json({
            success: false,
            message: "Akses terlarang. Hanya Administrator yang diizinkan.",
        });
        return;
    }
    // Jika dia ADMIN, persilakan masuk
    next();
};
