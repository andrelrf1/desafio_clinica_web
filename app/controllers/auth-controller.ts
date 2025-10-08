import {AuthModel, LoginCredentials} from "@/app/models/auth";

export class AuthController {
    static async login(credentials: LoginCredentials) {
        if (!credentials.email || !credentials.password) {
            throw new Error("Informe e-mail e senha.");
        }

        return await AuthModel.login(credentials);
    }

    static async logout() {
        await AuthModel.logout();
    }

    static isAuthenticated(): boolean {
        return AuthModel.isAuthenticated();
    }

    static getAuthData() {
        return AuthModel.getAuthData();
    }
}