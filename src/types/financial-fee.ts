export type FinancialFeeStatus = 'pending' | 'paid' | 'overdue';

export interface FinancialFee {
  id: number;
  unit_number: string;
  resident_name?: string; // Nombre del residente propietario
  description: string;
  amount: string;
  due_date: string;
  status: FinancialFeeStatus;
  // IA: campos para predicción de riesgo
  historical_default_rate?: number;
  previous_overdue_count?: number;
  days_since_due?: number;
}

export interface EditingFinancialFee {
  id?: number;
  unit_number: string;
  description: string;
  amount: string;
  due_date?: string;
  status: FinancialFeeStatus;
}

export interface ResidentialUnit {
  id: number; // ✅ ID numérico como espera el backend
  unit_number: string;
  owner?: number; // Campo opcional para el ID del propietario
  owner_name?: string; // Nombre del propietario
  // Otros campos que pueda tener la unidad residencial
}
