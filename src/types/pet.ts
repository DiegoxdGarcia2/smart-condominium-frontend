// ==============================
// Pet Types
// ==============================

export interface IPet {
  id: number;
  resident: number;
  resident_name: string;
  resident_email: string;
  unit_number: string;
  name: string;
  species: 'Perro' | 'Gato' | 'Ave' | 'Pez' | 'Otro';
  breed: string;
  age: number;
  created_at: string;
}

export interface ICreatePet {
  name: string;
  species: 'Perro' | 'Gato' | 'Ave' | 'Pez' | 'Otro';
  breed: string;
  age: number;
}

export interface IUpdatePet {
  name?: string;
  species?: 'Perro' | 'Gato' | 'Ave' | 'Pez' | 'Otro';
  breed?: string;
  age?: number;
}

export const PET_SPECIES_OPTIONS = [
  'Perro',
  'Gato',
  'Ave',
  'Pez',
  'Otro'
] as const;