'use client';

import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useAuth } from '@/contexts/AuthContext';

export default function CuentaPage() {
  const { user, isAdmin } = useAuth();

  return (
    <>
      <Typography variant="h4" component="h1" gutterBottom>
        Mi cuenta
      </Typography>
      <Stack spacing={1}>
        <Typography variant="body1">
          <strong>Email:</strong> {user?.email}
        </Typography>
        <Typography variant="body1">
          <strong>Rol:</strong> {user?.role}
        </Typography>
        {isAdmin ? <Chip label="Administrador" color="secondary" sx={{ alignSelf: 'flex-start' }} /> : null}
      </Stack>
    </>
  );
}
