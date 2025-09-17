// ==============================
// Visitor Log Types
// ==============================

export interface IVisitorLog {
  id: number;
  visitor_name: string;
  visitor_dni: string;
  resident: number;
  resident_name: string;
  resident_email: string;
  unit_number: string;
  entry_time: string;
  exit_time: string | null;
  vehicle_license_plate: string | null;
  status: 'Activo' | 'Salió';
  observations: string | null;
  duration_minutes: number | null;
}

export interface ICreateVisitorLog {
  visitor_name: string;
  visitor_dni: string;
  resident: number;
  vehicle_license_plate?: string;
  observations?: string;
}

export interface IUpdateVisitorLog {
  exit_time?: string;
  observations?: string;
}

export interface IDailyReport {
  date: string;
  statistics: {
    total_visitors: number;
    active_visitors: number;
    visitors_left: number;
  };
  visitors: IVisitorLog[];
}

export interface IResident {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  unit_number: string;
  phone_number: string | null;
  is_active: boolean;
}

export interface IActiveVisitor extends IVisitorLog {
  entry_duration: string;
}