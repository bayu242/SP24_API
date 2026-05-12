import prisma from "../lib/prisma.js";
import {
  CreateStudentDTO,
  UpdateStudentDTO,
} from "../interfaces/student.interface.js";

export const createStudentService = async (data: CreateStudentDTO) => {
  const existing = await prisma.student.findFirst({
    where: { OR: [{ nis: data.nis }, { tag_id: data.tag_id }] },
  });
  if (existing) throw new Error("NIS atau Tag NFC sudah terdaftar.");

  return await prisma.student.create({ data });
};

export const getAllStudentsService = async () => {
  return await prisma.student.findMany({ select:{
    student_id: true,
    nis: true,
    first_name: true,
    last_name: true,
    class: true,
    parent: true,
    tag_id: true,
    age: true,
  } });
};

export const getStudentByIdService = async (id: number) => {
  const student = await prisma.student.findUnique({
    where: { student_id: id },
  });
  if (!student) throw new Error("Siswa tidak ditemukan.");
  return student;
};

export const updateStudentService = async (
  id: number,
  data: UpdateStudentDTO,
) => {
  await getStudentByIdService(id);
  return await prisma.student.update({
    where: { student_id: id },
    data,
  });
};

export const deleteStudentService = async (id: number) => {
  await getStudentByIdService(id);
  return await prisma.student.delete({ where: { student_id: id } });
};

export const uploadStudentImageService = async (
  id: number,
  imageBuffer: Buffer,
) => {
  // 1. Pastikan siswa ada
  await getStudentByIdService(id);

  // 2. Konversi Buffer ke Uint8Array untuk Prisma
  const uint8Array = new Uint8Array(imageBuffer);

  // 3. Update kolom images
  const updatedStudent = await prisma.student.update({
    where: { student_id: id },
    data: {
      images: uint8Array,
    },
    select: {
      student_id: true,
      nis: true,
      first_name: true,
      last_name: true,
      // images tidak di-select agar response tidak berat
    },
  });

  return updatedStudent;
};
