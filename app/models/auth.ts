import {ApiService} from "@/app/services/api-service";
import {StorageService} from "@/app/services/storage-service";
import {API_ROUTES} from "@/app/lib/config";

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface LoginResponse {
    user: {
        id: number;
        email: string;
    };
    tokens: {
        access: string;
        refresh: string;
    };
}

export class AuthModel {
    static async login(credentials: LoginCredentials): Promise<LoginResponse> {
        const response = await ApiService.post<LoginResponse>(
            API_ROUTES.login,
            credentials,
            false
        );

        StorageService.setAuthData({
            email: response.user.email,
            userId: response.user.id,
            access: response.tokens.access,
            refresh: response.tokens.refresh,
        });

        return response;
    }

    static async logout(): Promise<void> {
        const {access, refresh} = StorageService.getAuthData();

        if (refresh && access) {
            try {
                await ApiService.post(API_ROUTES.logout, {refresh}, true);
            } catch (e) {
                console.warn("Falha ao chamar logout na API", e);
            }
        }

        StorageService.clear();
    }

    static isAuthenticated(): boolean {
        const {access, userId} = StorageService.getAuthData();
        return !!(access && userId);
    }

    static getAuthData() {
        return StorageService.getAuthData();
    }
}