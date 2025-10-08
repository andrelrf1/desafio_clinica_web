import React from "react";
import TextField from "@mui/material/TextField";

interface DateFieldProps {
    value: string;
    onChange: (value: string) => void;
    minDate: string;
}

export function DateField({value, onChange, minDate}: DateFieldProps) {
    return (
        <TextField
            label="Data"
            type="date"
            InputLabelProps={{shrink: true}}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            inputProps={{min: minDate}}
            helperText={`Disponível a partir de ${minDate}`}
            fullWidth
        />
    );
}