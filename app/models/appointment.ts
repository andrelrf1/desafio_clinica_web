import {ApiService} from "@/app/services/api-service";
import {API_ROUTES} from "@/app/lib/config";
import {Appointment} from "@/app/lib/types";

export interface CreateAppointmentDTO {
    doctor: number;
    patient: number;
    date: string;
    time: string;
    recurrence_type: number;
}

export class AppointmentModel {
    static async create(data: CreateAppointmentDTO): Promise<void> {
        await ApiService.post(API_ROUTES.appointments, data);
    }

    static async getByPatient(patientId: number): Promise<Appointment[]> {
        const list = await ApiService.get(API_ROUTES.patientAppointments(patientId));

        return Array.isArray(list)
            ? list.map((item) => {
                const doctor = item?.doctor || {};
                const rec = item?.recurrence_type || {};
                const time: string = typeof item?.time === "string" ? item.time : "";
                const endTime: string = typeof item?.end_time === "string" ? item.end_time : "";
                const idStr: string = item?.id != null ? String(item.id) : "";

                return {
                    id: idStr,
                    doctorId: doctor?.id != null ? String(doctor.id) : "",
                    doctorName: doctor?.name || "Médico",
                    doctorExpertise: doctor?.expertise || undefined,
                    date: item?.date || "",
                    time: time ? time.slice(0, 5) : "",
                    endTime: endTime ? endTime.slice(0, 5) : undefined,
                    recurrence: rec?.name || undefined,
                    createdAt: item?.created_at || new Date().toISOString(),
                } as Appointment;
            })
            : [];
    }

    static async delete(appointmentId: string): Promise<void> {
        await ApiService.delete(API_ROUTES.appointment(appointmentId));
    }
}