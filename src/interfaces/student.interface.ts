// File: src/interfaces/student.interface.ts

export interface CreateStudentDTO {
  nis: string;
  first_name: string;
  last_name: string;
  class: string;
  parent: string;
  tag_id: string; // Didapat dari hasil pairing NFC
  age: number;
}

export interface UpdateStudentDTO extends Partial<CreateStudentDTO> {}
