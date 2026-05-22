# Registro sugerido en GitHub Issues / GitHub Project

La consigna solicita gestionar los casos de prueba en una plataforma colaborativa. Para este proyecto se usó GitHub Issues en los repositorios del proyecto.
- To Do / Inicio
- In Progress / En Proceso
- Done / Aprobada
- Failed / Fallida

Project creado:

```text
https://github.com/orgs/Proyecto-grado-ucc/projects/2
```

Campo de estado usado: `Status`.

## Registro final en GitHub

Los casos tecnicos iniciales y los casos manuales principales fueron separados en issues individuales para que cada prueba tenga trazabilidad propia dentro del Project.

| Caso | Issue | Estado Project |
| --- | --- | --- |
| CAL-QA-001 | #15 `CAL-QA-001 - Validacion de disponibilidad del frontend` | Done |
| CAL-QA-002 | #16 `CAL-QA-002 - Validacion de disponibilidad del backend` | Done |
| CAL-QA-003 | #17 `CAL-QA-003 - Latencia inicial del frontend` | Done |
| CAL-QA-004 | #18 `CAL-QA-004 - Latencia inicial del backend` | Done |
| CAL-QA-005 | #19 `CAL-QA-005 - Prueba de carga ligera del backend` | Done |
| CAL-QA-006 | #20 `CAL-QA-006 - Validacion W3C del HTML publico` | Done |
| CAL-QA-007 | #5 `CAL-QA-007 - Accesibilidad automatizada con Lighthouse` | Todo |
| CAL-QA-008 | #4 `CAL-QA-008 - Rendimiento inicial con Lighthouse` | Todo |
| CAL-QA-009 | #21 `CAL-QA-009 - Buenas practicas web con Lighthouse` | Done |
| CAL-QA-010 | #22 `CAL-QA-010 - Pruebas unitarias frontend` | Done |
| CAL-QA-011 | #3 `CAL-QA-011 - Pruebas unitarias backend` | Todo |
| CAL-QA-012 | #23 `CAL-QA-012 - Cobertura backend` | In Progress |
| CAL-QA-013 | #24 `CAL-QA-013 - Conectividad por traceroute` | In Progress |
| CAL-QA-014 | #8 `CAL-QA-014 - Flujo login administrador` | Done |
| CAL-QA-015 | #9 `CAL-QA-015 - Gestion de periodos academicos` | Done |
| CAL-QA-016 | #10 `CAL-QA-016 - Recuperacion de contrasena` | In Progress |
| CAL-QA-017 | #11 `CAL-QA-017 - Compatibilidad escritorio` | Done |
| CAL-QA-018 | #12 `CAL-QA-018 - Compatibilidad movil` | Todo |
| CAL-QA-019 | #13 `CAL-QA-019 - Usabilidad de formularios` | Done |
| CAL-QA-020 | #14 `CAL-QA-020 - Seguridad basica de rutas protegidas` | Done |
| CAL-QA-021 | #25 `CAL-QA-021 - Sesion exploratoria de despliegue y autenticacion` | Done |
| CAL-QA-022 | #26 `CAL-QA-022 - Pruebas Ad-Hoc sobre API y cache de periodos` | Done |

Los issues agrupados historicos #2, #6 y #7 se conservaron cerrados como referencia, pero fueron retirados del Project para evitar duplicidad visual.

## Labels sugeridos

- `qa`
- `test-case`
- `bug`
- `frontend`
- `backend`
- `accessibility`
- `performance`
- `security`
- `availability`
- `w3c`

## Issues recomendados

### Issue 1

Titulo: `CAL-QA-001 a CAL-QA-006 - Pruebas de disponibilidad, latencia, carga ligera y W3C`

Labels: `qa`, `test-case`, `availability`, `w3c`

Contenido:

```markdown
## Objetivo
Registrar pruebas tecnicas de disponibilidad, tiempos de respuesta, carga ligera y validacion W3C.

## Casos incluidos
- CAL-QA-001 Frontend disponible
- CAL-QA-002 Backend disponible
- CAL-QA-003 Latencia frontend
- CAL-QA-004 Latencia backend
- CAL-QA-005 Carga ligera backend
- CAL-QA-006 Validacion W3C

## Resultado
Aprobadas.

## Evidencia
Ver `docs/qa/evidencia-comandos.md`.
```

### Issue 2

Titulo: `QA-BUG-001 - Corregir pruebas unitarias backend fallidas`

Labels: `qa`, `bug`, `backend`, `test-case`

Contenido:

```markdown
## Objetivo
Corregir la suite automatizada del backend para cumplir el criterio de pruebas funcionales.

## Resultado obtenido
Test Suites: 4 failed, 24 passed, 28 total.
Tests: 20 failed, 122 passed, 142 total.

## Causa observada
Mocks/providers faltantes:
- CorreoServicio en AuthServicio
- GrupoRepository en EstudiantesServicio
- DimensionRepository en FormulariosServicio

## Estado
To Do / Inicio

## Evidencia
Ver `docs/qa/incidencias-qa.md`.
```

### Issue 3

Titulo: `QA-BUG-002 - Mejorar rendimiento inicial del frontend`

Labels: `qa`, `bug`, `frontend`, `performance`

Contenido:

```markdown
## Objetivo
Mejorar el puntaje Performance de Lighthouse.

## Resultado esperado
Performance >= 70.

## Resultado obtenido
Performance 48/100.

## Estado
To Do / Inicio

## Evidencia
Ver `docs/qa/evidencia-comandos.md`.
```

### Issue 4

Titulo: `QA-BUG-003 - Mejorar accesibilidad del frontend`

Labels: `qa`, `bug`, `frontend`, `accessibility`

Contenido:

```markdown
## Objetivo
Mejorar cumplimiento de accesibilidad en las pantallas principales.

## Resultado esperado
Accessibility >= 90.

## Resultado obtenido
Accessibility 80/100.

## Estado
To Do / Inicio

## Evidencia
Ver `docs/qa/evidencia-comandos.md`.
```

### Issue 5

Titulo: `CAL-QA-014 a CAL-QA-020 - Pruebas exploratorias pendientes con evidencia visual`

Labels: `qa`, `test-case`, `frontend`, `security`

Contenido:

```markdown
## Objetivo
Completar pruebas manuales con capturas o video demostrativo.

## Casos incluidos
- CAL-QA-014 Login administrador
- CAL-QA-015 Gestion de periodos academicos
- CAL-QA-016 Recuperacion de contrasena
- CAL-QA-017 Compatibilidad escritorio
- CAL-QA-018 Compatibilidad movil
- CAL-QA-019 Usabilidad de formularios
- CAL-QA-020 Seguridad basica de rutas protegidas

## Estado
Pendiente / En Proceso

## Evidencia esperada
Capturas de pantalla o video demostrativo.
```

### Issue 6

Titulo: `CAL-QA-021 y CAL-QA-022 - Pruebas exploratorias y Ad-Hoc de integracion`

Labels: `qa`, `test-case`, `frontend`, `backend`

Contenido:

```markdown
## Objetivo
Registrar las pruebas exploratorias y Ad-Hoc ejecutadas durante la estabilizacion del despliegue.

## Casos incluidos
- CAL-QA-021 Sesion exploratoria de despliegue y autenticacion
- CAL-QA-022 Pruebas Ad-Hoc sobre API y cache de periodos

## Hallazgos
- Ajuste de prefijo `/api` en llamadas del frontend.
- Validacion real de login contra backend publicado.
- Deteccion de cache persistida que impedia ver periodos nuevos en otros modulos.
- Confirmacion de endpoint protegido con respuesta HTTP 401 sin token.

## Estado
Aprobada, con incidencias derivadas ya documentadas.

## Evidencia
Ver `docs/qa/evidencia-comandos.md`.
```
