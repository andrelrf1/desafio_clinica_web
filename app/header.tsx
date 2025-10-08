"use client";

import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { usePathname } from "next/navigation";

export default function Header() {
  const pathname = usePathname();
  const [, setHasSession] = React.useState<boolean>(false);

  React.useEffect(() => {
    try {
      const email = localStorage.getItem("patient_email");
      setHasSession(!!email);
    } catch (_) {
      setHasSession(false);
    }
  }, [pathname]);

  const showHeader = pathname === "/agendamentos";
  if (!showHeader) return null;

  return (
    <AppBar position="static" color="primary" enableColorOnDark>
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ display: "flex", gap: 2 }}>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Clínica Desafio
          </Typography>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
