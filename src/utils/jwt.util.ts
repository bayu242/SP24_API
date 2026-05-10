// File: src/utils/jwt.util.ts
import jwt from "jsonwebtoken";

// Tipe data untuk isi (payload) yang akan disimpan di dalam Token
export interface TokenPayload {
  id: number;
  role: "ADMIN" | "TEACHER";
}

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || "default_access";
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "default_refresh";

/**
 * Membuat Access Token dan Refresh Token sekaligus.
 * @param payload - Data user (id dan role) yang ingin dimasukkan ke token.
 */
export const generateTokens = (payload: TokenPayload) => {
  // Access token berumur pendek (contoh: 15 menit)
  const accessToken = jwt.sign(payload, ACCESS_SECRET, { expiresIn: "15m" });

  // Refresh token berumur panjang (contoh: 7 hari)
  const refreshToken = jwt.sign(payload, REFRESH_SECRET, { expiresIn: "7d" });

  return { accessToken, refreshToken };
};

/**
 * Memverifikasi keaslian Access Token.
 * Akan melemparkan error jika token kedaluwarsa atau tidak valid.
 */
export const verifyAccessToken = (token: string): TokenPayload => {
  // jwt.verify akan otomatis mengecek masa aktif dan keaslian token
  return jwt.verify(token, ACCESS_SECRET) as TokenPayload;
};

/**
 * Memverifikasi keaslian Refresh Token.
 */
export const verifyRefreshToken = (token: string): TokenPayload => {
  return jwt.verify(token, REFRESH_SECRET) as TokenPayload;
};
