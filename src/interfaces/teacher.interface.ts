export interface CreateTeacherDTO {
  username: string;
  password: string;
  first_name: string;
  last_name: string;
  gender: string; // 'L' atau 'P'
  age: number;
}

// File: src/interfaces/teacher.interface.ts
// ... (CreateTeacherDTO tetap ada di sini) ...

export interface UpdateTeacherDTO {
  username?: string;
  password?: string;
  first_name?: string;
  last_name?: string;
  gender?: string;
  age?: number;
}
