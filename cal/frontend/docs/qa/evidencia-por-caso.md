# Evidencia por caso de prueba

Este indice relaciona cada caso de la matriz con una evidencia concreta. Algunas evidencias son capturas visuales de la aplicacion y otras son capturas tecnicas de comandos/resultados, apropiadas para pruebas de consola, carga, seguridad o automatizacion.

| ID | Tipo de evidencia | Archivo / enlace | Estado |
|---|---|---|---|
| CAL-QA-001 | Captura status page + captura tecnica | `docs/qa/evidencias/status-page.png`, `docs/qa/evidencias/disponibilidad-latencia.png` | Aprobada |
| CAL-QA-002 | Captura backend health + status page | `docs/qa/evidencias/backend-health.png`, `docs/qa/evidencias/status-page.png` | Aprobada |
| CAL-QA-003 | Captura tecnica de latencia frontend | `docs/qa/evidencias/disponibilidad-latencia.png` | Aprobada |
| CAL-QA-004 | Captura tecnica de latencia backend | `docs/qa/evidencias/disponibilidad-latencia.png` | Aprobada |
| CAL-QA-005 | Captura tecnica de carga ligera | `docs/qa/evidencias/carga-ligera.png` | Aprobada |
| CAL-QA-006 | Captura W3C | `docs/qa/evidencias/w3c-validator.png` | Aprobada |
| CAL-QA-007 | Captura tecnica Lighthouse | `docs/qa/evidencias/lighthouse.png` | Fallida |
| CAL-QA-008 | Captura tecnica Lighthouse | `docs/qa/evidencias/lighthouse.png` | Fallida |
| CAL-QA-009 | Captura tecnica Lighthouse | `docs/qa/evidencias/lighthouse.png` | Aprobada |
| CAL-QA-010 | Captura tecnica Vitest | `docs/qa/evidencias/tests-frontend.png` | Aprobada |
| CAL-QA-011 | Captura tecnica Jest + incidencia | `docs/qa/evidencias/tests-backend.png`, `docs/qa/incidencias-qa.md` | Fallida |
| CAL-QA-012 | Captura tecnica cobertura backend | `docs/qa/evidencias/tests-backend.png` | En Proceso |
| CAL-QA-013 | Captura tecnica traceroute | `docs/qa/evidencias/traceroute.png` | En Proceso |
| CAL-QA-014 | Captura login desktop | `docs/qa/evidencias/frontend-login-desktop.png` | Pendiente |
| CAL-QA-015 | Captura status page + evidencia Ad-Hoc | `docs/qa/evidencias/status-page.png`, `docs/qa/evidencias/exploratorias-adhoc.png` | En Proceso |
| CAL-QA-016 | Captura tecnica Ad-Hoc | `docs/qa/evidencias/exploratorias-adhoc.png` | En Proceso |
| CAL-QA-017 | Captura login desktop | `docs/qa/evidencias/frontend-login-desktop.png` | Pendiente |
| CAL-QA-018 | Captura login mobile | `docs/qa/evidencias/frontend-login-mobile.png` | Pendiente |
| CAL-QA-019 | Captura login desktop/mobile | `docs/qa/evidencias/frontend-login-desktop.png`, `docs/qa/evidencias/frontend-login-mobile.png` | Pendiente |
| CAL-QA-020 | Captura tecnica seguridad 401 + status page | `docs/qa/evidencias/seguridad-401.png`, `docs/qa/evidencias/status-page.png` | Aprobada |
| CAL-QA-021 | Captura tecnica exploratoria | `docs/qa/evidencias/exploratorias-adhoc.png` | Aprobada |
| CAL-QA-022 | Captura tecnica Ad-Hoc | `docs/qa/evidencias/exploratorias-adhoc.png` | Aprobada |

## Nota metodologica

No todas las pruebas requieren una captura de interfaz grafica. En pruebas de rendimiento, carga, seguridad, conectividad y automatizacion, la evidencia tecnica puede ser la salida del comando, reporte de herramienta o captura del resultado generado. Esto mantiene trazabilidad y reproducibilidad sin depender de una demostracion manual completa en vivo.
