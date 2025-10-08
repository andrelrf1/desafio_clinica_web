"use client";

import React, {useState, useMemo, useEffect, useCallback} from "react";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import {Doctor} from "@/app/lib/types";
import {getNextBusinessDayString, generateHourOptions} from "@/app/lib/date";
import {AppointmentController} from "@/app/controllers/appointment-controller";
import {DoctorController} from "@/app/controllers/doctor-controller";
import {DoctorSelect} from "./form/DoctorSelect";
import {RecurrenceSelect} from "./form/RecurrenceSelect";
import {DateField} from "./form/DateField";
import {TimeSelect} from "./form/TimeSelect";
import {useHealthPlans} from "@/app/hooks/useHealthPlans";

interface AppointmentFormProps {
    doctors: Doctor[];
    doctorsLoading: boolean;
    doctorsError: string | null;
    patientId: number | null;
    patientPlan: string | null;
    onSuccess: () => void;
    onAuthError: () => void;
}

export function AppointmentForm({
                                    doctors,
                                    doctorsLoading,
                                    doctorsError,
                                    patientId,
                                    patientPlan,
                                    onSuccess,
                                    onAuthError,
                                }: AppointmentFormProps) {
    const OPEN_TIME = "08:00";
    const CLOSE_TIME = "17:00";

    const [doctorId, setDoctorId] = useState("");
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    const [recurrence, setRecurrence] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [snack, setSnack] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const [doctorBookedMap, setDoctorBookedMap] = useState<Record<string, string[]>>({});
    const [doctorRecurring, setDoctorRecurring] = useState<{
        startDate: string;
        time: string;
        recurrence: string;
    }[]>([]);
    const [doctorApptsLoading, setDoctorApptsLoading] = useState(false);
    const [doctorApptsError, setDoctorApptsError] = useState<string | null>(null);

    const {plans, loading: plansLoading, error: plansError} = useHealthPlans(patientPlan, onAuthError);

    const minDate = useMemo(() => getNextBusinessDayString(), []);
    const hourOptions = useMemo(() => generateHourOptions(OPEN_TIME, CLOSE_TIME), []);

    useEffect(() => {
        if (!date) setDate(minDate);
    }, [minDate, date]);

    useEffect(() => {
        if (plans.length > 0 && !recurrence) {
            setRecurrence(plans[0].name);
        }
    }, [plans, recurrence]);

    const availableHourOptions = useMemo(() => {
        if (!doctorId || !date) return [];

        const booked = doctorBookedMap[date] || [];
        const bookedSet = new Set(booked);

        if (doctorRecurring.length > 0) {
            const sel = new Date(`${date}T00:00:00`);
            const selDOW = sel.getDay();
            for (const r of doctorRecurring) {
                const start = new Date(`${r.startDate}T00:00:00`);
                const startDOW = start.getDay();
                if (isNaN(sel.getTime()) || isNaN(start.getTime())) continue;
                if (sel < start) continue;
                if (selDOW !== startDOW) continue;
                const diffDays = Math.floor((sel.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
                const rec = (r.recurrence || "").toLowerCase();
                if (rec === "semanal" && diffDays % 7 === 0) {
                    bookedSet.add(r.time);
                } else if (rec === "quinzenal" && diffDays % 14 === 0) {
                    bookedSet.add(r.time);
                }
            }
        }

        return hourOptions.filter((t) => !bookedSet.has(t));
    }, [hourOptions, doctorId, date, doctorBookedMap, doctorRecurring]);

    useEffect(() => {
        if (!availableHourOptions || availableHourOptions.length === 0) {
            setTime("");
            return;
        }
        if (!time || !availableHourOptions.includes(time)) {
            setTime(availableHourOptions[0]);
        }
    }, [availableHourOptions, time]);

    const loadDoctorAppointments = useCallback(async (docId: string) => {
        if (!docId) return;
        setDoctorApptsLoading(true);
        setDoctorApptsError(null);

        try {
            const {bookedMap, recurring} = await DoctorController.getAppointments(docId);
            setDoctorBookedMap(bookedMap);
            setDoctorRecurring(recurring);
        } catch (e) {
            const message = e instanceof Error ? e.message : "Erro ao verificar disponibilidade";
            if (message.includes("401") || message.includes("403")) {
                onAuthError();
            } else {
                setDoctorApptsError(message);
                setDoctorBookedMap({});
                setDoctorRecurring([]);
            }
        } finally {
            setDoctorApptsLoading(false);
        }
    }, [onAuthError]);

    useEffect(() => {
        if (doctorId) {
            loadDoctorAppointments(doctorId);
        }
    }, [doctorId, loadDoctorAppointments]);

    const handleDoctorChange = (value: string) => {
        setDoctorId(value);
        setDoctorBookedMap({});
        setDoctorRecurring([]);
        setDoctorApptsError(null);
        setDate(minDate);
        setTime("");
        setRecurrence(plans[0]?.name || "");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!patientId) {
            setError("Não foi possível identificar o paciente. Faça login novamente.");
            return;
        }

        const doctor = doctors.find((d) => d.id === doctorId);
        if (!doctor) {
            setError("Médico inválido.");
            return;
        }

        const plan = plans.find((p) => p.name === recurrence);
        if (!plan) {
            setError("Tipo de consulta inválido.");
            return;
        }

        const bookedForDate = doctorBookedMap[date] || [];
        if (bookedForDate.includes(time)) {
            setError("Horário indisponível para o médico selecionado nesta data.");
            return;
        }

        setSubmitting(true);
        try {
            await AppointmentController.create(
                {
                    doctor: Number(doctor.id),
                    patient: Number(patientId),
                    date,
                    time,
                    recurrence_type: Number(plan.id),
                },
                OPEN_TIME,
                CLOSE_TIME
            );

            setSnack("Agendamento criado com sucesso!");
            setDoctorId("");
            setDate(minDate);
            setTime(OPEN_TIME);
            setRecurrence(plans[0]?.name || "");
            onSuccess();
        } catch (err) {
            const message = err instanceof Error ? err.message : "Erro ao criar agendamento";
            if (message.includes("401") || message.includes("403")) {
                onAuthError();
            } else {
                setError(message);
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <>
            <Paper elevation={3} sx={{p: 3}}>
                <Typography variant="h6" sx={{mb: 2}}>
                    Novo agendamento
                </Typography>
                <Box component="form" onSubmit={handleSubmit}>
                    <Stack direction={{xs: "column", sm: "row"}} spacing={2}>
                        <DoctorSelect
                            value={doctorId}
                            onChange={handleDoctorChange}
                            doctors={doctors}
                            loading={doctorsLoading}
                            error={doctorsError}
                        />

                        <RecurrenceSelect
                            value={recurrence}
                            onChange={setRecurrence}
                            plans={plans}
                            loading={plansLoading}
                            error={plansError}
                        />

                        <DateField
                            value={date}
                            onChange={setDate}
                            minDate={minDate}
                        />

                        <TimeSelect
                            value={time}
                            onChange={setTime}
                            options={availableHourOptions}
                            loading={doctorApptsLoading}
                            error={doctorApptsError}
                            openTime={OPEN_TIME}
                            closeTime={CLOSE_TIME}
                        />

                        <Button
                            type="submit"
                            variant="contained"
                            sx={{whiteSpace: "nowrap", px: 4, height: 56, paddingLeft: 4, paddingRight: 4}}
                            disabled={submitting}
                        >
                            {submitting ? "Agendando..." : "Agendar"}
                        </Button>
                    </Stack>
                    {error && (
                        <Alert severity="error" sx={{mt: 2}}>
                            {error}
                        </Alert>
                    )}
                </Box>
            </Paper>

            <Snackbar
                open={!!snack}
                autoHideDuration={2500}
                onClose={() => setSnack(null)}
                anchorOrigin={{vertical: "bottom", horizontal: "center"}}
            >
                <Alert onClose={() => setSnack(null)} severity="success" variant="filled" sx={{width: "100%"}}>
                    {snack}
                </Alert>
            </Snackbar>
        </>
    );
}