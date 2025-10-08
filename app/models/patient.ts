import {ApiService} from "@/app/services/api-service";
import {API_ROUTES} from "@/app/lib/config";

export interface PatientData {
    id: number;
    health_plan_name: string;
}

export class PatientModel {
    static async getById(userId: string): Promise<PatientData> {
        return ApiService.get<PatientData>(API_ROUTES.patient(userId));
    }
}