# Docker — BetYouWin (dev / QA)

Orquesta MySQL 8.4, migraciones (`byw-db`), API (`byw-api`), frontend (`byw-web`) y opcionalmente tests E2E (`byw-qa`) dentro de Compose.

## Prerrequisitos

- Docker Desktop (o Docker Engine + Compose v2)

## Configuración

```bash
# Desde la raíz del monorepo
cp docker/.env.example docker/.env
```

### URLs según modo

| Modo | `CORS_ORIGIN` | `NEXT_PUBLIC_API_URL` | Dónde corre Playwright |
|------|---------------|------------------------|-------------------------|
| **Tests en Docker** (recomendado) | `http://web:3001` | `http://api:3000` | Contenedor `qa` |
| **Tests en el host** | `http://localhost:3001` | `http://localhost:3000` | `cd byw-qa && npm test` |

Los valores por defecto en `.env.example` están orientados al **contenedor qa**.

## Levantar el stack

```bash
docker compose --env-file docker/.env up --build -d
```

Orden: **mysql** → **migrate** → **api** → **web**

Verificar:

```bash
curl http://localhost:3000/health
curl -I http://localhost:3001
```

## Tests E2E en Docker (contenedor `qa`)

Con el stack en marcha (`-d`):

```bash
docker compose --env-file docker/.env --profile test run --rm qa
```

Pipeline completo (stack + tests; termina al finalizar qa):

```bash
docker compose --env-file docker/.env --profile test up --build --abort-on-container-exit qa
```

Variables en `docker/.env`:

| Variable | Default | Descripción |
|----------|---------|-------------|
| `QA_WEB_URL` | `http://web:3001` | `baseURL` de Playwright |
| `QA_API_URL` | `http://api:3000` | Setup API en tests |
| `QA_NPM_SCRIPT` | `test:registro` | Script npm a ejecutar (`test`, `test:smoke`, etc.) |

Ejemplo — suite completa:

```bash
QA_NPM_SCRIPT=test docker compose --env-file docker/.env --profile test run --rm qa
```

## Tests E2E en el host (opcional)

Requiere `CORS_ORIGIN=http://localhost:3001` y `NEXT_PUBLIC_API_URL=http://localhost:3000` en `docker/.env`, luego **rebuild** de `web`:

```bash
docker compose --env-file docker/.env up --build -d
cd byw-qa
npm install
npx playwright install chromium
npm run test:registro
```

## Comandos útiles

```bash
# Logs
docker compose --env-file docker/.env logs -f api web

# Re-ejecutar migraciones
docker compose --env-file docker/.env up migrate --build

# Detener
docker compose --env-file docker/.env down

# Reset DB
docker compose --env-file docker/.env down -v
```

## Estructura

```
docker/
├── .env.example
├── Dockerfile.migrate
├── Dockerfile.api
├── Dockerfile.web
├── Dockerfile.qa
└── README.md
docker-compose.yml
```

## Notas

- El servicio `qa` usa el profile **`test`** y no arranca con un `up` normal (solo stack).
- Si **3000** / **3001** están ocupados en el host, cambiá `PORT_API` / `PORT_WEB` en `docker/.env`.
- Si **3306** está ocupado, usá `MYSQL_PORT=3307`.
