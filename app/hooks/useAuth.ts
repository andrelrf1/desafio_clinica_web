import {useState, useEffect, useCallback} from "react";
import {useRouter} from "next/navigation";
import {AuthController} from "@/app/controllers/auth-controller";
import {PatientModel} from "@/app/models/patient";

export function useAuth() {
    const router = useRouter();
    const [patientEmail, setPatientEmail] = useState<string | null>(null);
    const [patientPlan, setPatientPlan] = useState<string | null>(null);
    const [patientId, setPatientId] = useState<number | null>(null);
    const [loggingOut, setLoggingOut] = useState(false);

    const logout = useCallback(async () => {
        setLoggingOut(true);
        try {
            await AuthController.logout();
        } finally {
            setLoggingOut(false);
            router.replace("/login");
        }
    }, [router]);

    useEffect(() => {
        const authData = AuthController.getAuthData();
        if (!authData.email) {
            router.replace("/login");
            return;
        }
        setPatientEmail(authData.email);
    }, [router]);

    useEffect(() => {
        const loadPatient = async () => {
            try {
                const authData = AuthController.getAuthData();
                if (!authData.access || !authData.refresh || !authData.userId) {
                    await logout();
                    return;
                }

                const data = await PatientModel.getById(authData.userId);
                if (data && typeof data.id !== "undefined") {
                    setPatientId(Number(data.id));
                    setPatientPlan(data.health_plan_name);
                }
            } catch (e) {
                await logout();
            }
        };
        loadPatient();
    }, [logout]);

    return {
        patientEmail,
        patientPlan,
        patientId,
        loggingOut,
        logout,
    };
}