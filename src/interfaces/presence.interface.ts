// File: src/interfaces/presence.interface.ts

export interface TapAttendanceDTO {
  tag_id: string;
  teacher_id?: number; // Opsional karena mesin di gerbang tidak butuh ID Guru
}
