"use client";

import {ThemeProvider} from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import {createTheme} from "@mui/material/styles";

const theme = createTheme();

export function AppThemeProvider({children}: { children: React.ReactNode }) {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline/>
            {children}
        </ThemeProvider>
    );
}