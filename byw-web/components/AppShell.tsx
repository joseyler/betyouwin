'use client';

import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Container from '@mui/material/Container';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAdmin, isLoading, logout } = useAuth();

  return (
    <>
      <AppBar position="static">
        <Toolbar sx={{ gap: 2 }}>
          <Typography
            variant="h6"
            component={Link}
            href="/"
            sx={{ color: 'inherit', textDecoration: 'none', flexGrow: 1 }}
          >
            BetYouWin
          </Typography>

          {!isLoading && user ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'block' } }}>
                {user.email}
              </Typography>
              {isAdmin ? <Chip label="Admin" size="small" color="secondary" /> : null}
              <Button color="inherit" component={Link} href="/cuenta" size="small">
                Mi cuenta
              </Button>
              <Button color="inherit" onClick={logout} size="small">
                Salir
              </Button>
            </Box>
          ) : !isLoading ? (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button color="inherit" component={Link} href="/login" size="small">
                Ingresar
              </Button>
              <Button
                color="inherit"
                component={Link}
                href="/registro"
                size="small"
                variant="outlined"
                sx={{ borderColor: 'rgba(255,255,255,0.5)' }}
              >
                Registrarse
              </Button>
            </Box>
          ) : null}
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {children}
      </Container>
    </>
  );
}
