"use client";

import React, {useState} from "react";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";
import Alert from "@mui/material/Alert";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import Snackbar from "@mui/material/Snackbar";
import {Appointment} from "@/app/lib/types";
import {AppointmentController} from "@/app/controllers/appointment-controller";
import {DeleteConfirmDialog} from "./dialogs/DeleteConfirmDialog";

interface AppointmentListProps {
    appointments: Appointment[];
    loading: boolean;
    error: string | null;
    onDelete: () => void;
    onAuthError: () => void;
}

export function AppointmentList({
                                    appointments,
                                    loading,
                                    error,
                                    onDelete,
                                    onAuthError,
                                }: AppointmentListProps) {
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [deleteError, setDeleteError] = useState<string | null>(null);
    const [snack, setSnack] = useState<string | null>(null);

    const requestDelete = (id: string) => {
        setDeleteError(null);
        setConfirmDeleteId(id);
    };

    const cancelDelete = () => {
        if (!deletingId) setConfirmDeleteId(null);
    };

    const confirmDelete = async () => {
        if (!confirmDeleteId) return;
        setDeleteError(null);
        setDeletingId(confirmDeleteId);

        try {
            await AppointmentController.delete(confirmDeleteId);
            setSnack("Agendamento apagado com sucesso!");
            onDelete();
        } catch (e) {
            const message = e instanceof Error ? e.message : "Erro ao apagar agendamento";
            if (message.includes("401") || message.includes("403")) {
                onAuthError();
            } else {
                setDeleteError(message);
            }
        } finally {
            setDeletingId(null);
            setConfirmDeleteId(null);
        }
    };

    const selectedAppointment = appointments.find((a) => a.id === confirmDeleteId);

    return (
        <>
            <Paper elevation={1} sx={{p: 2}}>
                <Typography variant="h6" sx={{mb: 1}}>
                    Próximas consultas
                </Typography>

                {loading ? (
                    <Typography color="text.secondary">Carregando agendamentos...</Typography>
                ) : error ? (
                    <Alert severity="error">{error}</Alert>
                ) : deleteError ? (
                    <Alert severity="error">{deleteError}</Alert>
                ) : appointments.length === 0 ? (
                    <Typography color="text.secondary">Nenhum agendamento encontrado.</Typography>
                ) : (
                    <List>
                        {appointments.map((appointment, idx) => (
                            <React.Fragment key={appointment.createdAt + idx}>
                                <ListItem
                                    secondaryAction={
                                        <IconButton
                                            edge="end"
                                            aria-label="apagar"
                                            onClick={() => requestDelete(appointment.id)}
                                            disabled={deletingId === appointment.id}
                                        >
                                            <DeleteIcon/>
                                        </IconButton>
                                    }
                                >
                                    <ListItemText
                                        primary={`${appointment.doctorName}${
                                            appointment.doctorExpertise
                                                ? " — " + appointment.doctorExpertise
                                                : ""
                                        }`}
                                        secondary={`Data: ${appointment.date} • Horário: ${appointment.time}${
                                            appointment.endTime ? " - " + appointment.endTime : ""
                                        }${
                                            appointment.recurrence
                                                ? " • Recorrência: " +
                                                (appointment.recurrence.charAt(0).toUpperCase() +
                                                    appointment.recurrence.slice(1))
                                                : ""
                                        }`}
                                    />
                                </ListItem>
                                {idx < appointments.length - 1 && <Divider component="li"/>}
                            </React.Fragment>
                        ))}
                    </List>
                )}
            </Paper>

            <DeleteConfirmDialog
                open={!!confirmDeleteId}
                appointment={selectedAppointment}
                deleting={!!deletingId}
                onCancel={cancelDelete}
                onConfirm={confirmDelete}
            />

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