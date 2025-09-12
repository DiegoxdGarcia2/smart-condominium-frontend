// src/types/user.ts
export interface IUser {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
}

export interface IResident extends IUser {
  full_name?: string;
}
