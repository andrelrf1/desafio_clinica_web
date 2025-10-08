import React from "react";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormHelperText from "@mui/material/FormHelperText";
import {Doctor} from "@/app/lib/types";

interface DoctorSelectProps {
    value: string;
    onChange: (value: string) => void;
    doctors: Doctor[];
    loading: boolean;
    error: string | null;
}

export function DoctorSelect({value, onChange, doctors, loading, error}: DoctorSelectProps) {
    return (
        <FormControl fullWidth>
            <InputLabel id="doctor-label">Médico</InputLabel>
            <Select
                labelId="doctor-label"
                id="doctor"
                label="Médico"
                value={value}
                onChange={(e) => onChange(e.target.value as string)}
                disabled={loading || !!error || doctors.length === 0}
            >
                {doctors.map((doctor) => (
                    <MenuItem key={doctor.id} value={doctor.id}>
                        {doctor.expertise ? `${doctor.name} — ${doctor.expertise}` : doctor.name}
                    </MenuItem>
                ))}
            </Select>
            {loading ? (
                <FormHelperText>Carregando médicos...</FormHelperText>
            ) : error ? (
                <FormHelperText error>{error}</FormHelperText>
            ) : null}
        </FormControl>
    );
}