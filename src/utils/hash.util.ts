// File: src/utils/hash.util.ts
import bcrypt from "bcryptjs";

/**
 * Mengubah password teks biasa menjadi hash yang aman.
 * @param plainPassword - Password asli dari input user.
 * @returns Password yang sudah di-hash.
 */
export const hashPassword = async (plainPassword: string): Promise<string> => {
  const saltRounds = 10; // Semakin tinggi semakin aman, tapi lebih lambat
  const salt = await bcrypt.genSalt(saltRounds);
  return await bcrypt.hash(plainPassword, salt);
};

/**
 * Membandingkan password teks biasa dengan hash di database.
 * @param plainPassword - Password dari input login.
 * @param hashedPassword - Password yang tersimpan di database.
 * @returns true jika cocok, false jika salah.
 */
export const verifyPassword = async (
  plainPassword: string,
  hashedPassword: string,
): Promise<boolean> => {
  return await bcrypt.compare(plainPassword, hashedPassword);
};
