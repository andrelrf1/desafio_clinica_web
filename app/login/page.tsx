"use client";

import * as React from "react";
import {useRouter} from "next/navigation";
import Image from "next/image";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Alert from "@mui/material/Alert";
import {AuthController} from "@/app/controllers/auth-controller";

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

        try {
            await AuthController.login({email, password});
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
                        <Box sx={{ mb: 2, width: "100%", maxWidth: 200, height: 60, position: "relative" }}>
                            <Image
                                src="/logo_horizontal.png"
                                alt="Logo Clínica Desafio"
                                fill
                                style={{ objectFit: "contain" }}
                                priority
                            />
                        </Box>
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