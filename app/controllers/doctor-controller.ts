import {DoctorModel} from "@/app/models/doctor";

export class DoctorController {
    static async getAll() {
        return await DoctorModel.getAll();
    }

    static async getAppointments(doctorId: string) {
        return await DoctorModel.getAppointments(doctorId);
    }
}