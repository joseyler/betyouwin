# byw-api

Backend REST de **BetYouWin** (NestJS + TypeORM + MySQL).

## Requisitos

- Node.js >= 18
- MySQL 8.4 con base `betyouwin` migrada (`byw-db/`)

## Configuracion

```bash
cp .env.example .env
```

Variables (compatibles con `byw-db/`):

| Variable | Descripcion |
|----------|-------------|
| `DB_HOST` | Host MySQL |
| `DB_PORT` | Puerto MySQL |
| `DB_USER` | Usuario |
| `DB_PASSWORD` | Contrasena |
| `DB_NAME` | Base de datos (`betyouwin`) |
| `PORT` | Puerto HTTP (default 3000) |

## Migraciones

Aplicar esquema desde el modulo de base de datos:

```bash
cd ../byw-db
npm install
cp .env.example .env   # si aun no existe
npm run db:up
```

## Desarrollo

```bash
npm install
npm run start:dev
```

Verificar conexion:

```bash
curl http://localhost:3000/health
```

Respuesta esperada: `{ "status": "ok", "database": "connected" }`.

## Scripts

| Comando | Uso |
|---------|-----|
| `npm run build` | Compilar |
| `npm run start` | Produccion |
| `npm run start:dev` | Desarrollo con watch |
| `npm run test` | Unit tests |
| `npm run test:e2e` | E2E (requiere MySQL) |
| `npm run lint` | ESLint |

## Entidades TypeORM

Mapean las tablas de BET-7 sin `synchronize` (esquema gestionado por `byw-db/`):

- `equipos`
- `usuarios`
- `partidos`
- `apuestas`
- `transacciones`

## Zona horaria de partidos

Los horarios en `partidos.fecha_hora` se almacenan en **hora del este (ET)** segun el calendario FIFA. La API expone ese valor tal como esta en la base de datos.

## Rama de trabajo

Este modulo se desarrolla en la rama del issue padre BET-5:

`features/BET-5.crearBackend`
