# byw-qa

Pruebas E2E de interfaz para **BetYouWin** con [Playwright](https://playwright.dev/). El navegador interactúa con `byw-web`; la API y la base de datos deben estar en ejecución.

## Prerrequisitos

- Node.js >= 18
- Chromium de Playwright (`npx playwright install chromium`)
- Stack en marcha: `byw-api` (`:3000`), `byw-web` (`:3001`), MySQL con migraciones

## Opcion A — Docker (recomendado)

Stack + tests en contenedor:

```bash
cp docker/.env.example docker/.env
docker compose --env-file docker/.env up --build -d
docker compose --env-file docker/.env --profile test run --rm qa
```

Pipeline en un solo comando:

```bash
docker compose --env-file docker/.env --profile test up --build --abort-on-container-exit qa
```

Cambiar suite vía `QA_NPM_SCRIPT` en `docker/.env` (`test`, `test:smoke`, `test:registro`).

Ver [docker/README.md](../docker/README.md) para más comandos.

## Opcion B — Servicios locales

```bash
cd byw-db && npm run db:up
cd ../byw-api && npm run start:dev
cd ../byw-web && npm run dev
```

## Configuración

```bash
cd byw-qa
npm install
npx playwright install chromium
cp .env.example .env   # opcional
```

Variables en `.env`:

| Variable | Default | Uso |
|----------|---------|-----|
| `WEB_URL` | `http://localhost:3001` | `baseURL` Playwright (debe coincidir con `CORS_ORIGIN` en API) |
| `API_URL` | `http://127.0.0.1:3000` | Setup de datos via `request` en tests |

## Ejecutar tests

```bash
# Suite completa
npm test

# Solo smoke
npm run test:smoke

# Solo registro
npm run test:registro

# Subconjunto por grep
npm test -- --grep registro

# Navegador visible
npm run test:ui
```

## Estructura

```
byw-qa/
├── tests/          # specs Playwright
├── helpers/        # utilidades compartidas
├── playwright.config.ts
└── .env.example
```

## Notas

- Playwright corre en el **host**; con Docker los puertos `3000` y `3001` deben estar publicados en `localhost`.
- `WEB_URL` debe ser `http://localhost:3001` (no `127.0.0.1`) para alinear con CORS de `byw-api`.
