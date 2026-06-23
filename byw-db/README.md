# byw-db

Proyecto de migraciones incrementales para la base de datos **BetYouWin**.

- **Motor:** MySQL 8.4
- **Base de datos:** `betyouwin` (mismo nombre en todos los entornos)
- **Herramienta:** [db-migrate](https://github.com/db-migrate/node-db-migrate)

## Requisitos

- Node.js >= 18
- MySQL 8.4 en ejecucion
- Base de datos `betyouwin` creada previamente

```sql
CREATE DATABASE betyouwin
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
```

## Configuracion

1. Instalar dependencias:

```bash
npm install
```

2. Copiar variables de entorno:

```bash
cp .env.example .env
```

3. Editar `.env` con los datos de tu instancia local.

## Comandos

| Comando | Descripcion |
|---------|-------------|
| `npm run db:up` | Aplica migraciones pendientes (entorno `dev` por defecto) |
| `npm run db:down` | Revierte la ultima migracion |
| `npm run db:create -- nombre-migracion` | Crea una nueva migracion |
| `npm run db:status` | Simula `up` sin aplicar cambios |

### Entornos

Usar la variable `-e` de db-migrate:

```bash
npx db-migrate up -e dev
npx db-migrate up -e test
npx db-migrate up -e prod
```

## Convenciones de nombres

Objetos de base de datos en **espanol**, usando solo caracteres ASCII (sin ene ni acentos):

| Correcto | Incorrecto |
|----------|------------|
| `usuarios` | `users`, `usuários` |
| `configuracion` | `configuración` |
| `fecha_creacion` | `created_at` |

### Migraciones

- Formato: `YYYYMMDDHHMMSS-descripcion-corta.js`
- Toda migracion debe implementar `up` y `down`
- Una responsabilidad por migracion (una tabla, un indice, un cambio acotado)
- Sin tablas de negocio en el scaffolding inicial; se agregan incrementalmente

## Estructura

```
byw-db/
├── database.json       # Configuracion por entorno
├── migrations/         # Scripts incrementales
├── package.json
├── .env.example
└── README.md
```
