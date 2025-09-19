export interface IFeedback {
  id: number;
  subject: string;
  message: string;
  resident: number;
  resident_name: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface ICreateFeedback {
  subject: string;
  message: string;
}

export interface IUpdateFeedback {
  status: string;
}

export const FEEDBACK_STATUS = {
  PENDIENTE: 'Pendiente',
  EN_REVISION: 'En Revisión',
  RESPONDIDO: 'Respondido',
  CERRADO: 'Cerrado',
} as const;

export type FeedbackStatus = typeof FEEDBACK_STATUS[keyof typeof FEEDBACK_STATUS];