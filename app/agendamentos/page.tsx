"use client";

import React from "react";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import {useAuth} from "@/app/hooks/useAuth";
import {useDoctors} from "@/app/hooks/useDoctors";
import {useAppointments} from "@/app/hooks/useAppointments";
import {AppointmentForm} from "@/app/components/AppointmentForm";
import {AppointmentList} from "@/app/components/AppointmentList";

export default function AgendamentosPage() {
    const {patientEmail, patientPlan, patientId, loggingOut, logout} = useAuth();
    const {doctors, loading: doctorsLoading, error: doctorsError} = useDoctors(logout);
    const {
        appointments,
        loading: appointmentsLoading,
        error: appointmentsError,
        reload
    } = useAppointments(patientId, logout);

    return (
        <Container maxWidth="lg" sx={{py: 4}}>
            <Stack spacing={3}>
                <Typography variant="h4" component="h1">
                    Meus Agendamentos
                </Typography>

                <Box sx={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
                    <Typography variant="body2" color="text.secondary">
                        {patientEmail ? `Logado como: ${patientEmail}` : ""}
                    </Typography>
                    <Button variant="outlined" color="inherit" size="small" onClick={logout} disabled={loggingOut}>
                        {loggingOut ? "Saindo..." : "Sair"}
                    </Button>
                </Box>

                <AppointmentForm
                    doctors={doctors}
                    doctorsLoading={doctorsLoading}
                    doctorsError={doctorsError}
                    patientId={patientId}
                    patientPlan={patientPlan}
                    onSuccess={reload}
                    onAuthError={logout}
                />

                <AppointmentList
                    appointments={appointments}
                    loading={appointmentsLoading}
                    error={appointmentsError}
                    onDelete={reload}
                    onAuthError={logout}
                />
            </Stack>
        </Container>
    );
}