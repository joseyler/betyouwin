# Plantilla de descripción para sub-issues

Usar al redactar cada subtarea propuesta y al crear el sub-issue en Linear.

```markdown
## Objetivo
[Qué entrega esta subtarea dentro del issue padre]

## Alcance
### Incluido
- ...

### Excluido
- ...

## Criterios de aceptación
- [ ] ...
- [ ] ...

## Contexto técnico
[Rutas, módulos, tablas, endpoints — según AGENTS.md y descripción del padre]

## Dependencias
- Subtarea previa: [título o ID]
- Issue padre: [IDENTIFICADOR]

## Verificación
```bash
# comandos concretos
```

## Notas
[Decisiones, edge cases menores, enlaces al padre]
```

Reglas:

- Heredar reglas de negocio del padre; no contradecirlas.
- Cada subtarea debe poder cerrarse de forma independiente con sus AC.
- Si la subtarea es la primera (scaffolding), incluir creación de carpeta/proyecto y conexión a dependencias compartidas.
