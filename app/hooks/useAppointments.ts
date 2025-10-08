import {useState, useEffect, useCallback} from "react";
import {AppointmentController} from "@/app/controllers/appointment-controller";
import {Appointment} from "@/app/lib/types";

export function useAppointments(patientId: number | null, onAuthError: () => void) {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadAppointments = useCallback(async () => {
        if (!patientId) return;

        setLoading(true);
        setError(null);
        try {
            const data = await AppointmentController.getByPatient(patientId);
            setAppointments(data);
        } catch (e) {
            const message = e instanceof Error ? e.message : "Erro ao carregar agendamentos";
            if (message.includes("401") || message.includes("403")) {
                onAuthError();
            } else {
                setError(message);
                setAppointments([]);
            }
        } finally {
            setLoading(false);
        }
    }, [patientId, onAuthError]);

    useEffect(() => {
        if (patientId) {
            loadAppointments();
        }
    }, [patientId, loadAppointments]);

    return {appointments, loading, error, reload: loadAppointments};
}