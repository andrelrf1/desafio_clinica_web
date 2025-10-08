import React from "react";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormHelperText from "@mui/material/FormHelperText";
import {HealthPlan} from "@/app/lib/types";

interface RecurrenceSelectProps {
    value: string;
    onChange: (value: string) => void;
    plans: HealthPlan[];
    loading: boolean;
    error: string | null;
}

export function RecurrenceSelect({value, onChange, plans, loading, error}: RecurrenceSelectProps) {
    return (
        <FormControl fullWidth>
            <InputLabel id="recurrence-label">Tipo</InputLabel>
            <Select
                labelId="recurrence-label"
                id="recurrence"
                label="Tipo"
                value={value}
                onChange={(e) => onChange(e.target.value as string)}
                disabled={loading || !!error || plans.length === 0}
            >
                {plans.map((plan) => (
                    <MenuItem key={plan.id} value={plan.name}>
                        {plan.name.charAt(0).toUpperCase() + plan.name.slice(1)}
                    </MenuItem>
                ))}
            </Select>
            {loading ? (
                <FormHelperText>Carregando tipos de consulta...</FormHelperText>
            ) : error ? (
                <FormHelperText error>{error}</FormHelperText>
            ) : null}
        </FormControl>
    );
}