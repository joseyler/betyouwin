# Rubrica de completitud (1–10)

Usar esta rubrica de forma consistente en cada iteración.

## Estados por dimensión

| Estado | Criterio |
|--------|----------|
| **Completa** | Información concreta, accionable y sin ambigüedad relevante. |
| **Parcial** | Hay algo escrito pero falta detalle, es genérico o hay contradicciones menores. |
| **Ausente** | No aparece o es tan vago que no sirve para planificar. |

## Pesos

| Dimensión | Peso |
|-----------|------|
| Problema / objetivo | 15 % |
| Alcance | 15 % |
| Criterios de aceptación | 20 % |
| Contexto técnico | 15 % |
| Reglas de negocio | 10 % |
| Dependencias | 10 % |
| Verificación | 10 % |
| Riesgos / edge cases | 5 % |

## Cálculo

1. Asignar a cada dimensión un valor numérico:
   - Completa → **1.0**
   - Parcial → **0.5**
   - Ausente → **0.0**
2. `score_raw = Σ (valor × peso)` → resultado entre 0 y 1.
3. `score = redondear(score_raw × 10)` → entero 0–10.

### Ajustes manuales (±1 como máximo)

Aplicar solo con justificación explícita en el reporte:

| Situación | Ajuste |
|-----------|--------|
| Criterios de aceptación medibles y verificables | +1 si el raw quedó en 8 |
| Contradicción grave entre alcance y criterios | −1 |
| Dependencia bloqueante no resuelta y crítica | −1 |
| Ticket duplicado o obsoleto detectado | cap máximo 3 |

## Anchors por score

| Score | Perfil típico |
|-------|----------------|
| **10** | Todas las dimensiones completas; un planificador no necesita preguntas. |
| **9** | Una dimensión menor en “parcial” (p. ej. riesgos) o nota menor documentada; suficiente para planificar. |
| **8** | Falta precisión en 1–2 dimensiones importantes (p. ej. verificación o contexto técnico). |
| **6–7** | Objetivo claro pero AC o alcance incompletos. |
| **4–5** | Solo problema y algo de contexto; sin AC verificables. |
| **2–3** | Título + párrafo vago. |
| **0–1** | Vacío o incomprensible fuera de contexto. |

## Umbral de planificación

**Score ≥ 9** → listo para planificar; no iniciar otra iteración de refinamiento salvo petición explícita del usuario.
