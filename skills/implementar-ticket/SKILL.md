---
name: implementar-ticket
description: >-
  Implementa un sub-issue de Linear (padre obligatorio): usa la rama del ticket padre
  segun AGENTS.md, marca In Progress al iniciar y Done al cerrar, ejecuta el alcance
  y criterios de aceptacion del subticket. Usar cuando el usuario pida implementar
  un subticket, trabajar BET-* hijo, o invoque esta skill por nombre.
disable-model-invocation: true
---

# Implementar ticket

## Objetivo

Tomar un **sub-issue de Linear** (debe tener ticket padre), implementar en código lo descrito en su descripción y criterios de aceptación, usando la **rama del issue padre** según `AGENTS.md`. Actualizar el estado en Linear: **In Progress** al comenzar, **Done** al finalizar con éxito.

## Entrada

- Identificador del **sub-issue** (`BET-8`, URL, etc.)
- Opcional: instrucciones adicionales del usuario (prioridades, atajos)

## Validación inicial (obligatoria)

1. Cargar el issue con `get_issue`.
2. Verificar que tiene **`parentId`** (o campo equivalente de padre en la respuesta).
3. Si **no tiene padre**:
   - **Detener** inmediatamente.
   - Mensaje: este skill solo aplica a sub-issues; usar `linear-ticket-run` o planificar primero con `planificar-ticket`.
4. Cargar el **issue padre** con `get_issue` usando `parentId`.
5. Si el sub-issue ya está **Done** o **Canceled**, avisar y no reimplementar salvo petición explícita.

### Condición de fallo (sin padre)

```
❌ [IDENTIFICADOR] no es un sub-issue (sin padre).
   Usa planificar-ticket sobre el ticket padre o linear-ticket-run para issues raíz.
```

## Antes de llamar a Linear MCP

1. Leer schemas en `mcps/user-linear/tools/*.json` (`get_issue`, `save_issue`, `save_comment`, `list_issue_statuses` si hace falta).
2. Markdown con saltos de línea reales.
3. Leer `AGENTS.md` del workspace (rama, convenciones, estructura del repo).

## Rama de trabajo (del padre, no del hijo)

La rama **siempre** se deriva del **ticket padre**, nunca del sub-issue.

### Formato (`AGENTS.md`)

```
features/BET-{number}.{lineartitle}
```

| Parte | Origen |
|-------|--------|
| `{number}` | Número del issue **padre** (ej. `5` para BET-5) |
| `{lineartitle}` | Título del **padre** en lowerCamelCase ASCII |

### Cómo obtener `{lineartitle}`

1. Título del padre (ej. `Crear backend`).
2. Normalizar a ASCII (sin acentos ni eñe).
3. Separar palabras; quitar puntuación.
4. Primera palabra en minúscula; siguientes con inicial mayúscula.
5. Unir sin espacios → `crearBackend`.

Ejemplo: padre **BET-5** «Crear backend» → `features/BET-5.crearBackend` (válido para BET-8, BET-9, etc.).

### Git (antes de editar)

```bash
git checkout develop
git pull origin develop
git checkout -b features/BET-{n}.{lineartitle}   # si la rama no existe
# o
git checkout features/BET-{n}.{lineartitle}      # si ya existe
```

No usar ramas sugeridas por Linear en el hijo (`joseeyler/bet-8-...`); la convención vigente es la del padre en `AGENTS.md`.

## Flujo

```
Cargar sub-issue → ¿Tiene padre? ──no──→ FALLAR
       ↓ sí
Cargar padre → Calcular rama → Checkout rama
       ↓
save_issue sub-issue: state = In Progress
       ↓
Leer descripción/AC → Mapear al repo → Plan breve en chat
       ↓
Implementar (alcance del sub-issue únicamente)
       ↓
Validar (lint / build / tests según ticket y proyecto)
       ↓
¿AC cumplidos y validación OK? ──no──→ Comentar bloqueo; NO marcar Done
       ↓ sí
save_issue sub-issue: state = Done
save_comment: resumen y cómo verificar
       ↓
Reporte final al usuario
```

### Paso 1 — Marcar In Progress

Al **iniciar** la implementación (antes de cambios sustanciales):

- `save_issue` con `id` del sub-issue y `state`: `In Progress` (o nombre exacto del equipo en Linear).
- Opcional: `assignee`: `me` si el usuario trabaja el ticket.

### Paso 2 — Contexto de implementación

Del **sub-issue** extraer:

- Objetivo, alcance incluido/excluido
- Criterios de aceptación (checklist)
- Contexto técnico (rutas, módulos, comandos)
- Dependencias con otros sub-issues (orden si aplica)

Del **padre** tener presente el contexto global sin implementar fuera del alcance del hijo.

Contrastar con el repo real; no inventar módulos inexistentes.

### Paso 3 — Plan breve

Antes de editar, mostrar en el chat:

1. Sub-issue y padre (IDs y títulos)
2. Rama usada
3. Archivos/módulos a tocar
4. Cómo se verificará cada criterio de aceptación

Si el sub-issue es ambiguo o le faltan AC, **preguntar** una cosa concreta o asumir explícitamente en el plan; no implementar a ciegas.

### Paso 4 — Implementar

- Cambios **mínimos** y acotados al sub-issue.
- Reutilizar patrones del repo (`byw-api/`, `byw-db/`, etc.).
- Respetar dependencias: si el sub-issue requiere otro sub-issue previo no mergeado, detener y avisar.

### Paso 5 — Validar

Ejecutar comandos pertinentes según el ticket y el componente:

| Componente | Comandos típicos |
|------------|------------------|
| `byw-api/` | `npm run lint`, `npm run build`, `npm run test`, `npm run test:e2e` |
| `byw-db/` | `npm run db:status`, migraciones según ticket |

Corregir fallos **introducidos** por este trabajo antes de cerrar.

**No** marcar **Done** si la validación falla o faltan AC del sub-issue.

### Paso 6 — Marcar Done

Solo si implementación y validación están completas:

- `save_issue` con `id` del sub-issue y `state`: `Done`.
- `save_comment` en el sub-issue: resumen orientado a verificación manual (sin listar archivos ni detalles de código; ver `AGENTS.md`).
- Mencionar rama y comandos de verificación.

Si queda trabajo pendiente, dejar **In Progress** y explicar qué falta.

## Plantilla de salida al usuario

```markdown
## Implementación — [SUB-ID] Título

**Padre:** [PARENT-ID] Título  
**Rama:** `features/BET-n.lineartitle`  
**Estado Linear:** In Progress → Done

### Cambios realizados
[Resumen conciso]

### Criterios de aceptación
- [x] ...
- [ ] ... (si quedó pendiente)

### Validación
| Comando | Resultado |
|---------|-----------|
| ... | OK / falló |

### Cómo verificar manualmente
[Pasos ligados a los AC del sub-issue]

### Pendiente / riesgos
[Si aplica]
```

## Anti-patrones

- Implementar un issue sin `parentId`.
- Usar rama del sub-issue en lugar de la del padre.
- Marcar **Done** con lint/build/tests fallidos.
- Implementar alcance de otros sub-issues o del padre completo en un solo hijo.
- Drive-by refactors ajenos al ticket.
- Commits o PRs sin que el usuario lo pida.
- Llamar MCP sin leer schemas.

## Relación con otras skills

| Skill | Rol |
|-------|-----|
| `analizar-ticket` | Refina el ticket padre (completitud ≥ 9). |
| `planificar-ticket` | Crea sub-issues bajo el padre. |
| `implementar-ticket` | **Implementa un sub-issue** (**esta skill**). |
| `linear-ticket-run` | Flujo genérico con plan + aprobación; issues raíz o cualquier ticket. |

Flujo recomendado BetYouWin: `analizar-ticket` → `planificar-ticket` → **`implementar-ticket`** por cada sub-issue (BET-8, BET-9, …).
