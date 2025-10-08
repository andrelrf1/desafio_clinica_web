import {useState, useEffect} from "react";
import {DoctorController} from "@/app/controllers/doctor-controller";
import {Doctor} from "@/app/lib/types";

export function useDoctors(onAuthError: () => void) {
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await DoctorController.getAll();
                setDoctors(data);
            } catch (e) {
                const message = e instanceof Error ? e.message : "Erro ao carregar médicos";
                if (message.includes("401") || message.includes("403")) {
                    onAuthError();
                } else {
                    setError(message);
                    setDoctors([]);
                }
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [onAuthError]);

    return {doctors, loading, error};
}