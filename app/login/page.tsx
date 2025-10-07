"use client";

import * as React from "react";
import {useRouter} from "next/navigation";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import { API_ROUTES } from "@/app/lib/config";

export default function LoginPage() {
    const router = useRouter();
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);
        setLoading(true);

        const data = new FormData(event.currentTarget);
        const email = (data.get("email") || "").toString().trim();
        const password = (data.get("password") || "").toString();

        if (!email || !password) {
            setError("Informe e-mail e senha.");
            setLoading(false);
            return;
        }

        try {
            const resp = await fetch(API_ROUTES.login, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({email, password}),
            });

            if (!resp.ok) {
                let detail = "Falha no login. Verifique suas credenciais.";
                try {
                    const errJson = await resp.json();
                    if (errJson?.message) detail = errJson.message;
                    else if (errJson?.detail) detail = errJson.detail;
                } catch (_) {
                }
                throw new Error(detail);
            }

            const json = await resp.json();
            const userEmail = json?.user?.email || email;
            const userId = json?.user?.id;
            const access = json?.tokens?.access;
            const refresh = json?.tokens?.refresh;

            try {
                if (userEmail) localStorage.setItem("patient_email", userEmail);
                if (typeof userId !== "undefined" && userId !== null) localStorage.setItem("user_id", String(userId));
                if (access) localStorage.setItem("jwt_access", access);
                if (refresh) localStorage.setItem("jwt_refresh", refresh);
            } catch (e) {
                console.error("Falha ao salvar sessão:", e);
            }

            router.push("/agendamentos");
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : "Erro inesperado ao efetuar login.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container component="main" maxWidth="xs">
            <Box
                sx={{
                    minHeight: "100vh",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <Paper elevation={6} sx={{p: 4, width: "100%"}}>
                    <Box sx={{display: "flex", flexDirection: "column", alignItems: "center", mb: 2}}>
                        <Avatar sx={{m: 1, bgcolor: "primary.main", width: 56, height: 56}}>
                            <Typography variant="h6" component="span" color="inherit">
                                🏥
                            </Typography>
                        </Avatar>
                        <Typography component="h1" variant="h5">
                            Clinica Desafio
                        </Typography>
                    </Box>

                    <Box component="form" onSubmit={handleSubmit} noValidate>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="email"
                            label="E-mail"
                            name="email"
                            type="email"
                            autoComplete="email"
                            autoFocus
                            disabled={loading}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="password"
                            label="Senha"
                            type="password"
                            id="password"
                            autoComplete="current-password"
                            disabled={loading}
                        />
                        {error && (
                            <Alert severity="error" sx={{mt: 1}}>
                                {error}
                            </Alert>
                        )}
                        <Button type="submit" fullWidth variant="contained" sx={{mt: 3}} disabled={loading}>
                            {loading ? "Entrando..." : "Entrar"}
                        </Button>
                    </Box>
                </Paper>
            </Box>
        </Container>
    );
}
