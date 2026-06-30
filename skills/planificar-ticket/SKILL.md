---
name: planificar-ticket
description: >-
  Genera un plan por features a partir de un issue de Linear con completitud 9-10,
  propone sub-issues con descripciones y los crea tras aprobacion explicita.
  Falla y detiene si el ticket no esta listo para planificar. Usar cuando el usuario
  pida planificar un ticket, dividir un issue en subtareas, crear sub-issues en Linear,
  o invoque esta skill por nombre (tras analizar-ticket).
disable-model-invocation: true
---

# Planificar ticket

## Objetivo

Tomar un **issue de Linear ya refinado** (completitud lista para planificar), validar que cumple el umbral, generar una **planificación por features** y proponer **sub-issues** (uno por tarea). Tras **aprobación explícita** del usuario, crear los sub-issues en Linear bajo el ticket padre.

**Output obligatorio (antes de crear nada):** lista numerada de tareas propuestas, cada una con **título** y **descripción** (markdown).

## Prerrequisito: ticket listo para planificar

**Umbral:** completitud **≥ 9** (misma escala que `analizar-ticket`).

### Validación (obligatoria al inicio)

1. Cargar el issue con `get_issue`.
2. Evaluar si está listo usando **una** de estas vías (en orden):
   - **Comentario de análisis:** buscar en comentarios (`list_comments`) un patrón `completitud: **N/10**` o `Completitud: N/10` con **N ≥ 9**.
   - **Descripción estructurada:** si no hay comentario, aplicar la rubrica de [analizar-ticket](../analizar-ticket/rubrica.md) sobre la descripción actual (secciones objetivo, alcance, criterios de aceptación, contexto técnico, etc.).
3. Si **N < 9** o la descripción no alcanza el umbral:
   - **Detener** el flujo inmediatamente.
   - Informar el score estimado y qué falta.
   - Indicar ejecutar primero **`analizar-ticket`**.
   - **No** generar plan ni proponer sub-issues.

### Condición de fallo (stop)

```
❌ Ticket no listo para planificar (completitud X/10).
   Ejecuta analizar-ticket sobre [IDENTIFICADOR] antes de planificar.
```

No continuar bajo ningún concepto si el umbral no se cumple, salvo que el usuario pida explícitamente re-analizar en la misma sesión con `analizar-ticket`.

## Entrada

- Identificador Linear (`BET-5`, URL, etc.)
- Opcional: restricciones del usuario (orden de tareas, excluir features, tamaño máximo de subtareas)

## Antes de llamar a Linear MCP

1. Leer schemas en `mcps/user-linear/tools/*.json`.
2. Herramientas típicas: `get_issue`, `list_comments`, `list_issues`, `save_issue`, `save_comment`.
3. Markdown con saltos de línea reales, no `\n` escapados.
4. Leer `AGENTS.md` del workspace para alinear el plan con el repo real (carpetas, convenciones, ramas).

## Flujo

```
Cargar ticket → Validar completitud ≥ 9
       ↓
      no → FALLAR y DETENER
       ↓
      sí
       ↓
Revisar sub-issues existentes (list_issues parentId)
       ↓
Generar plan por features → Lista de tareas (título + descripción)
       ↓
Mostrar output al usuario → ¿Aprueba?
       ↓
      no → Ajustar según feedback → volver a lista propuesta
       ↓
      sí → Crear sub-issues (save_issue + parentId) → Comentario en padre → FIN
```

### Paso 1 — Contexto

- Issue padre: título, descripción, equipo, proyecto, prioridad, labels, assignee.
- `list_issues` con `parentId` = identificador del padre: si ya hay sub-issues, **no duplicar**; avisar y proponer solo tareas nuevas o pedir confirmación para reemplazar/plan parcial.

### Paso 2 — Planificar por features

Dividir el trabajo en **features cohesivas** (módulos, dominios o verticales end-to-end), no en micro-tareas atomicas.

Criterios de división:

| Preferir | Evitar |
|----------|--------|
| Un feature = un bounded context (auth, apuestas, partidos) | Una tarea por endpoint suelto |
| Orden de dependencias claro (scaffolding → dominio → integración) | Tareas que mezclen frontend si el padre es solo backend |
| Cada feature entregable y testeable por sí misma | Sub-issues genericos ("implementar API") |

Cada tarea propuesta debe incluir en su descripción:

- Objetivo de la subtarea
- Alcance incluido / excluido (subset del padre)
- Criterios de aceptación heredados o derivados del padre (checkboxes)
- Dependencias entre subtareas (referencia por orden o por título)
- Verificación (comandos o pruebas concretas)
- Contexto técnico (rutas, módulos NestJS, tablas, etc. cuando aplique)

Plantilla de descripción para sub-issues: [plantilla-subissue.md](plantilla-subissue.md).

### Paso 3 — Output al usuario (antes de crear)

Presentar siempre esta estructura:

```markdown
## Planificación — [IDENTIFICADOR] Título del padre

**Completitud validada:** N/10 ✓

### Resumen del plan
[1–2 párrafos: enfoque, orden de ejecución, riesgos]

### Tareas propuestas (N)

#### 1. [Título subtarea]
**Descripción:**
[markdown completo de la subtarea]

#### 2. [Título subtarea]
...

### Orden sugerido
1. ... → 2. ... → ...

### Dependencias entre subtareas
- Tarea B depende de Tarea A
- ...

---
**Acción requerida:** revisa la lista. Responde **aprobado** / **actualiza** / cambios puntuales.
No se crearán sub-issues en Linear hasta tu aprobación explícita.
```

### Paso 4 — Aprobación

Frases que autorizan creación: `aprobado`, `apruebo`, `crea las tareas`, `sí, crea`, `adelante`.

Sin aprobación explícita: **no** llamar a `save_issue` para crear hijos.

### Paso 5 — Crear sub-issues (tras aprobación)

Por cada tarea aprobada, `save_issue` **sin** `id`:

| Campo | Valor |
|-------|--------|
| `title` | Título de la subtarea (conciso, sin prefijo redundante del ID padre) |
| `description` | Descripción aprobada (plantilla sub-issue) |
| `team` | Mismo equipo que el padre |
| `parentId` | Identificador del issue padre (ej. `BET-5`) |
| `project` | Mismo proyecto que el padre (si tiene) |
| `priority` | Igual o ligeramente menor que el padre; no inflar sin motivo |
| `labels` | Subconjunto relevante del padre (ej. `Feature`) |

Opcional por subtarea: `blockedBy` con identificadores de subtareas ya creadas cuando el orden sea crítico.

Tras crear todas:

- `save_comment` en el padre resumiendo plan y enlaces a sub-issues creados (`BET-5.1` o los IDs que devuelva Linear).
- Entregar al usuario la lista final con **ID Linear** de cada sub-issue creado.

### Paso 6 — Errores parciales

Si falla la creación de algún sub-issue:

- Reportar cuáles se crearon y cuál falló.
- No reintentar en bucle; pedir al usuario cómo proceder.

## Anti-patrones

- Planificar un ticket con completitud &lt; 9.
- Crear sub-issues sin aprobación.
- Duplicar sub-issues existentes sin avisar.
- Micro-tareas por archivo o por endpoint.
- Ignorar `AGENTS.md` e inventar estructura de repo.
- Omitir criterios de aceptación en las descripciones de subtareas.
- Llamar MCP sin leer schemas.

## Relación con otras skills

| Skill | Rol |
|-------|-----|
| `analizar-ticket` | Refina descripción hasta completitud ≥ 9 (**antes** de esta skill). |
| `planificar-ticket` | Divide en sub-issues planificados (**esta skill**). |
| `implementar-ticket` | Implementa un sub-issue en la rama del padre; In Progress → Done. |
| `linear-ticket-run` | Flujo genérico con plan y aprobación (issues raíz u otros casos). |

Flujo recomendado: `analizar-ticket` → `planificar-ticket` → `implementar-ticket` por cada sub-issue.
