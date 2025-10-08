export class ApiService {
    private static getHeaders(includeAuth: boolean = true): HeadersInit {
        const headers: HeadersInit = {
            "Content-Type": "application/json",
        };

        if (includeAuth) {
            const access = localStorage.getItem("jwt_access");
            if (access) {
                headers["Authorization"] = `Bearer ${access}`;
            }
        }

        return headers;
    }

    static async post<T>(url: string, data: unknown, includeAuth = true): Promise<T> {
        const response = await fetch(url, {
            method: "POST",
            headers: this.getHeaders(includeAuth),
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const error = await this.parseError(response);
            throw new Error(error);
        }

        return response.json();
    }

    static async get<T>(url: string): Promise<T> {
        const response = await fetch(url, {
            method: "GET",
            headers: this.getHeaders(true),
        });

        if (!response.ok) {
            const error = await this.parseError(response);
            throw new Error(error);
        }

        return response.json();
    }

    static async delete(url: string): Promise<void> {
        const response = await fetch(url, {
            method: "DELETE",
            headers: this.getHeaders(true),
        });

        if (!response.ok) {
            const error = await this.parseError(response);
            throw new Error(error);
        }
    }

    private static async parseError(response: Response): Promise<string> {
        try {
            const json = await response.json();
            return json?.message || json?.detail || "Erro na requisição";
        } catch {
            return "Erro na requisição";
        }
    }
}