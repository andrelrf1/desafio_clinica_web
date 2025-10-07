export interface Doctor {
  id: string;
  name: string;
  expertise?: string;
  is_active?: boolean;
}

export interface HealthPlan {
  id: string;
  name: "avulso" | "semanal" | "quinzenal" | string;
  is_active?: boolean;
}

export interface Appointment {
  id: string;
  doctorId: string;
  doctorName: string;
  doctorExpertise?: string;
  date: string;
  time: string;
  endTime?: string;
  recurrence?: "avulso" | "semanal" | "quinzenal" | string;
  createdAt: string;
}
