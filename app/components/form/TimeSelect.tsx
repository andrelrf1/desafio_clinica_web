import React from "react";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormHelperText from "@mui/material/FormHelperText";

interface TimeSelectProps {
    value: string;
    onChange: (value: string) => void;
    options: string[];
    loading: boolean;
    error: string | null;
    openTime: string;
    closeTime: string;
}

export function TimeSelect({
                               value,
                               onChange,
                               options,
                               loading,
                               error,
                               openTime,
                               closeTime,
                           }: TimeSelectProps) {
    return (
        <FormControl fullWidth>
            <InputLabel id="time-label">Horário</InputLabel>
            <Select
                labelId="time-label"
                id="time"
                label="Horário"
                value={value}
                onChange={(e) => onChange(e.target.value as string)}
                disabled={loading || !!error || options.length === 0}
            >
                {options.map((time) => (
                    <MenuItem key={time} value={time}>
                        {time}
                    </MenuItem>
                ))}
            </Select>
            {loading ? (
                <FormHelperText>Verificando disponibilidade...</FormHelperText>
            ) : error ? (
                <FormHelperText error>{error}</FormHelperText>
            ) : options.length === 0 ? (
                <FormHelperText>Sem horários disponíveis para esta data.</FormHelperText>
            ) : (
                <FormHelperText>{`Disponível das ${openTime} às ${closeTime}`}</FormHelperText>
            )}
        </FormControl>
    );
}