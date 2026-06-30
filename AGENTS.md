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
- Para cada issue BET, trabaja en una rama creada desde `develop` con el formato `features/BET-{number}.{lineartitle}` (ver seccion Git y ramas).

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
| `byw-api/` | En progreso (BET-5) — modulos core implementados (BET-8 a BET-13); pendiente suite e2e integral (BET-14) |
| Frontend | Pendiente — no iniciado |

## Architecture and Major Components

```
betyouwin/
├── AGENTS.md
├── README.md
├── byw-api/                # Backend NestJS + TypeORM (BET-5)
│   ├── src/
│   │   ├── auth/           # JWT, guards, @Public(), @Roles()
│   │   ├── usuarios/       # registro, login, saldo
│   │   ├── transacciones/  # ingreso, retiro, ledger
│   │   ├── partidos/       # listado publico, admin PATCH
│   │   ├── apuestas/       # CRUD apuestas del usuario
│   │   ├── liquidacion/    # premios al finalizar/cancelar partido
│   │   ├── entities/       # entidades TypeORM (5 tablas)
│   │   └── common/enums.ts
│   └── test/               # e2e por modulo
└── byw-db/                 # Migraciones MySQL (db-migrate)
    ├── migrations/
    │   ├── data/           # Seeds y datos estaticos de migraciones
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
- **Partido iniciado (apuestas):** `estado <> 'programado'` **o** `fecha_hora <= ahora` bloquea crear/editar/eliminar apuestas.
- **Liquidacion (MVP):** al finalizar partido, apuestas `pendiente` se evaluan; coeficientes: `ganador` 2x, `empate` 3x, `resultado_exacto` 6x. Ganadoras: `estado=ganada`, `premio_pesos`, transaccion `ganancia`. Perdedoras: `estado=perdida`. Partido `cancelado`: apuestas `pendiente` pasan a `cancelada` sin premio. Solo se procesan apuestas `pendiente` (idempotente).
- **Estados de apuesta:** `pendiente`, `ganada`, `perdida`, `cancelada`.

### API REST (`byw-api/`)

Auth global con JWT (`JwtAuthGuard`); rutas marcadas `@Public()` no requieren token. Admin: email en `ADMIN_EMAIL` recibe `role=admin` en el token.

| Metodo | Ruta | Auth | Descripcion |
|--------|------|------|-------------|
| GET | `/health` | publico | Estado app y DB |
| POST | `/usuarios/registro` | publico | Alta de usuario |
| POST | `/usuarios/login` | publico | Devuelve JWT |
| GET | `/usuarios/saldo` | usuario | Saldo calculado desde transacciones |
| POST | `/transacciones/ingreso` | usuario | Credito |
| POST | `/transacciones/retiro` | usuario | Debito (valida saldo) |
| GET | `/partidos` | publico | Listado con filtros (`grupo`, `fecha`, `equipo`, `fase`) |
| PATCH | `/partidos/:id` | admin | Asignar equipos (eliminatorias), goles, estado |
| GET | `/apuestas` | usuario | Apuestas del usuario autenticado |
| POST | `/apuestas` | usuario | Crear apuesta (debita transaccion `apuesta`) |
| PATCH | `/apuestas/:id` | usuario | Actualizar apuesta pendiente |
| DELETE | `/apuestas/:id` | usuario | Eliminar apuesta pendiente |
| GET | `/auth/me` | usuario | Perfil del token |
| GET | `/auth/admin` | admin | Ruta de prueba admin |

Liquidacion: no expone endpoints propios; se dispara al `PATCH` de partido cuando el estado pasa a `finalizado` o `cancelado` (eventos `partido.finalizado` / `partido.cancelado`).

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

### Backend (`byw-api/`)

```bash
cd byw-api
npm install
cp .env.example .env   # DB + JWT_SECRET + ADMIN_EMAIL
npm run start:dev      # http://localhost:3000
```

Scripts utiles:

| Comando | Uso |
|---------|-----|
| `npm run build` | Compilar |
| `npm run lint` | ESLint |
| `npm run test` | Unit tests |
| `npm run test:e2e` | Suite e2e completa |
| `npm run test:e2e -- apuestas` | e2e modulo apuestas |
| `npm run test:e2e -- liquidacion` | e2e liquidacion de premios |

Detalle de variables y rutas: `byw-api/README.md`.

### Git y ramas

Toda feature asociada a un issue **BET** debe desarrollarse en una rama creada desde `develop`.

#### Formato obligatorio

```
features/BET-{number}.{lineartitle}
```

| Parte | Regla |
|-------|-------|
| Prefijo | Siempre `features/` |
| `{number}` | Numero del issue Linear sin ceros extra (ej. `6`, `7`, `12`) |
| `{lineartitle}` | Titulo del issue en Linear, sin espacios, en **camelCase** (lowerCamelCase) |

#### Como obtener `{lineartitle}` desde Linear

1. Tomar el **titulo** del issue (ej. `Generar script de base de datos`).
2. Normalizar a ASCII: quitar acentos y ene (ej. `direccion`, no `dirección`).
3. Separar en palabras, ignorar signos de puntuacion.
4. Primera palabra en minuscula; cada palabra siguiente con inicial mayuscula.
5. Unir sin espacios.

Ejemplos:

| Issue | Titulo Linear | Rama |
|-------|---------------|------|
| BET-5 | Crear backend | `features/BET-5.crearBackend` |
| BET-6 | Generar script de base de datos | `features/BET-6.generarScriptDeBaseDeDatos` |
| BET-7 | Crear tablas iniciales | `features/BET-7.crearTablasIniciales` |

#### Flujo

```bash
git checkout develop
git pull origin develop
git checkout -b features/BET-7.crearTablasIniciales
# ... trabajo ...
# PR hacia develop
```

> **Nota:** existen ramas historicas con convencion anterior (`joseeyler/bet-6-...`). No usarlas como referencia; la convencion vigente es `features/BET-{number}.{lineartitle}`.

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
| NestJS + TypeORM + mysql2 | Backend `byw-api/` |
| `@nestjs/jwt`, `passport-jwt` | Autenticacion JWT |
| `@nestjs/event-emitter` | Eventos de liquidacion de partidos |
| Linear MCP | Issues, estados, comentarios |
| GitHub MCP | Repositorio `joseyler/betyouwin`, ramas, PRs, archivos remotos |

Variables de entorno en `byw-db/.env`:

```
DB_HOST, DB_PORT, DB_USER, DB_PASSWORD
```

Variables de entorno en `byw-api/.env` (ademas de DB):

```
DB_NAME, PORT, JWT_SECRET, JWT_EXPIRES_IN, ADMIN_EMAIL
```

## Common Gotchas

1. **MySQL local:** el usuario suele tener instancia local propia (no Docker en el repo). Verificar credenciales en `.env` antes de correr migraciones.
2. **GitHub MCP `create_branch`:** puede fallar con `Not Found`; en ese caso usar git local para crear y pushear ramas.
3. **Linear MCP OAuth:** si falla auth, revisar procesos `node` huerfanos en puertos de callback OAuth y limpiar `~/.mcp-auth`.
4. **Horarios de partidos:** almacenados en hora del este (ET) segun calendario FIFA; documentar si el backend expone otra zona horaria.
5. **Apuestas en eliminatorias:** validar en backend que los equipos del partido esten definidos antes de permitir apostar.
6. **Tests e2e de apuestas/liquidacion:** si la fase de grupos ya paso (fecha actual >= ultimo partido de grupos), los tests usan eliminatorias futuras con equipos asignados por admin via `PATCH /partidos/:id`.
7. **README de `byw-db`:** la nota sobre "sin tablas de negocio" quedo desactualizada tras BET-7; el esquema inicial ya incluye tablas y seed del Mundial 2026.

## Linear Issues (referencia)

| Issue | Titulo | Rama esperada | Estado |
|-------|--------|---------------|--------|
| BET-5 | Crear backend | `features/BET-5.crearBackend` | In Progress |
| BET-6 | Generar script de base de datos | `features/BET-6.generarScriptDeBaseDeDatos` | Done |
| BET-7 | Crear tablas iniciales | `features/BET-7.crearTablasIniciales` | Done |
| BET-8 | Scaffolding byw-api y entidades TypeORM | `features/BET-5.crearBackend` | Done |
| BET-9 | Autenticacion JWT y autorizacion admin | `features/BET-5.crearBackend` | Done |
| BET-10 | Modulo usuarios, saldo y transacciones | `features/BET-5.crearBackend` | Done |
| BET-11 | Modulo partidos (consulta y administracion) | `features/BET-5.crearBackend` | Done |
| BET-12 | Modulo apuestas (CRUD y reglas de negocio) | `features/BET-5.crearBackend` | Done |
| BET-13 | Liquidacion de premios al finalizar partido | `features/BET-5.crearBackend` | Done |
| BET-14 | Suite e2e integral | `features/BET-5.crearBackend` | Pendiente |

> Los sub-issues de BET-5 comparten la rama del padre (`features/BET-5.crearBackend`), no la rama sugerida por Linear en cada hijo.
