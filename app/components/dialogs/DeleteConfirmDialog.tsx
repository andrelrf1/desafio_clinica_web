import React from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import {Appointment} from "@/app/lib/types";

interface DeleteConfirmDialogProps {
    open: boolean;
    appointment?: Appointment;
    deleting: boolean;
    onCancel: () => void;
    onConfirm: () => void;
}

export function DeleteConfirmDialog({
                                        open,
                                        appointment,
                                        deleting,
                                        onCancel,
                                        onConfirm,
                                    }: DeleteConfirmDialogProps) {
    return (
        <Dialog open={open} onClose={onCancel}>
            <DialogTitle>Confirmar exclusão</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    {appointment
                        ? `Tem certeza que deseja apagar o agendamento com ${appointment.doctorName} em ${appointment.date} às ${appointment.time}?`
                        : "Tem certeza que deseja apagar este agendamento?"}
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={onCancel} disabled={deleting}>
                    Cancelar
                </Button>
                <Button color="error" variant="contained" onClick={onConfirm} disabled={deleting}>
                    {deleting ? "Apagando..." : "Apagar"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}