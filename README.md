# betyouwin

Plataforma BetYouWin — Mundial 2026.

## Proyectos

| Carpeta | Descripcion |
|---------|-------------|
| [`byw-db/`](byw-db/) | Migraciones incrementales de MySQL 8.4 |
| [`byw-api/`](byw-api/) | Backend NestJS + TypeORM |
| [`byw-web/`](byw-web/) | Frontend Next.js + MUI |
| [`byw-qa/`](byw-qa/) | Tests E2E UI con Playwright |

## Arranque rapido con Docker

Levanta MySQL, aplica migraciones, API y web en un solo comando:

```bash
cp docker/.env.example docker/.env
docker compose --env-file docker/.env up --build
```

Tests E2E en Docker (contenedor `qa`):

```bash
docker compose --env-file docker/.env --profile test run --rm qa
```

O pipeline completo:

```bash
docker compose --env-file docker/.env --profile test up --build --abort-on-container-exit qa
```

Detalle completo en [docker/README.md](docker/README.md).

## Desarrollo local (sin Docker)

Ver README de cada proyecto:

- [byw-db/README.md](byw-db/README.md) — migraciones
- [byw-api/README.md](byw-api/README.md) — API
- [byw-web/](byw-web/) — frontend (`npm run dev` en `:3001`)
- [byw-qa/README.md](byw-qa/README.md) — Playwright
