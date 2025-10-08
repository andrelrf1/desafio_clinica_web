export class StorageService {
    static setItem(key: string, value: string): void {
        try {
            localStorage.setItem(key, value);
        } catch (e) {
            console.error(`Erro ao salvar ${key}:`, e);
        }
    }

    static getItem(key: string): string | null {
        try {
            return localStorage.getItem(key);
        } catch (e) {
            console.error(`Erro ao recuperar ${key}:`, e);
            return null;
        }
    }

    static removeItem(key: string): void {
        try {
            localStorage.removeItem(key);
        } catch (e) {
            console.error(`Erro ao remover ${key}:`, e);
        }
    }

    static clear(): void {
        try {
            localStorage.removeItem("patient_email");
            localStorage.removeItem("user_id");
            localStorage.removeItem("jwt_access");
            localStorage.removeItem("jwt_refresh");
        } catch (e) {
            console.error("Erro ao limpar storage:", e);
        }
    }

    static getAuthData() {
        return {
            access: this.getItem("jwt_access"),
            refresh: this.getItem("jwt_refresh"),
            userId: this.getItem("user_id"),
            email: this.getItem("patient_email"),
        };
    }

    static setAuthData(data: { email?: string; userId?: number; access?: string; refresh?: string }) {
        if (data.email) this.setItem("patient_email", data.email);
        if (data.userId) this.setItem("user_id", String(data.userId));
        if (data.access) this.setItem("jwt_access", data.access);
        if (data.refresh) this.setItem("jwt_refresh", data.refresh);
    }
}