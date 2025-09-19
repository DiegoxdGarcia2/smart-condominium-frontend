// src/types/user.ts
export interface IUser {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_active?: boolean;
  role_name?: string;
  role?: number; // Para envío al backend
}

export interface IResident extends IUser {
  full_name?: string;
}

export interface ICreateUser {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  password: string;
  role: number | string;
}

export interface IUpdateUser {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: number | string;
  password?: string; // Opcional para actualización
}

export interface IRole {
  id: number;
  name: string;
}
