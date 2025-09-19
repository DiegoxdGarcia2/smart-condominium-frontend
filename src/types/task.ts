// src/types/task.ts

export interface ITask {
  id: number;
  title: string;
  description: string;
  status: 'Pendiente' | 'En Progreso' | 'Completada';
  assigned_to_name?: string;
  created_by_name?: string;
  created_at: string;
  completed_at?: string;
  assigned_to?: number;
  created_by?: number;
}

export interface ICreateTask {
  title: string;
  description: string;
  assigned_to: number;
}

export interface IUpdateTask {
  title?: string;
  description?: string;
  assigned_to?: number;
  status?: 'Pendiente' | 'En Progreso' | 'Completada';
}

export const TASK_STATUS_OPTIONS = [
  { value: 'Pendiente', label: 'Pendiente' },
  { value: 'En Progreso', label: 'En Progreso' },
  { value: 'Completada', label: 'Completada' },
] as const;