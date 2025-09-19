// src/types/unit.ts

export interface IResidentialUnit {
  id: number;
  unit_number: string;
  type: 'Departamento' | 'Casa';
  floor: number | null;
  owner: number | null;
  owner_name?: string;
  owner_email?: string;
}

export interface ICreateResidentialUnit {
  unit_number: string;
  type: 'Departamento' | 'Casa';
  floor: number | null;
  owner: number | null;
}

export interface IUpdateResidentialUnit {
  unit_number: string;
  type: 'Departamento' | 'Casa';
  floor: number | null;
  owner: number | null;
}

export const UNIT_TYPE_OPTIONS = [
  { value: 'Departamento', label: 'Departamento' },
  { value: 'Casa', label: 'Casa' },
] as const;