---
name: analizar-ticket
description: >-
  Analiza la completitud de un issue de Linear (1-10) mediante lectura del ticket,
  preguntas iterativas al usuario y actualizacion aprobada de la descripcion hasta
  dejarlo listo para planificar (9-10). Usar cuando el usuario pida analizar un ticket,
  evaluar si un issue esta bien definido, refinar la descripcion de Linear, o invoque
  esta skill por nombre.
disable-model-invocation: true
---

# Analizar ticket

## Objetivo

Tomar un **issue de Linear** como entrada, medir qué tan bien definido está para generar un plan de implementación futuro, cerrar huecos con preguntas al usuario y **actualizar la descripción del ticket** (solo con aprobación explícita) en iteraciones hasta alcanzar **completitud 9–10**.

**Output obligatorio:** puntuación de completitud **1–10** (10 = 100 % definido, 0 = nada definido).

| Rango | Significado |
|-------|-------------|
| **9–10** | Listo para planificar. No requiere otra iteración de refinamiento. |
| **7–8** | Casi listo; faltan 1–2 puntos menores o ambiguos. |
| **4–6** | Parcialmente definido; alcance o criterios incompletos. |
| **1–3** | Idea vaga; falta contexto esencial. |
| **0** | Sin definición útil (solo título o vacío). |

Cuando el score sea **≥ 9**, indicar que el ticket puede pasar a planificación con la skill **`planificar-ticket`**.

## Entrada

Aceptar cualquiera de:

- Identificador (`BET-5`, `HMX-42`, etc.)
- URL de Linear
- Texto pegado del ticket (si Linear MCP no está disponible)

## Antes de llamar a Linear MCP

1. Localizar descriptores en `mcps/user-linear/tools/*.json`.
2. **Leer el schema** de cada herramienta antes de usarla (`get_issue`, `save_issue`, `save_comment`).
3. En payloads markdown, usar **saltos de línea reales**, no `\n` escapados.
4. Si el workspace tiene `AGENTS.md`, leerlo para contrastar el ticket con el estado real del repo (componentes existentes, convenciones, issues relacionados).

Si Linear MCP falla o no está disponible, continuar con el texto que proporcione el usuario y avisar que no se podrá actualizar Linear automáticamente.

## Dimensiones de completitud

Evaluar el ticket en estas dimensiones (peso orientativo entre paréntesis):

| Dimensión | Qué debe quedar claro |
|-----------|------------------------|
| **Problema / objetivo** (15 %) | Qué se resuelve y por qué importa. |
| **Alcance** (15 %) | Qué entra y qué queda explícitamente fuera. |
| **Criterios de aceptación** (20 %) | Condiciones verificables de “hecho”. |
| **Contexto técnico** (15 %) | Módulos, capas o archivos afectados según el repo actual. |
| **Reglas de negocio** (10 %) | Validaciones, restricciones, casos especiales. |
| **Dependencias** (10 %) | Issues bloqueantes, APIs externas, migraciones previas. |
| **Verificación** (10 %) | Cómo probar (manual, comandos, datos de prueba). |
| **Riesgos / edge cases** (5 %) | Ambigüedades conocidas o decisiones pendientes documentadas. |

Para el desglose detallado del cálculo del score, ver [rubrica.md](rubrica.md).

## Flujo iterativo

```
Cargar ticket → Evaluar dimensiones → Calcular score
       ↓
  Score ≥ 9? ──sí──→ Reportar score + “listo para planificar” → FIN
       │
      no
       ↓
Formular preguntas (solo huecos) → Usuario responde
       ↓
Redactar descripción propuesta → Usuario aprueba?
       │
      sí → save_issue (description) → comentario opcional con score → nueva iteración
      no → Ajustar según feedback → volver a “descripción propuesta”
```

### Paso 1 — Cargar y leer

- Obtener issue con `get_issue` (incluir relaciones si hay bloqueos o duplicados sospechados).
- Leer título, descripción, labels, estado, proyecto, comentarios recientes si aportan contexto.
- Contrastar con `AGENTS.md` y búsqueda ligera en el repo: no inventar módulos que no existan.

### Paso 2 — Evaluar y puntuar

- Marcar cada dimensión: **completa**, **parcial** o **ausente**.
- Calcular score 0–10 según [rubrica.md](rubrica.md).
- Listar brevemente qué falta y por qué baja el score.

### Paso 3 — Preguntar (solo lo necesario)

- Agrupar preguntas por dimensión faltante o ambigua.
- Priorizar lo que más impacta el score (criterios de aceptación y alcance primero).
- Usar `AskQuestion` cuando encaje; si no, preguntas numeradas en el chat.
- **No** preguntar lo que ya está claro en el ticket o en `AGENTS.md`.
- Máximo **5–7 preguntas** por iteración; si hay más huecos, priorizar y dejar el resto para la siguiente vuelta.

### Paso 4 — Proponer descripción actualizada

Mostrar al usuario:

1. Score actual y score estimado tras incorporar respuestas.
2. **Descripción propuesta completa** (markdown), usando la plantilla de abajo.
3. Resumen de cambios respecto a la descripción anterior.

**No** llamar a `save_issue` hasta recibir aprobación explícita (“aprobado”, “actualiza”, “sí, guarda”, etc.).

### Paso 5 — Actualizar Linear (tras aprobación)

- `save_issue` con `id` del issue y `description` con la versión aprobada.
- Opcional: `save_comment` con una línea del tipo: `Análisis de completitud: X/10 (iteración N).`
- Volver al **Paso 2** con la descripción ya persistida.

### Paso 6 — Condición de salida

- **Score ≥ 9:** terminar. Entregar reporte final (ver plantilla de salida). No abrir otra ronda de preguntas salvo que el usuario lo pida.
- **Score < 9:** si el usuario quiere seguir, nueva iteración; si no, reportar score actual y qué falta para llegar a 9.

## Plantilla de descripción en Linear

Al redactar o actualizar la descripción, usar esta estructura (omitir secciones no aplicables; no dejar placeholders sin resolver):

```markdown
## Objetivo
[Qué problema resuelve y resultado esperado]

## Alcance
### Incluido
- ...

### Fuera de alcance
- ...

## Criterios de aceptación
- [ ] ...
- [ ] ...

## Contexto técnico
[Componentes, rutas, tablas o APIs según el repo actual]

## Reglas de negocio
[Validaciones y restricciones relevantes]

## Dependencias
[Issues, migraciones, servicios externos]

## Verificación
[Cómo validar manualmente o con comandos]

## Notas y riesgos
[Edge cases, decisiones tomadas, preguntas abiertas menores]
```

Preservar enlaces, imágenes o referencias útiles de la descripción original.

## Plantilla de salida al usuario

Cada iteración y el cierre deben incluir:

```markdown
## Análisis de completitud — [IDENTIFICADOR] Título

**Completitud: X/10** — [listo para planificar | requiere otra iteración]

### Desglose por dimensión
| Dimensión | Estado | Nota breve |
|-----------|--------|------------|
| ... | completa / parcial / ausente | ... |

### Huecos cerrados en esta iteración
- ...

### Pendiente (si score < 9)
- ...

### Próximo paso
[Si ≥ 9: invocar planificación. Si < 9: responder preguntas o aprobar descripción propuesta.]
```

## Anti-patrones

- Actualizar Linear sin aprobación explícita del usuario.
- Inventar alcance técnico no respaldado por el repo o `AGENTS.md`.
- Dar score ≥ 9 con criterios de aceptación vagos o sin verificación.
- Hacer más de una iteración de preguntas cuando el score ya es ≥ 9.
- Llamar herramientas MCP sin leer antes su schema JSON.
- Sustituir el título del issue sin que el usuario lo pida.

## Relación con otras skills

- **`analizar-ticket`** (esta): refina y puntúa el ticket **antes** de planificar.
- **`planificar-ticket`**: valida completitud ≥ 9, genera plan por features y crea sub-issues (con aprobación).
- **`implementar-ticket`**: implementa un sub-issue en la rama del padre; marca In Progress y Done.
- **`linear-ticket-run`**: flujo genérico con plan y aprobación para issues raíz u otros casos.
