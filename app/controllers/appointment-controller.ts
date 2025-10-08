import {AppointmentModel, CreateAppointmentDTO} from "@/app/models/appointment";
import {getNextBusinessDayString} from "@/app/lib/date";

export class AppointmentController {
    static async create(data: CreateAppointmentDTO, openTime: string, closeTime: string) {
        // Validações
        if (!data.doctor || !data.date || !data.time || !data.recurrence_type) {
            throw new Error("Preencha todos os campos para agendar.");
        }

        if (!/^\d{2}:\d{2}$/.test(data.time)) {
            throw new Error("Informe o horário no formato HH:MM.");
        }

        if (data.time < openTime || data.time > closeTime) {
            throw new Error(`O horário deve estar entre ${openTime} e ${closeTime}.`);
        }

        const minDate = getNextBusinessDayString();
        if (data.date < minDate) {
            throw new Error(`A data deve ser a partir de ${minDate} (próximo dia útil).`);
        }

        return await AppointmentModel.create(data);
    }

    static async getByPatient(patientId: number) {
        return await AppointmentModel.getByPatient(patientId);
    }

    static async delete(appointmentId: string) {
        return await AppointmentModel.delete(appointmentId);
    }
}