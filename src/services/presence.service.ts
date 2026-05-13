import prisma from "../lib/prisma.js";

// --- LOGIKA TAP NFC (ABSENSI SISWA) ---
export const handleStudentTapService = async (
  tag_id: string,
  teacher_id: number,
) => {
  // 1. Cari siswa berdasarkan tag NFC
  const studentData = await prisma.student.findUnique({ where: { tag_id } });
  if (!studentData) throw new Error("Kartu tidak dikenali / Belum terdaftar.");

  // 2. Tentukan batas waktu hari ini (Jam 00:00:00 sampai 23:59:59)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // 3. Cek apakah siswa sudah absen masuk hari ini
  const existingPresence = await prisma.presence.findFirst({
    where: {
      student_id: studentData.student_id,
      enter: {
        gte: today, // Lebih besar atau sama dengan awal hari ini
        lt: tomorrow, // Lebih kecil dari besok
      },
    },
  });

  // Waktu saat NFC di-tap
  const now = new Date();

  // 4. Logika Masuk / Pulang
  if (!existingPresence) {
    // BELUM ABSEN -> Catat sebagai Absen Masuk (Enter)
    const newPresence = await prisma.presence.create({
      data: {
        student_id: studentData.student_id,
        teacher_id: teacher_id,
      },
    });
    const {images, ...student} = studentData
    return { action: "ENTER", student, presence: newPresence };
  } else if (!existingPresence.exit) {
    // --- PENGECEKAN JEDA WAKTU 1 JAM (ANTI DOUBLE TAP) ---
    const enterTime = existingPresence.enter;
    // Hitung selisih waktu dalam milidetik (ms)
    const diffInMilliseconds = now.getTime() - enterTime.getTime();

    // Konversi selisih ms menjadi Jam (1 Jam = 1000ms * 60 detik * 60 menit)
    const diffInHours = diffInMilliseconds / (1000 * 60 * 60);

    if (diffInHours < 1) {
      // Menghitung sisa menit untuk ditampilkan di pesan error
      const sisaMenit = Math.ceil(60 - diffInMilliseconds / (1000 * 60));
      throw new Error(
        `Terlalu cepat! ${studentData.first_name} baru saja absen masuk. Silakan tunggu ${sisaMenit} menit lagi untuk absen pulang.`,
      );
    }
    // -----------------------------------------------------

    // SUDAH MASUK, BELUM PULANG (dan sudah lewat 1 jam) -> Catat Absen Pulang (Exit)
    const updatedPresence = await prisma.presence.update({
      where: { presence_id: existingPresence.presence_id },
      data: { exit: now },
    });
    const {images, ...student} = studentData
    return { action: "EXIT", student, presence: updatedPresence };
  } else {
    throw new Error(
      `Siswa ${studentData.first_name} sudah melakukan absensi masuk dan pulang hari ini.`,
    );
  }
};

// --- LOGIKA PORTAL ORANG TUA (CEK VIA NIS) ---
export const getPresenceByNisService = async (nis: string) => {
  // Cari siswa beserta relasi 30 data absensi terakhirnya
  const studentWithPresences = await prisma.student.findUnique({
    where: { nis },
    select: {
      nis: true,
      first_name: true,
      last_name: true,
      class: true,
      parent: true,
      presences: {
        orderBy: { enter: "desc" }, // Terbaru di atas
        take: 30, // Batasi 1 bulan terakhir agar data tidak terlalu berat
        select: {
          enter: true,
          exit: true,
        },
      },
    },
  });

  if (!studentWithPresences) {
    throw new Error("Siswa dengan NIS tersebut tidak ditemukan.");
  }

  return studentWithPresences;
};

// Mengambil data presence
export const getAllPresencesService = async () => {
  return await prisma.presence.findMany({
    orderBy: {
      enter: "desc", // Menampilkan absensi terbaru di paling atas
    },
    include: {
      student: {
        select: {
          first_name: true,
          last_name: true,
          nis: true,
          class: true,
        },
      },
      teacher: {
        select: {
          first_name: true,
          last_name: true,
        },
      },
    },
  });
};
