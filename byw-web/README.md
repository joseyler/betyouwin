# byw-web

Frontend de **BetYouWin** (Next.js App Router + TypeScript + Material UI).

## Requisitos

- Node.js >= 18
- `byw-api` en ejecución (puerto 3000 por defecto)

## Configuracion

```bash
cp .env.example .env
```

| Variable | Descripcion |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | URL base de la API (default `http://localhost:3000`) |

En `byw-api`, configurar `CORS_ORIGIN=http://localhost:3001` para desarrollo local.

## Cliente API

El modulo `lib/api.ts` centraliza las llamadas HTTP:

- `getApiUrl()` — base URL configurada.
- `apiFetch<T>(path, options?)` — fetch con JSON, errores como `ApiError`.
- `options.token` — agrega header `Authorization: Bearer`.

Ejemplo:

```typescript
import { apiFetch } from '@/lib/api';

const health = await apiFetch<{ status: string; database: string }>('/health');
```

## Desarrollo

```bash
npm install
npm run dev
```

La app corre en [http://localhost:3001](http://localhost:3001).

## Scripts

| Comando | Uso |
|---------|-----|
| `npm run dev` | Servidor de desarrollo (puerto 3001) |
| `npm run build` | Build de produccion |
| `npm run start` | Servir build |
| `npm run lint` | ESLint |
