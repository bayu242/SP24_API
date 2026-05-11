// File: src/middlewares/upload.middleware.ts
import multer from "multer";
// 1. Gunakan memoryStorage agar file tidak langsung ditulis ke hard disk,
// melainkan disimpan sebagai Buffer di RAM. Ini lebih cepat dan aman,
// apalagi jika nanti kita mau mengirimnya ke Cloud Storage (seperti AWS S3)
// atau menyimpannya sebagai Uint8Array di database.
const storage = multer.memoryStorage();
// 2. Filter hanya untuk file gambar
const fileFilter = (req, file, cb) => {
    const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true); // Izinkan
    }
    else {
        cb(new Error("Format file tidak didukung. Hanya JPEG, PNG, dan WebP yang diizinkan.")); // Tolak
    }
};
// 3. Konfigurasi akhir Multer
export const uploadImage = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // Batas maksimal 5 MB
    },
    fileFilter: fileFilter,
});
