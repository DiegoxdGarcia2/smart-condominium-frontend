export type FinancialFeeStatus = 'pending' | 'paid' | 'overdue';

export interface FinancialFee {
  id: number;
  unit_number: string;
  description: string;
  amount: string;
  due_date: string;
  status: FinancialFeeStatus;
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
  owner?: string; // Campo opcional para el propietario
  // Otros campos que pueda tener la unidad residencial
}
