import prisma from "../lib/prisma.js";
// --- LOGIKA TAP NFC (ABSENSI SISWA) ---
export const handleStudentTapService = async (tag_id, teacher_id) => {
    // 1. Cari siswa berdasarkan tag NFC
    const student = await prisma.student.findUnique({ where: { tag_id } });
    if (!student)
        throw new Error("Kartu tidak dikenali / Belum terdaftar.");
    // 2. Tentukan batas waktu hari ini (Jam 00:00:00 sampai 23:59:59)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    // 3. Cek apakah siswa sudah absen masuk hari ini
    const existingPresence = await prisma.presence.findFirst({
        where: {
            student_id: student.student_id,
            enter: {
                gte: today, // Lebih besar atau sama dengan awal hari ini
                lt: tomorrow, // Lebih kecil dari besok
            },
        },
    });
    // 4. Logika Masuk / Pulang
    if (!existingPresence) {
        // BELUM ABSEN -> Catat sebagai Absen Masuk (Enter)
        const newPresence = await prisma.presence.create({
            data: {
                student_id: student.student_id,
                teacher_id: teacher_id, // Sekarang TypeScript tidak akan protes!
            },
        });
        return { action: "ENTER", student, presence: newPresence };
    }
    else if (!existingPresence.exit) {
        // SUDAH MASUK, BELUM PULANG -> Catat sebagai Absen Pulang (Exit)
        // Disini kita juga bisa mengupdate siapa guru yang memulangkan jika diperlukan
        const updatedPresence = await prisma.presence.update({
            where: { presence_id: existingPresence.presence_id },
            data: { exit: new Date() },
        });
        return { action: "EXIT", student, presence: updatedPresence };
    }
    else {
        throw new Error(`Siswa ${student.first_name} sudah melakukan absensi masuk dan pulang hari ini.`);
    }
};
// --- LOGIKA PORTAL ORANG TUA (CEK VIA NIS) ---
export const getPresenceByNisService = async (nis) => {
    // Cari siswa beserta relasi 30 data absensi terakhirnya
    const studentWithPresences = await prisma.student.findUnique({
        where: { nis },
        select: {
            nis: true,
            first_name: true,
            last_name: true,
            class: true,
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
