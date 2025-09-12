// Interfaz genérica para respuestas paginadas
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// Tipo para las unidades residenciales
export interface ResidentialUnit {
  id: number;
  unit_number: string;
  type: 'Departamento' | 'Casa';
  floor: number;
  owner: number;
  owner_name: string;
  owner_email: string;
}

// Tipo para una nueva cuota financiera (sin ID)
export interface NewFinancialFee {
  unit: number;
  unit_number: string;
  unit_owner: string;
  description: string;
  amount: string;
  due_date: string;
  status: 'Pendiente' | 'Pagado' | 'Vencido';
}

// Tipo para una cuota financiera existente (con ID)
export interface FinancialFee extends NewFinancialFee {
  id: number;
  created_at: string;
}

// Tipo para el estado actual de una cuota que se está editando
export type EditingFinancialFee = Partial<FinancialFee> & {
  unit_number?: string;
  description?: string;
  amount?: string;
  due_date?: string;
  status?: 'Pendiente' | 'Pagado' | 'Vencido';
};
