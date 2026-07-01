'use client';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import NextLink from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ApiError } from '@/lib/api';

export default function RegistroPage() {
  const { register, user, isLoading } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [nombreCompleto, setNombreCompleto] = useState('');
  const [dni, setDni] = useState('');
  const [direccion, setDireccion] = useState('');
  const [telefono, setTelefono] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && user) {
      router.replace('/cuenta');
    }
  }, [isLoading, user, router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await register({
        email,
        nombreCompleto,
        dni,
        direccion,
        telefono,
        password,
      });
      router.push('/login?registered=1');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo completar el registro');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Paper sx={{ p: 4 }}>
      <Typography variant="h5" component="h1" gutterBottom>
        Crear cuenta
      </Typography>

      {error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      ) : null}

      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'grid', gap: 2 }}>
        <TextField
          label="Email"
          type="email"
          autoComplete="email"
          required
          fullWidth
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <TextField
          label="Nombre completo"
          required
          fullWidth
          value={nombreCompleto}
          onChange={(event) => setNombreCompleto(event.target.value)}
        />
        <TextField
          label="DNI"
          required
          fullWidth
          slotProps={{ htmlInput: { inputMode: 'numeric', pattern: '[0-9]*' } }}
          value={dni}
          onChange={(event) => setDni(event.target.value)}
        />
        <TextField
          label="Direccion"
          required
          fullWidth
          value={direccion}
          onChange={(event) => setDireccion(event.target.value)}
        />
        <TextField
          label="Telefono"
          required
          fullWidth
          value={telefono}
          onChange={(event) => setTelefono(event.target.value)}
        />
        <TextField
          label="Contrasena"
          type="password"
          autoComplete="new-password"
          required
          fullWidth
          helperText="Minimo 8 caracteres"
          slotProps={{ htmlInput: { minLength: 8 } }}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        <Button type="submit" variant="contained" disabled={submitting}>
          {submitting ? 'Registrando...' : 'Registrarse'}
        </Button>
      </Box>

      <Typography variant="body2" sx={{ mt: 2 }}>
        ¿Ya tienes cuenta?{' '}
        <Link component={NextLink} href="/login">
          Inicia sesion
        </Link>
      </Typography>
    </Paper>
  );
}
