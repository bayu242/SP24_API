// File: src/utils/init-admin.util.ts
import prisma from "../lib/prisma.js";
import { hashPassword } from "./hash.util.js"; // Mengimpor fungsi utilitas kita
export const syncAdminWithEnv = async () => {
    const envUsername = process.env.ADMIN_USERNAME;
    const envPassword = process.env.ADMIN_PASSWORD;
    if (!envUsername || !envPassword) {
        console.warn("⚠️ Peringatan: ADMIN_USERNAME atau ADMIN_PASSWORD tidak ditemukan di .env.");
        return;
    }
    try {
        // Menggunakan fungsi reusable yang baru kita buat
        const hashedPassword = await hashPassword(envPassword);
        const existingAdmin = await prisma.administrator.findFirst();
        if (existingAdmin) {
            await prisma.administrator.update({
                where: { admin_id: existingAdmin.admin_id },
                data: {
                    username: envUsername,
                    password: hashedPassword,
                },
            });
            console.log("✅ Data Administrator berhasil disinkronisasi (Diperbarui).");
        }
        else {
            await prisma.administrator.create({
                data: {
                    username: envUsername,
                    password: hashedPassword,
                },
            });
            console.log("✅ Data Administrator berhasil disinkronisasi (Dibuat baru).");
        }
    }
    catch (error) {
        console.error("❌ Gagal melakukan sinkronisasi Administrator:", error);
    }
};
