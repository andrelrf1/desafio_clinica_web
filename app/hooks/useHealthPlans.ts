import {useState, useEffect} from "react";
import {ApiService} from "@/app/services/api-service";
import {API_ROUTES} from "@/app/lib/config";
import {HealthPlan} from "@/app/lib/types";

export function useHealthPlans(patientPlan: string | null, onAuthError: () => void) {
    const [plans, setPlans] = useState<HealthPlan[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadPlans = async () => {
            setLoading(true);
            setError(null);
            try {
                const list = await ApiService.get(API_ROUTES.healthPlans);

                const mapped: HealthPlan[] = Array.isArray(list)
                    ? list
                        .filter((p) => p && p.is_active !== false)
                        .map((p) => ({id: String(p.id), name: p.name, is_active: p.is_active}))
                    : [];

                const filtered = mapped.filter((p) => {
                    const planName = p.name.toLowerCase();
                    if (planName === "avulso") return true;
                    return !!(patientPlan && planName === patientPlan.toLowerCase());
                });

                setPlans(filtered);
            } catch (e) {
                const message = e instanceof Error ? e.message : "Erro ao carregar planos";
                if (message.includes("401") || message.includes("403")) {
                    onAuthError();
                } else {
                    setError(message);
                    setPlans([]);
                }
            } finally {
                setLoading(false);
            }
        };
        loadPlans();
    }, [patientPlan, onAuthError]);

    return {plans, loading, error};
}