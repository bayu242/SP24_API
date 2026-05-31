// File: src/services/teacher.service.ts
import prisma from "../lib/prisma.js";
import { hashPassword } from "../utils/hash.util.js";
import { CreateTeacherDTO } from "../interfaces/teacher.interface.js";
import { compressImage } from "../utils/imageCompressor.util.js";

export const createTeacherService = async (data: CreateTeacherDTO) => {
  // 1. Cek apakah username sudah dipakai oleh guru lain
  const existingTeacher = await prisma.teacher.findUnique({
    where: { username: data.username },
  });

  if (existingTeacher) {
    throw new Error("Username sudah digunakan. Silakan pilih username lain.");
  }

  // 2. Hash password sebelum disimpan
  const hashedPassword = await hashPassword(data.password);

  // 3. Simpan ke database
  const newTeacher = await prisma.teacher.create({
    data: {
      username: data.username,
      password: hashedPassword,
      first_name: data.first_name,
      last_name: data.last_name,
      gender: data.gender,
      age: data.age,
      // images dibiarkan kosong dulu, bisa diisi nanti saat ada fitur upload
    },
  });

  return newTeacher;
};

// Ambil Semua Guru
export const getTeachersService = async () => {
  return await prisma.teacher.findMany({
    select: {
      teacher_id: true,
      username: true,
      first_name: true,
      last_name: true,
      gender: true,
      age: true,
      images: true,
      // tidak men-select password dan refresh_token demi keamanan
    },
  });
};

// Ambil Guru Berdasarkan ID
export const getTeacherByIdService = async (id: number) => {
  const teacher = await prisma.teacher.findUnique({
    where: { teacher_id: id },
    select: {
      teacher_id: true,
      username: true,
      first_name: true,
      last_name: true,
      gender: true,
      age: true,
      images: true,
    },
  });

  if (!teacher) throw new Error("Data guru tidak ditemukan");
  return teacher;
};

// Update Guru
export const updateTeacherService = async (id: number, data: any) => {
  // Pastikan guru ada
  await getTeacherByIdService(id);

  // Jika admin mengubah password, kita harus hash ulang password barunya
  if (data.password) {
    data.password = await hashPassword(data.password);
  }

  const updatedTeacher = await prisma.teacher.update({
    where: { teacher_id: id },
    data: data,
    select: {
      teacher_id: true,
      username: true,
      first_name: true,
      last_name: true,
      gender: true,
      age: true,
    },
  });

  return updatedTeacher;
};

// Hapus Guru
export const deleteTeacherService = async (id: number) => {
  // Pastikan guru ada sebelum dihapus
  await getTeacherByIdService(id);

  await prisma.teacher.delete({
    where: { teacher_id: id },
  });

  return true;
};

export const uploadTeacherImageService = async (
  id: number,
  imageBuffer: Buffer,
) => {
  // 1. Pastikan guru ada
  await getTeacherByIdService(id);

  // 2. Kompres gambar menggunakan Sharp sebelum disimpan ke database
  //    - Resize: maks 800x800 px (menjaga aspek rasio, tidak memperbesar)
  //    - Format: JPEG dengan kualitas 80%
  const compressedBuffer = await compressImage(imageBuffer, {
    maxWidth: 800,
    maxHeight: 800,
    quality: 80,
    format: "jpeg",
  });

  // 3. Konversi Buffer yang sudah dikompres ke Uint8Array agar TypeScript & Prisma senang
  const uint8Array = new Uint8Array(compressedBuffer);

  // 4. Update database
  const updatedTeacher = await prisma.teacher.update({
    where: { teacher_id: id },
    data: {
      images: uint8Array, // Gunakan variabel yang sudah dikonversi
    },
    select: {
      teacher_id: true,
      username: true,
    },
  });

  return updatedTeacher;
};
