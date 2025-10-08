import {ApiService} from "@/app/services/api-service";
import {API_ROUTES} from "@/app/lib/config";
import {Doctor} from "@/app/lib/types";

export class DoctorModel {
    static async getAll(): Promise<Doctor[]> {
        const list = await ApiService.get(API_ROUTES.doctors);

        return Array.isArray(list)
            ? list
                .filter((d) => d && d.is_active !== false)
                .map((d) => ({
                    id: String(d.id),
                    name: d.name,
                    expertise: d.expertise,
                    is_active: d.is_active,
                }))
            : [];
    }

    static async getAppointments(doctorId: string) {
        const list = await ApiService.get(API_ROUTES.doctorAppointments(doctorId));

        const bookedMap: Record<string, string[]> = {};
        const recurring: { startDate: string; time: string; recurrence: string }[] = [];

        if (Array.isArray(list)) {
            for (const item of list) {
                const date = typeof item?.date === "string" ? item.date : "";
                const timeRaw = typeof item?.time === "string" ? item.time : "";
                const time = timeRaw ? timeRaw.slice(0, 5) : "";
                const recName = (item?.recurrence_type?.name || "").toLowerCase();

                if (!date || !time) continue;

                if (!bookedMap[date]) bookedMap[date] = [];
                if (!bookedMap[date].includes(time)) bookedMap[date].push(time);

                if (recName === "semanal" || recName === "quinzenal") {
                    recurring.push({startDate: date, time, recurrence: recName});
                }
            }
        }

        return {bookedMap, recurring};
    }
}