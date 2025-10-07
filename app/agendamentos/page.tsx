"use client";

import React from "react";
import {useRouter} from "next/navigation";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormHelperText from "@mui/material/FormHelperText";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import IconButton from "@mui/material/IconButton";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import DeleteIcon from "@mui/icons-material/Delete";
import {Doctor, HealthPlan, Appointment} from "@/app/lib/types";
import {getNextBusinessDayString, generateHourOptions} from "@/app/lib/date";
import {API_ROUTES} from "@/app/lib/config";

export default function AgendamentosPage() {
    const router = useRouter();
    const [patientEmail, setPatientEmail] = React.useState<string | null>(null);
    const [patientPlan, setPatientPlan] = React.useState<string | null>(null);
    const [appointments, setAppointments] = React.useState<Appointment[]>([]);
    const [appointmentsLoading, setAppointmentsLoading] = React.useState<boolean>(true);
    const [appointmentsError, setAppointmentsError] = React.useState<string | null>(null);
    const [doctorId, setDoctorId] = React.useState("");
    const [date, setDate] = React.useState("");
    const [time, setTime] = React.useState("");
    const [recurrence, setRecurrence] = React.useState("");
    const [error, setError] = React.useState<string | null>(null);
    const [snack, setSnack] = React.useState<string | null>(null);
    const [loggingOut, setLoggingOut] = React.useState(false);
    const [patientId, setPatientId] = React.useState<number | null>(null);
    const [submitting, setSubmitting] = React.useState(false);

    // Exclusão de agendamento
    const [confirmDeleteId, setConfirmDeleteId] = React.useState<string | null>(null);
    const [deletingId, setDeletingId] = React.useState<string | null>(null);

    // Médicos
    const [doctors, setDoctors] = React.useState<Doctor[]>([]);
    const [doctorsLoading, setDoctorsLoading] = React.useState<boolean>(true);
    const [doctorsError, setDoctorsError] = React.useState<string | null>(null);

    // Planos / Tipos de consulta
    const [plans, setPlans] = React.useState<HealthPlan[]>([]);
    const [plansLoading, setPlansLoading] = React.useState<boolean>(true);
    const [plansError, setPlansError] = React.useState<string | null>(null);

    // Disponibilidade do médico selecionado
    const [doctorBookedMap, setDoctorBookedMap] = React.useState<Record<string, string[]>>({}); // date (YYYY-MM-DD) -> ["HH:MM"]
    const [doctorApptsLoading, setDoctorApptsLoading] = React.useState<boolean>(false);
    const [doctorApptsError, setDoctorApptsError] = React.useState<string | null>(null);
    const [doctorRecurring, setDoctorRecurring] = React.useState<{
        startDate: string;
        time: string;
        recurrence: string;
    }[]>([]);

    // Horário de funcionamento da clínica
    const OPEN_TIME = "08:00";
    const CLOSE_TIME = "17:00";

    const minDate = React.useMemo(() => getNextBusinessDayString(), []);
    React.useEffect(() => {
        if (!date) setDate(minDate);
    }, [minDate]);

    const hourOptions = React.useMemo(() => generateHourOptions(OPEN_TIME, CLOSE_TIME), []);

    const availableHourOptions = React.useMemo(() => {
        const base = hourOptions;
        if (!doctorId || !date) return [];

        const booked = doctorBookedMap[date] || [];
        const bookedSet = new Set(booked);

        if (doctorRecurring.length > 0) {
            const sel = new Date(`${date}T00:00:00`);
            const selDOW = sel.getDay(); // 0-6
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

        return base.filter((t) => !bookedSet.has(t));
    }, [hourOptions, doctorId, date, doctorBookedMap, doctorRecurring]);

    React.useEffect(() => {
        if (!availableHourOptions || availableHourOptions.length === 0) {
            setTime("");
            return;
        }
        if (!time || !availableHourOptions.includes(time)) {
            setTime(availableHourOptions[0]);
        }
    }, [availableHourOptions]);

    const handleLogout = React.useCallback(async () => {
        setLoggingOut(true);
        let access: string | null = null;
        let refresh: string | null = null;
        try {
            access = localStorage.getItem("jwt_access");
            refresh = localStorage.getItem("jwt_refresh");
        } catch (_) {
        }
        try {
            if (refresh && access) {
                await fetch(API_ROUTES.logout, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${access}`,
                    },
                    body: JSON.stringify({refresh}),
                });
            }
        } catch (e) {
            console.warn("Falha ao chamar logout na API", e);
        } finally {
            try {
                localStorage.removeItem("patient_email");
                localStorage.removeItem("user_id");
                localStorage.removeItem("jwt_access");
                localStorage.removeItem("jwt_refresh");
            } catch (_) {
            }
            setLoggingOut(false);
            router.replace("/login");
        }
    }, []);


    React.useEffect(() => {
        let email: string | null = null;
        try {
            email = localStorage.getItem("patient_email");
        } catch (e) {
        }
        if (!email) {
            router.replace("/login");
            return;
        }
        setPatientEmail(email);
    }, [router]);

    React.useEffect(() => {
        const run = async () => {
            try {
                const access = localStorage.getItem("jwt_access");
                const refresh = localStorage.getItem("jwt_refresh");
                const userId = localStorage.getItem("user_id");
                if (!access || !refresh || !userId) {
                    await handleLogout();
                    return;
                }
                const resp = await fetch(API_ROUTES.patient(userId), {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${access}`,
                    },
                });
                if (!resp.ok) {
                    await handleLogout();
                    return;
                }
                const data = await resp.json();
                if (data && typeof data.id !== "undefined") {
                    setPatientId(Number(data.id));
                    setPatientPlan(data["health_plan_name"]);
                }
            } catch (e) {
                await handleLogout();
            }
        };
        run();
    }, []);

    React.useEffect(() => {
        const load = async () => {
            setDoctorsLoading(true);
            setDoctorsError(null);
            try {
                const access = localStorage.getItem("jwt_access");
                const refresh = localStorage.getItem("jwt_refresh");
                const userId = localStorage.getItem("user_id");
                if (!access || !refresh || !userId) {
                    await handleLogout();
                    return;
                }
                const resp = await fetch(API_ROUTES.doctors, {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${access}`,
                    },
                });
                if (!resp.ok) {
                    if (resp.status === 401 || resp.status === 403) {
                        await handleLogout();
                        return;
                    }
                    let message = "Não foi possível carregar a lista de médicos.";
                    try {
                        const j = await resp.json();
                        if (j?.message) message = j.message;
                        else if (j?.detail) message = j.detail;
                    } catch (_) {
                    }
                    setDoctorsError(message);
                    setDoctors([]);
                    return;
                }
                const list = await resp.json();
                const mapped: Doctor[] = Array.isArray(list)
                    ? list
                        .filter((d) => d && d.is_active !== false)
                        .map((d) => ({
                            id: String(d.id),
                            name: d.name,
                            expertise: d.expertise,
                            is_active: d.is_active,
                        }))
                    : [];
                setDoctors(mapped);
            } catch (e) {
                setDoctorsError("Falha de rede ao carregar médicos.");
                setDoctors([]);
            } finally {
                setDoctorsLoading(false);
            }
        };
        load();
    }, []);

    const loadDoctorAppointments = React.useCallback(async (docId: string) => {
        if (!docId) return;
        setDoctorApptsLoading(true);
        setDoctorApptsError(null);
        let access: string | null = null;
        let refresh: string | null = null;
        let userId: string | null = null;
        try {
            access = localStorage.getItem("jwt_access");
            refresh = localStorage.getItem("jwt_refresh");
            userId = localStorage.getItem("user_id");
        } catch (_) {
        }
        if (!access || !refresh || !userId) {
            await handleLogout();
            return;
        }
        try {
            const resp = await fetch(API_ROUTES.doctorAppointments(docId), {
                method: "GET",
                headers: {Authorization: `Bearer ${access}`},
            });
            if (!resp.ok) {
                if (resp.status === 401 || resp.status === 403) {
                    await handleLogout();
                    return;
                }
                let msg = "Não foi possível verificar a disponibilidade do médico.";
                try {
                    const j = await resp.json();
                    if (j?.message) msg = j.message;
                    else if (j?.detail) msg = j.detail;
                } catch (_) {
                }
                setDoctorApptsError(msg);
                setDoctorBookedMap({});
                setDoctorRecurring([]);
                return;
            }
            const list = await resp.json();
            const map: Record<string, string[]> = {};
            const recurring: { startDate: string; time: string; recurrence: string; }[] = [];
            if (Array.isArray(list)) {
                for (const it of list) {
                    const d = typeof it?.date === "string" ? it.date : "";
                    const tRaw = typeof it?.time === "string" ? it.time : "";
                    const t = tRaw ? tRaw.slice(0, 5) : ""; // HH:MM
                    const recName = (it?.recurrence_type?.name || "").toLowerCase();
                    if (!d || !t) continue;
                    if (!map[d]) map[d] = [];
                    if (!map[d].includes(t)) map[d].push(t);
                    if (recName === "semanal" || recName === "quinzenal") {
                        recurring.push({startDate: d, time: t, recurrence: recName});
                    }
                }
            }
            setDoctorBookedMap(map);
            setDoctorRecurring(recurring);
        } catch (e) {
            setDoctorApptsError("Falha de rede ao verificar disponibilidade do médico.");
            setDoctorBookedMap({});
            setDoctorRecurring([]);
        } finally {
            setDoctorApptsLoading(false);
        }
    }, [handleLogout]);

    React.useEffect(() => {
        if (doctorId) {
            loadDoctorAppointments(doctorId);
        }
    }, [doctorId, loadDoctorAppointments]);

    React.useEffect(() => {
        const loadPlans = async () => {
            setPlansLoading(true);
            setPlansError(null);
            try {
                const access = localStorage.getItem("jwt_access");
                const refresh = localStorage.getItem("jwt_refresh");
                const userId = localStorage.getItem("user_id");
                if (!access || !refresh || !userId) {
                    await handleLogout();
                    return;
                }
                const resp = await fetch(API_ROUTES.healthPlans, {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${access}`,
                    },
                });
                if (!resp.ok) {
                    if (resp.status === 401 || resp.status === 403) {
                        await handleLogout();
                        return;
                    }
                    let message = "Não foi possível carregar os tipos de consulta.";
                    try {
                        const j = await resp.json();
                        if (j?.message) message = j.message;
                        else if (j?.detail) message = j.detail;
                    } catch (_) {
                    }
                    setPlansError(message);
                    setPlans([]);
                    return;
                }
                const list = await resp.json();
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
                if (!recurrence && filtered.length > 0) {
                    setRecurrence(filtered[0].name);
                }
            } catch (e) {
                setPlansError("Falha de rede ao carregar tipos de consulta.");
                setPlans([]);
            } finally {
                setPlansLoading(false);
            }
        };
        loadPlans();
    }, [patientPlan]);

    const loadAppointments = React.useCallback(async () => {
        if (!patientId) return;
        setAppointmentsLoading(true);
        setAppointmentsError(null);
        let access: string | null = null;
        let refresh: string | null = null;
        let userId: string | null = null;
        try {
            access = localStorage.getItem("jwt_access");
            refresh = localStorage.getItem("jwt_refresh");
            userId = localStorage.getItem("user_id");
        } catch (_) {
        }
        if (!access || !refresh || !userId) {
            await handleLogout();
            return;
        }
        try {
            const resp = await fetch(API_ROUTES.patientAppointments(patientId), {
                method: "GET",
                headers: {Authorization: `Bearer ${access}`},
            });
            if (!resp.ok) {
                if (resp.status === 401 || resp.status === 403) {
                    await handleLogout();
                    return;
                }
                let msg = "Não foi possível carregar seus agendamentos.";
                try {
                    const j = await resp.json();
                    if (j?.message) msg = j.message;
                    else if (j?.detail) msg = j.detail;
                } catch (_) {
                }
                setAppointmentsError(msg);
                setAppointments([]);
                return;
            }
            const list = await resp.json();
            const mapped: Appointment[] = Array.isArray(list)
                ? list.map((it) => {
                    const d = it?.doctor || {};
                    const rec = it?.recurrence_type || {};
                    const t: string = typeof it?.time === "string" ? it.time : "";
                    const endT: string = typeof it?.end_time === "string" ? it.end_time : "";
                    const idStr: string = it?.id != null ? String(it.id) : "";
                    return {
                        id: idStr,
                        doctorId: d?.id != null ? String(d.id) : "",
                        doctorName: d?.name || "Médico",
                        doctorExpertise: d?.expertise || undefined,
                        date: it?.date || "",
                        time: t ? t.slice(0, 5) : "",
                        endTime: endT ? endT.slice(0, 5) : undefined,
                        recurrence: rec?.name || undefined,
                        createdAt: it?.created_at || new Date().toISOString(),
                    } as Appointment;
                })
                : [];
            setAppointments(mapped);
        } catch (e) {
            setAppointmentsError("Falha de rede ao carregar agendamentos.");
            setAppointments([]);
        } finally {
            setAppointmentsLoading(false);
        }
    }, [patientId]);

    React.useEffect(() => {
        if (patientId) {
            loadAppointments();
        }
    }, [patientId, loadAppointments]);

    const handleDoctorChange = (value: string) => {
        setDoctorId(value);
        setDoctorBookedMap({});
        setDoctorRecurring([]);
        setDoctorApptsError(null);
        setDate(minDate);
        setTime("");
        setRecurrence(plans[0]?.name || "");
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!patientEmail) return;
        if (!doctorId || !date || !time || !recurrence) {
            setError("Preencha todos os campos para agendar.");
            return;
        }
        if (!/^\d{2}:\d{2}$/.test(time)) {
            setError("Informe o horário no formato HH:MM.");
            return;
        }
        if (time < OPEN_TIME || time > CLOSE_TIME) {
            setError(`O horário deve estar entre ${OPEN_TIME} e ${CLOSE_TIME}.`);
            return;
        }

        const min = getNextBusinessDayString();
        if (!date) {
            setError(`A data é obrigatória e deve ser a partir de ${min} (próximo dia útil).`);
            return;
        }
        if (date < min) {
            setError(`A data deve ser a partir de ${min} (próximo dia útil).`);
            return;
        }

        const bookedForDate = doctorBookedMap[date] || [];
        if (bookedForDate.includes(time)) {
            setError("Horário indisponível para o médico selecionado nesta data.");
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

        if (!patientId) {
            setError("Não foi possível identificar o paciente logado. Faça login novamente.");
            await handleLogout();
            return;
        }

        let access: string | null = null;
        let refresh: string | null = null;
        let userId: string | null = null;
        try {
            access = localStorage.getItem("jwt_access");
            refresh = localStorage.getItem("jwt_refresh");
            userId = localStorage.getItem("user_id");
        } catch (_) {
            // ignore
        }
        if (!access || !refresh || !userId) {
            await handleLogout();
            return;
        }

        setSubmitting(true);
        try {
            const resp = await fetch(API_ROUTES.appointments, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${access}`,
                },
                body: JSON.stringify({
                    doctor: Number(doctor.id),
                    patient: Number(patientId),
                    date,
                    time,
                    recurrence_type: Number(plan.id),
                }),
            });

            if (!resp.ok) {
                if (resp.status === 401 || resp.status === 403) {
                    await handleLogout();
                    return;
                }
                let message = "Não foi possível criar o agendamento.";
                const response = await resp.json();
                if ("time" in response) {
                    message = response.time[0];
                }

                try {
                    const j = await resp.json();
                    if (j?.message) message = j.message;
                    else if (j?.detail) message = j.detail;
                } catch (_) {
                }
                setError(message);
                return;
            }

            try {
                await resp.json();
            } catch (_) {
            }
            await loadAppointments();
            setSnack("Agendamento criado com sucesso!");
            setDoctorId("");
            setDate(minDate);
            setTime(OPEN_TIME);
            setRecurrence(plans[0]?.name || "");
        } catch (err) {
            setError("Falha de rede ao criar o agendamento.");
        } finally {
            setSubmitting(false);
        }
    };

    const requestDelete = (id: string) => {
        setAppointmentsError(null);
        setConfirmDeleteId(id);
    };
    const cancelDelete = () => {
        if (!deletingId) setConfirmDeleteId(null);
    };
    const confirmDelete = async () => {
        if (!confirmDeleteId) return;
        setAppointmentsError(null);
        let access: string | null = null;
        let refresh: string | null = null;
        let userId: string | null = null;
        try {
            access = localStorage.getItem("jwt_access");
            refresh = localStorage.getItem("jwt_refresh");
            userId = localStorage.getItem("user_id");
        } catch (_) {
        }
        if (!access || !refresh || !userId) {
            await handleLogout();
            return;
        }
        setDeletingId(confirmDeleteId);
        try {
            const resp = await fetch(API_ROUTES.appointment(confirmDeleteId), {
                method: "DELETE",
                headers: {Authorization: `Bearer ${access}`},
            });
            if (!resp.ok) {
                if (resp.status === 401 || resp.status === 403) {
                    await handleLogout();
                    return;
                }
                let msg = "Não foi possível apagar o agendamento.";
                try {
                    const j = await resp.json();
                    if (j?.message) msg = j.message; else if (j?.detail) msg = j.detail;
                } catch (_) {
                }
                setAppointmentsError(msg);
                return;
            }
            setSnack("Agendamento apagado com sucesso!");
            await loadAppointments();
        } catch (e) {
            setAppointmentsError("Falha de rede ao apagar o agendamento.");
        } finally {
            setDeletingId(null);
            setConfirmDeleteId(null);
        }
    };

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
                    <Button variant="outlined" color="inherit" size="small" onClick={handleLogout}
                            disabled={loggingOut}>
                        {loggingOut ? "Saindo..." : "Sair"}
                    </Button>
                </Box>

                {/* Formulário de novo agendamento */}
                <Paper elevation={3} sx={{p: 3}}>
                    <Typography variant="h6" sx={{mb: 2}}>
                        Novo agendamento
                    </Typography>
                    <Box component="form" onSubmit={handleCreate}>
                        <Stack direction={{xs: "column", sm: "row"}} spacing={2}>
                            <FormControl fullWidth>
                                <InputLabel id="doctor-label">Médico</InputLabel>
                                <Select
                                    labelId="doctor-label"
                                    id="doctor"
                                    label="Médico"
                                    value={doctorId}
                                    onChange={(e) => handleDoctorChange(e.target.value as string)}
                                    disabled={doctorsLoading || !!doctorsError || doctors.length === 0}
                                >
                                    {doctors.map((d) => (
                                        <MenuItem key={d.id} value={d.id}>
                                            {d.expertise ? `${d.name} — ${d.expertise}` : d.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                                {doctorsLoading ? (
                                    <FormHelperText>Carregando médicos...</FormHelperText>
                                ) : doctorsError ? (
                                    <FormHelperText error>{doctorsError}</FormHelperText>
                                ) : null}
                            </FormControl>
                            <FormControl fullWidth>
                                <InputLabel id="recurrence-label">Tipo</InputLabel>
                                <Select
                                    labelId="recurrence-label"
                                    id="recurrence"
                                    label="Tipo"
                                    value={recurrence}
                                    onChange={(e) => setRecurrence(e.target.value as string)}
                                    disabled={plansLoading || !!plansError || plans.length === 0}
                                >
                                    {plans.map((p) => (
                                        <MenuItem key={p.id} value={p.name}>
                                            {p.name.charAt(0).toUpperCase() + p.name.slice(1)}
                                        </MenuItem>
                                    ))}
                                </Select>
                                {plansLoading ? (
                                    <FormHelperText>Carregando tipos de consulta...</FormHelperText>
                                ) : plansError ? (
                                    <FormHelperText error>{plansError}</FormHelperText>
                                ) : null}
                            </FormControl>
                            <TextField
                                label="Data"
                                type="date"
                                InputLabelProps={{shrink: true}}
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                inputProps={{min: minDate}}
                                helperText={`Disponível a partir de ${minDate}`}
                                fullWidth
                            />
                            <FormControl fullWidth>
                                <InputLabel id="time-label">Horário</InputLabel>
                                <Select
                                    labelId="time-label"
                                    id="time"
                                    label="Horário"
                                    value={time}
                                    onChange={(e) => setTime(e.target.value as string)}
                                    disabled={doctorApptsLoading || !!doctorApptsError || availableHourOptions.length === 0}
                                >
                                    {availableHourOptions.map((t) => (
                                        <MenuItem key={t} value={t}>
                                            {t}
                                        </MenuItem>
                                    ))}
                                </Select>
                                {doctorApptsLoading ? (
                                    <FormHelperText>Verificando disponibilidade...</FormHelperText>
                                ) : doctorApptsError ? (
                                    <FormHelperText error>{doctorApptsError}</FormHelperText>
                                ) : availableHourOptions.length === 0 ? (
                                    <FormHelperText>Sem horários disponíveis para esta data.</FormHelperText>
                                ) : (
                                    <FormHelperText>{`Disponível das ${OPEN_TIME} às ${CLOSE_TIME}`}</FormHelperText>
                                )}
                            </FormControl>
                            <Button type="submit" variant="contained"
                                    sx={{whiteSpace: "nowrap", px: 3, paddingLeft: 4, paddingRight: 4}}
                                    disabled={submitting}>
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

                {/* Lista de agendamentos */}
                <Paper elevation={1} sx={{p: 2}}>
                    <Typography variant="h6" sx={{mb: 1}}>
                        Próximas consultas
                    </Typography>
                    {appointmentsLoading ? (
                        <Typography color="text.secondary">Carregando agendamentos...</Typography>
                    ) : appointmentsError ? (
                        <Alert severity="error">{appointmentsError}</Alert>
                    ) : appointments.length === 0 ? (
                        <Typography color="text.secondary">Nenhum agendamento encontrado.</Typography>
                    ) : (
                        <List>
                            {appointments.map((a, idx) => (
                                <React.Fragment key={a.createdAt + idx}>
                                    <ListItem
                                        secondaryAction={
                                            <IconButton edge="end" aria-label="apagar"
                                                        onClick={() => requestDelete(a.id)}
                                                        disabled={deletingId === a.id}>
                                                <DeleteIcon/>
                                            </IconButton>
                                        }
                                    >
                                        <ListItemText
                                            primary={`${a.doctorName}${a.doctorExpertise ? " — " + a.doctorExpertise : ""}`}
                                            secondary={`Data: ${a.date} • Horário: ${a.time}${a.endTime ? " - " + a.endTime : ""}${a.recurrence ? " • Recorrência: " + (a.recurrence.charAt(0).toUpperCase() + a.recurrence.slice(1)) : ""}`}
                                        />
                                    </ListItem>
                                    {idx < appointments.length - 1 && <Divider component="li"/>}
                                </React.Fragment>
                            ))}
                        </List>
                    )}
                </Paper>
            </Stack>

            {/* Confirmação para apagar agendamento */}
            <Dialog open={!!confirmDeleteId} onClose={cancelDelete}>
                <DialogTitle>Confirmar exclusão</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {(() => {
                            const ap = appointments.find((x) => x.id === confirmDeleteId);
                            return ap
                                ? `Tem certeza que deseja apagar o agendamento com ${ap.doctorName} em ${ap.date} às ${ap.time}?`
                                : "Tem certeza que deseja apagar este agendamento?";
                        })()}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={cancelDelete} disabled={!!deletingId}>Cancelar</Button>
                    <Button color="error" variant="contained" onClick={confirmDelete} disabled={!!deletingId}>
                        {deletingId ? "Apagando..." : "Apagar"}
                    </Button>
                </DialogActions>
            </Dialog>

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
        </Container>
    );
}
