# Resumen ejecutivo de ejecucion QA

Proyecto: Sistema CAL  
Repositorio: `Proyecto-grado-ucc/proyectoGrado-client`  
Project QA: https://github.com/orgs/Proyecto-grado-ucc/projects/2  
Norma de referencia: ISO/IEC/IEEE 29119

## Alcance

La ejecucion cubre pruebas aplicables a un proyecto web con frontend React, backend NestJS, API REST, despliegue en Railway, autenticacion, rutas protegidas y flujos administrativos.

## Estado general

| Estado | Cantidad | Casos |
| --- | ---: | --- |
| Aprobada / Done | 15 | CAL-QA-001, CAL-QA-002, CAL-QA-003, CAL-QA-004, CAL-QA-005, CAL-QA-006, CAL-QA-009, CAL-QA-010, CAL-QA-014, CAL-QA-015, CAL-QA-017, CAL-QA-019, CAL-QA-020, CAL-QA-021, CAL-QA-022 |
| Fallida / To Do | 3 | CAL-QA-007, CAL-QA-008, CAL-QA-011 |
| En Proceso | 3 | CAL-QA-012, CAL-QA-013, CAL-QA-016 |
| Pendiente / To Do | 1 | CAL-QA-018 |
| Total | 22 | CAL-QA-001 a CAL-QA-022 |

Avance de pruebas aprobadas: 68%  
Pruebas con incidencia o seguimiento abierto: 32%

## Cobertura por tipo de prueba

| Tipo solicitado | Casos relacionados | Evidencia principal |
| --- | --- | --- |
| Pruebas exploratorias | CAL-QA-014 a CAL-QA-021 | `docs/qa/evidencias/exploratorias-adhoc.png` |
| Pruebas Ad-Hoc | CAL-QA-022 | `docs/qa/evidencias/exploratorias-adhoc.png` |
| Validacion W3C | CAL-QA-006 | `docs/qa/evidencias/w3c-validator.png` |
| Accesibilidad | CAL-QA-007, CAL-QA-019 | `docs/qa/evidencias/lighthouse.png` |
| Disponibilidad | CAL-QA-001, CAL-QA-002 | `docs/qa/evidencias/disponibilidad-latencia.png` |
| Latencia y tiempos de respuesta | CAL-QA-003, CAL-QA-004 | `docs/qa/evidencias/disponibilidad-latencia.png` |
| Conectividad tracert/traceroute | CAL-QA-013 | `docs/qa/evidencias/traceroute.png` |
| Rendimiento | CAL-QA-008 | `docs/qa/evidencias/lighthouse.png` |
| Carga | CAL-QA-005 | `docs/qa/evidencias/carga-ligera.png` |
| Funcionales | CAL-QA-010, CAL-QA-011, CAL-QA-014, CAL-QA-015, CAL-QA-016 | `docs/qa/evidencias/tests-frontend.png`, `docs/qa/evidencias/login-exitoso-admin.png`, `docs/qa/evidencias/periodo-creado-configuracion.png` |
| Usabilidad | CAL-QA-019 | `docs/qa/evidencias/login-validacion-error.png` |
| Compatibilidad | CAL-QA-017, CAL-QA-018 | `docs/qa/evidencias/login-form-desktop.png` |
| Seguridad basica | CAL-QA-009, CAL-QA-016, CAL-QA-020 | `docs/qa/evidencias/seguridad-401.png` |

## Metricas web registradas

| Metrica | Resultado |
| --- | --- |
| Disponibilidad frontend | HTTP 200 |
| Disponibilidad backend | HTTP 200 |
| Tiempo total frontend | 0.507863 s |
| Tiempo total backend | 0.536766 s |
| Carga ligera backend | 30/30 solicitudes OK |
| Concurrencia evaluada | 10 solicitudes concurrentes |
| Promedio carga backend | 524 ms |
| Percentil 95 carga backend | 1214 ms |
| W3C | 0 errores criticos, 2 avisos informativos |
| Lighthouse Accessibility | 80/100 |
| Lighthouse Performance | 48/100 |
| Lighthouse Best Practices | 96/100 |
| Pruebas frontend | 4/4 aprobadas |
| Pruebas backend | 122/142 aprobadas |

## Incidencias abiertas

| Issue | Motivo | Estado |
| --- | --- | --- |
| QA-BUG-001 | Pruebas unitarias backend fallidas por dependencias faltantes en mocks | To Do |
| QA-BUG-002 | Rendimiento inicial del frontend por debajo del umbral | To Do |
| QA-BUG-003 | Accesibilidad automatizada por debajo del umbral | To Do |
| CAL-QA-014 | Cerrada con evidencia de login exitoso administrador | Done |
| CAL-QA-015 | Cerrada con evidencia de periodo creado y visible en dashboard | Done |
| CAL-QA-016 | Formulario de recuperacion documentado; falta validacion final del envio con cuenta real | In Progress |
| CAL-QA-017 | Cerrada con evidencia desktop en Chrome | Done |
| CAL-QA-018 | Recorrido movil completo | To Do |
| CAL-QA-019 | Cerrada con evidencia de validacion de formulario | Done |

## Entregables

- Matriz de pruebas: `docs/qa/plan-pruebas-iso-29119.md`
- Evidencia tecnica: `docs/qa/evidencia-comandos.md`
- Indice por caso: `docs/qa/evidencia-por-caso.md`
- Incidencias: `docs/qa/incidencias-qa.md`
- Evidencias visuales: `docs/qa/evidencias/`
- Gestion colaborativa: GitHub Project `QA Software - Sistema CAL`
