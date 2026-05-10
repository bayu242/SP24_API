// File: src/services/auth.service.ts
import prisma from "../lib/prisma.js";
import { verifyPassword } from "../utils/hash.util.js";
import { generateTokens } from "../utils/jwt.util.js";
import { LoginDTO } from "../interfaces/auth.intefaces.js";
import { verifyRefreshToken } from "../utils/jwt.util.js";

export const loginAdminService = async (data: LoginDTO) => {
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

export const refreshTokenService = async (refreshTokenFromClient: string) => {
  try {
    // 1. Verifikasi apakah Refresh Token masih valid dan belum kedaluwarsa secara kriptografi
    const decodedPayload = verifyRefreshToken(refreshTokenFromClient);

    // 2. Cek ke database apakah token ini memang terdaftar untuk Admin tersebut
    // (Berjaga-jaga jika token sudah di-revoke atau admin sudah logout)
    const admin = await prisma.administrator.findUnique({
      where: { admin_id: decodedPayload.id },
    });

    if (!admin || admin.refresh_token !== refreshTokenFromClient) {
      throw new Error("Refresh token tidak valid atau sesi telah berakhir.");
    }

    // 3. Jika valid, buatkan sepasang token yang baru (Rotasi Token untuk keamanan ekstra)
    const newTokens = generateTokens({
      id: admin.admin_id,
      role: "ADMIN",
    });

    // 4. Update database dengan Refresh Token yang baru
    await prisma.administrator.update({
      where: { admin_id: admin.admin_id },
      data: { refresh_token: newTokens.refreshToken },
    });

    return {
      accessToken: newTokens.accessToken,
      refreshToken: newTokens.refreshToken,
    };
  } catch (error) {
    throw new Error("Sesi kedaluwarsa. Silakan login kembali.");
  }
};
