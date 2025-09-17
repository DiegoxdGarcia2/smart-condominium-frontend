// ==============================
// Vehicle Types
// ==============================

export interface IVehicle {
  id: number;
  resident: number;
  resident_name: string;
  resident_email: string;
  unit_number: string;
  license_plate: string;
  brand: string;
  model: string;
  color: string;
  created_at: string;
}

export interface ICreateVehicle {
  license_plate: string;
  brand: string;
  model: string;
  color: string;
}

export interface IUpdateVehicle {
  license_plate?: string;
  brand?: string;
  model?: string;
  color?: string;
}