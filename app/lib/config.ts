export const API_BASE = "http://localhost:8000/api/v1";

export const API_ROUTES = {
  login: `${API_BASE}/auth/login/`,
  logout: `${API_BASE}/auth/logout/`,
  doctors: `${API_BASE}/doctors`,
  healthPlans: `${API_BASE}/health-plans`,
  appointments: `${API_BASE}/appointments/`,
  appointment: (id: string | number) => `${API_BASE}/appointment/${id}/`,
  patient: (userId: string | number) => `${API_BASE}/users/${userId}/patient/`,
  patientAppointments: (patientId: string | number) => `${API_BASE}/patients/${patientId}/appointments/`,
  doctorAppointments: (doctorId: string | number) => `${API_BASE}/doctors/${doctorId}/appointments/`,
} as const;
