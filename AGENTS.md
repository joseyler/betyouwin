# AGENTS.md

Guia de contexto para agentes de IA que trabajan en **BetYouWin**.

## General AI Agents Instruction

- Prioriza cambios minimos y alineados con el codigo existente.
- No inventes modulos, APIs ni flujos que el repositorio aun no tenga.
- Antes de modificar esquema de base de datos, usa migraciones incrementales en `byw-db/`.
- Consulta issues en Linear (proyecto **BetYouWin**, equipo **Betyouwin**) para entender alcance y estado.
- Para operaciones en GitHub (ramas remotas, PRs, archivos en remoto), prefiere **GitHub MCP** cuando este disponible; usa git local para clonar, checkout y trabajo en working tree.
- No commitees secretos (`.env`, tokens, credenciales).
- Solo crea commits o PRs cuando el usuario lo pida explicitamente.

## Repository Overview

**BetYouWin** es una plataforma de apuestas deportivas sobre el Mundial de futbol 2026. Los usuarios se registran, cargan saldo en pesos, apuestan a partidos y el sistema registra transacciones de ingreso, retiro, apuesta y ganancia.

| Recurso | Ubicacion |
|---------|-----------|
| Repositorio | https://github.com/joseyler/betyouwin |
| Issue tracking | Linear — proyecto `BetYouWin` |
| Rama de integracion | `develop` |
| Rama por defecto en GitHub | `main` (tambien existen `master` y `develop`) |

### Estado actual del repo

| Componente | Estado |
|------------|--------|
| `byw-db/` | Implementado (BET-6, BET-7) |
| Backend (BET-5) | Pendiente — aun no hay carpeta en el repo |
| Frontend | Pendiente — no iniciado |

## Architecture and Major Components

```
betyouwin/
├── AGENTS.md
├── README.md
└── byw-db/                 # Migraciones MySQL (db-migrate)
    ├── migrations/
    │   ├── data/             # Seeds y datos estaticos de migraciones
    │   └── *.js
    ├── database.json
    ├── package.json
    └── README.md
```

### Modelo de dominio (base de datos)

Tablas principales definidas en `byw-db/migrations/20260623231331-script-inicial-tablas.js`:

| Tabla | Rol |
|-------|-----|
| `equipos` | 48 selecciones del Mundial 2026 |
| `partidos` | 104 partidos (grupos + eliminatorias) |
| `usuarios` | Registro por email, DNI, datos personales, `password_hash` |
| `apuestas` | Apuesta por usuario y partido (unica por par usuario/partido) |
| `transacciones` | Ledger de movimientos en pesos |

Reglas de negocio relevantes para el backend:

- **Saldo:** no hay columna `saldo_pesos` en `usuarios`; se calcula desde `transacciones`.
- **Tipos de apuesta:** `ganador`, `empate`, `resultado_exacto` (mayor premio).
- **Tope de apuesta:** el monto no puede superar el saldo disponible (validar en aplicacion).
- **Una apuesta por partido:** restriccion `UNIQUE (usuario_id, partido_id)`.
- **Partidos eliminatorios:** pueden tener `equipo_local_id` / `equipo_visitante_id` en `NULL` hasta definir enfrentamiento; usan `descripcion`.

### Calculo de saldo (referencia)

```sql
SELECT COALESCE(SUM(
  CASE tipo
    WHEN 'ingreso' THEN monto_pesos
    WHEN 'ganancia' THEN monto_pesos
    WHEN 'retiro' THEN -monto_pesos
    WHEN 'apuesta' THEN -monto_pesos
  END
), 0) AS saldo_pesos
FROM transacciones
WHERE usuario_id = ?;
```

## Critical Workflows

### Base de datos (`byw-db/`)

```bash
cd byw-db
npm install
cp .env.example .env   # configurar credenciales locales
npm run db:up          # aplicar migraciones (entorno dev)
npm run db:down        # revertir ultima migracion
npm run db:create -- nombre-migracion
npm run db:status      # dry-run
```

Requisitos: Node.js >= 18, MySQL 8.4, base `betyouwin` creada con `utf8mb4`.

### Git y ramas

Convencion de ramas de feature (alineada con Linear):

```
joseeyler/bet-<numero>-<descripcion-corta>
```

Ejemplos existentes:

- `joseeyler/bet-6-generar-script-de-base-de-datos`
- `joseeyler/bet-7-crear-tablas-iniciales` (implementado en rama de BET-6)

Flujo esperado: feature branch → PR hacia `develop`.

### Issues en Linear

- Crear/actualizar issues y comentarios via **Linear MCP**.
- Al cerrar un issue, mover estado a `Done` y dejar un comentario con resumen de implementacion (rama, archivos clave, decisiones).

## Project-Specific Conventions

### Base de datos

- Motor: **MySQL 8.4**
- Nombre de base: **`betyouwin`** (igual en dev, test y prod)
- Objetos en **espanol ASCII** (sin ene, sin acentos): `usuarios`, `fecha_creacion`, `direccion`
- Migraciones con **db-migrate**: toda migracion debe tener `up` y `down`
- Formato de archivo: `YYYYMMDDHHMMSS-descripcion-corta.js`
- Una responsabilidad por migracion
- Datos estaticos grandes (seeds) pueden ir en `byw-db/migrations/data/`

### Seguridad

- Passwords solo como hash en `usuarios.password_hash` (nunca en claro en DB)
- DNI: unico, solo digitos (`CHECK` en DB)
- No versionar `.env`

### Codigo

- JavaScript en migraciones: `'use strict'`
- Mantener consistencia con el estilo del archivo que se modifica (callbacks vs promesas en db-migrate)

## Key Dependencies and Integration Points

| Herramienta | Uso |
|-------------|-----|
| `db-migrate` + `db-migrate-mysql` | Migraciones incrementales |
| `dotenv` | Variables de entorno en scripts npm |
| Linear MCP | Issues, estados, comentarios |
| GitHub MCP | Repositorio `joseyler/betyouwin`, ramas, PRs, archivos remotos |

Variables de entorno en `byw-db/.env`:

```
DB_HOST, DB_PORT, DB_USER, DB_PASSWORD
```

## Common Gotchas

1. **MySQL local:** el usuario suele tener instancia local propia (no Docker en el repo). Verificar credenciales en `.env` antes de correr migraciones.
2. **GitHub MCP `create_branch`:** puede fallar con `Not Found`; en ese caso usar git local para crear y pushear ramas.
3. **Linear MCP OAuth:** si falla auth, revisar procesos `node` huerfanos en puertos de callback OAuth y limpiar `~/.mcp-auth`.
4. **Horarios de partidos:** almacenados en hora del este (ET) segun calendario FIFA; documentar si el backend expone otra zona horaria.
5. **Apuestas en eliminatorias:** validar en backend que los equipos del partido esten definidos antes de permitir apostar.
6. **README de `byw-db`:** la nota sobre "sin tablas de negocio" quedo desactualizada tras BET-7; el esquema inicial ya incluye tablas y seed del Mundial 2026.

## Linear Issues (referencia)

| Issue | Titulo | Estado |
|-------|--------|--------|
| BET-5 | Crear backend | In Progress |
| BET-6 | Generar script de base de datos | Done |
| BET-7 | Crear tablas iniciales | Done |
