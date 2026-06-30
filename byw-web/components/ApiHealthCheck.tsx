'use client';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import { ApiError, apiFetch, getApiUrl } from '@/lib/api';

interface HealthResponse {
  status: string;
  database: string;
}

type CheckState =
  | { kind: 'loading' }
  | { kind: 'ok'; data: HealthResponse }
  | { kind: 'error'; message: string };

export default function ApiHealthCheck() {
  const [state, setState] = useState<CheckState>({ kind: 'loading' });

  useEffect(() => {
    let active = true;

    apiFetch<HealthResponse>('/health')
      .then((data) => {
        if (active) {
          setState({ kind: 'ok', data });
        }
      })
      .catch((error: unknown) => {
        if (!active) {
          return;
        }

        const message =
          error instanceof ApiError
            ? `${error.status}: ${error.message}`
            : error instanceof Error
              ? error.message
              : 'Error de conexion';

        setState({ kind: 'error', message });
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        API: {getApiUrl()}
      </Typography>

      {state.kind === 'loading' && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CircularProgress size={20} />
          <Typography variant="body2">Verificando conexion...</Typography>
        </Box>
      )}

      {state.kind === 'ok' && (
        <Alert severity="success">
          Conexion OK — status: {state.data.status}, database:{' '}
          {state.data.database}
        </Alert>
      )}

      {state.kind === 'error' && (
        <Alert severity="error">
          No se pudo conectar con la API: {state.message}
        </Alert>
      )}
    </Box>
  );
}
