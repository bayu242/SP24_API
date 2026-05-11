import { Request, Response } from "express";
import * as presenceService from "../services/presence.service.js";
import { TapAttendanceDTO } from "../interfaces/presence.interface.js";

export const tapAttendance = async (req: Request, res: Response) => {
  try {
    const payload: TapAttendanceDTO = req.body;

    // Validasi KETAT
    if (!payload.tag_id) {
      res
        .status(400)
        .json({ success: false, message: "tag_id wajib dikirim!" });
      return;
    }
    if (!payload.teacher_id) {
      res
        .status(400)
        .json({ success: false, message: "teacher_id wajib dikirim!" });
      return;
    }

    // Lempar ke service (sekarang payload.teacher_id pasti ada)
    const result = await presenceService.handleStudentTapService(
      payload.tag_id,
      payload.teacher_id,
    );

    const message =
      result.action === "ENTER"
        ? `Selamat datang, ${result.student.first_name}!`
        : `Hati-hati di jalan, ${result.student.first_name}!`;

    res.status(200).json({
      success: true,
      message,
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ... (kode checkParentPortal tetap sama)

// Endpoint untuk dicek oleh Orang Tua
export const checkParentPortal = async (req: Request, res: Response) => {
  try {
    const nis = req.params.nis as string;
    const data = await presenceService.getPresenceByNisService(nis);

    res.status(200).json({
      success: true,
      message: "Data absensi berhasil ditarik",
      data: data,
    });
  } catch (error: any) {
    res.status(404).json({ success: false, message: error.message });
  }
};
