// src/types/reservation.ts
export interface IReservation {
  id: number;
  common_area: number;                    // ID del área común
  common_area_name: string;               // Nombre del área común (read-only)
  resident: number;                       // ID del residente
  resident_name: string;                  // Nombre del residente (read-only)
  resident_email: string;                 // Email del residente (read-only)
  start_time: string;
  end_time: string;
  status: 'Pendiente' | 'Confirmada' | 'Cancelada';
  total_paid: string;
  created_at: string;                     // Fecha de creación (read-only)
}

export type ReservationStatus = 'Pendiente' | 'Confirmada' | 'Cancelada';
