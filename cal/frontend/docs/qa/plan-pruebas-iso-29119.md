# Plan y registro de pruebas de software - Sistema CAL

Proyecto: Sistema CAL - Cambridge Academy of Languages  
Frontend: https://frontend-production-da48.up.railway.app  
Backend: https://api-production-bad2.up.railway.app/api  
Fecha de ejecucion: 2026-05-19  
Norma de referencia: ISO/IEC/IEEE 29119, aplicada como estructura de planeacion, diseno, ejecucion, registro de resultados e incidencias.

## Alcance

Este documento registra pruebas funcionales y no funcionales aplicables al proyecto web Sistema CAL, incluyendo frontend React, backend NestJS, API REST, autenticacion, disponibilidad del servicio, rendimiento, accesibilidad, compatibilidad y seguridad basica.

## Estados usados

- Aprobada: el resultado obtenido coincide con el resultado esperado.
- Fallida: el resultado obtenido no cumple el criterio esperado y debe volver al flujo To Do/Inicio.
- Pendiente: la prueba esta definida, pero requiere ejecucion manual adicional o evidencia visual.
- En Proceso: la prueba esta siendo preparada o requiere nueva validacion.

## Matriz de casos de prueba

| ID | Nombre | Tipo | Objetivo | Precondiciones | Datos de entrada | Pasos de ejecucion | Resultado esperado | Resultado obtenido | Estado | Evidencia |
|---|---|---|---|---|---|---|---|---|---|---|
| CAL-QA-001 | Validacion de disponibilidad del frontend | Disponibilidad | Verificar que la aplicacion web este publicada y responda correctamente. | Servicio frontend desplegado en Railway. | URL publica del frontend. | Ejecutar `curl` sobre la URL publica. | HTTP 200. | HTTP 200, tiempo total 0.507863 s. | Aprobada | `docs/qa/evidencia-comandos.md` |
| CAL-QA-002 | Validacion de disponibilidad del backend | Disponibilidad | Verificar que el health check del backend este disponible. | Backend desplegado en Railway. | `/api/health`. | Ejecutar `curl` sobre endpoint de salud. | HTTP 200. | HTTP 200, tiempo total 0.536766 s. | Aprobada | `docs/qa/evidencia-comandos.md` |
| CAL-QA-003 | Latencia inicial del frontend | Latencia | Medir tiempo DNS, conexion, TLS, primer byte y total. | Conexion a internet activa. | URL frontend. | Ejecutar `curl -w` con metricas de tiempo. | Tiempo total menor a 2 s. | Tiempo total 0.507863 s. | Aprobada | `docs/qa/evidencia-comandos.md` |
| CAL-QA-004 | Latencia inicial del backend | Latencia | Medir respuesta del backend publicado. | Backend disponible. | `/api/health`. | Ejecutar `curl -w` con metricas de tiempo. | Tiempo total menor a 2 s. | Tiempo total 0.536766 s. | Aprobada | `docs/qa/evidencia-comandos.md` |
| CAL-QA-005 | Prueba de carga ligera del backend | Carga | Evaluar comportamiento del backend bajo concurrencia baja. | Backend disponible. | 30 solicitudes, concurrencia 10. | Ejecutar script Node con `fetch` concurrente a `/api/health`. | 100% respuestas OK y sin errores. | 30/30 OK, disponibilidad 100%, promedio 524 ms, p95 1214 ms. | Aprobada | `docs/qa/evidencia-comandos.md` |
| CAL-QA-006 | Validacion W3C del HTML publico | Estandar W3C | Verificar cumplimiento HTML de la pagina publicada. | Frontend publicado. | URL frontend en validator.w3.org/nu. | Consultar API JSON del validador W3C. | 0 errores criticos. | 0 errores, 2 avisos informativos por slash en void elements. | Aprobada | `docs/qa/evidencia-comandos.md` |
| CAL-QA-007 | Accesibilidad automatizada con Lighthouse | Accesibilidad | Evaluar accesibilidad inicial de la app. | Chrome instalado, frontend publicado. | URL frontend. | Ejecutar Lighthouse categoria accessibility. | Puntaje >= 90. | Puntaje 80/100. | Fallida | `docs/qa/evidencia-comandos.md` |
| CAL-QA-008 | Rendimiento inicial con Lighthouse | Rendimiento | Medir rendimiento percibido de carga inicial. | Chrome instalado, frontend publicado. | URL frontend. | Ejecutar Lighthouse categoria performance. | Puntaje >= 70. | Puntaje 48/100. | Fallida | `docs/qa/evidencia-comandos.md` |
| CAL-QA-009 | Buenas practicas web con Lighthouse | Seguridad basica / buenas practicas | Verificar buenas practicas generales del navegador. | Chrome instalado, frontend publicado. | URL frontend. | Ejecutar Lighthouse categoria best-practices. | Puntaje >= 90. | Puntaje 96/100. | Aprobada | `docs/qa/evidencia-comandos.md` |
| CAL-QA-010 | Pruebas unitarias frontend | Funcional automatizada | Validar componentes y comportamiento basico del frontend. | Dependencias instaladas. | `npm test -- --run`. | Ejecutar Vitest. | 100% de tests aprobados. | 1 suite aprobada, 4/4 tests aprobados. | Aprobada | `docs/qa/evidencia-comandos.md` |
| CAL-QA-011 | Pruebas unitarias backend | Funcional automatizada | Validar servicios y reglas de negocio del backend. | Dependencias instaladas. | `npm test -- --runInBand`. | Ejecutar Jest con cobertura. | 100% de suites aprobadas. | 24/28 suites aprobadas, 122/142 tests aprobados, 20 fallidos. | Fallida | `docs/qa/incidencias-qa.md` |
| CAL-QA-012 | Cobertura backend | Calidad / cobertura | Medir cobertura de pruebas automatizadas. | Ejecucion de Jest con coverage. | Reporte de coverage. | Ejecutar `npm test`. | Cobertura superior al umbral definido por el equipo. | Statements 37.96%, branches 39.19%, funcs 38.84%, lines 36.19%. | En Proceso | `docs/qa/evidencia-comandos.md` |
| CAL-QA-013 | Conectividad por traceroute | Conectividad | Evidenciar ruta de red hacia el frontend. | Red activa. | Dominio frontend Railway. | Ejecutar `traceroute frontend-production-da48.up.railway.app`. | Se resuelve dominio y se observan saltos de red. | Dominio resuelto a 66.33.22.204; saltos posteriores con `*`, probable bloqueo ICMP. | En Proceso | `docs/qa/evidencia-comandos.md` |
| CAL-QA-014 | Flujo login administrador | Funcional exploratoria | Validar acceso al sistema con usuario administrador. | Usuario administrador existente. | Correo y contrasena validos. | Abrir frontend, ingresar credenciales, enviar formulario. | Login exitoso y redireccion al panel. | Formulario desktop documentado; login exitoso requiere captura final con credenciales autorizadas. | Pendiente | `docs/qa/evidencias/login-form-desktop.png` |
| CAL-QA-015 | Gestion de periodos academicos | Funcional exploratoria | Validar creacion y uso de periodos en otros modulos. | Usuario administrador autenticado. | Nombre, fecha inicio, fecha fin. | Crear periodo en Configuracion y verificar que aparezca en Horarios/Evaluacion/Dashboard. | Periodo visible y seleccionable en modulos dependientes. | Se corrigio cache del frontend; requiere captura final posterior. | En Proceso | Captura manual |
| CAL-QA-016 | Recuperacion de contrasena | Funcional / seguridad basica | Validar endpoint de recuperacion de contrasena. | Backend desplegado. | Email registrado. | Enviar solicitud desde pantalla de recuperacion. | Respuesta exitosa sin exponer informacion sensible. | Formulario de recuperacion documentado; envio final requiere cuenta autorizada. | En Proceso | `docs/qa/evidencias/recuperacion-contrasena-form.png` |
| CAL-QA-017 | Compatibilidad escritorio | Compatibilidad | Verificar que la aplicacion funcione en navegadores de escritorio. | Frontend publicado. | Chrome, Safari/Firefox. | Abrir login, dashboard y configuracion. | Interfaz renderiza sin errores visibles. | Captura desktop de login documentada; falta navegador alterno. | Pendiente | `docs/qa/evidencias/login-form-desktop.png` |
| CAL-QA-018 | Compatibilidad movil | Compatibilidad | Verificar comportamiento responsive en dispositivo movil o emulador. | Frontend publicado. | Viewport movil. | Abrir login, dashboard y formularios principales. | Sin desbordes ni solapamientos criticos. | Evidencia movil retirada por decision del equipo; prueba queda pendiente. | Pendiente | Sin captura movil |
| CAL-QA-019 | Usabilidad de formularios | Usabilidad | Evaluar claridad de formularios de login, periodo y horario. | Usuario administrador autenticado. | Datos validos e invalidos. | Ejecutar tareas con errores y correcciones. | Mensajes comprensibles y flujo recuperable. | Validacion visual de formulario de login documentada; falta recorrido interno con usuario autenticado. | Pendiente | `docs/qa/evidencias/login-validacion-error.png` |
| CAL-QA-020 | Seguridad basica de rutas protegidas | Seguridad basica | Confirmar que endpoints protegidos no expongan informacion sin token. | Backend desplegado. | Solicitud sin JWT a endpoint protegido. | Ejecutar `curl` sin token a recurso protegido. | HTTP 401/403. | HTTP 401 con cuerpo `{"message":"Unauthorized","statusCode":401}`. | Aprobada | `docs/qa/evidencia-comandos.md` |
| CAL-QA-021 | Sesion exploratoria de despliegue y autenticacion | Exploratoria | Recorrer libremente los flujos criticos tras el despliegue para detectar errores no cubiertos por scripts. | Frontend y backend desplegados; usuario administrador disponible. | Login, recuperacion de contrasena, creacion/listado de periodos, navegacion entre modulos. | Ingresar a la app, probar formularios principales, observar mensajes de error, validar endpoints relacionados y documentar hallazgos. | Los flujos criticos deben funcionar o generar incidencias trazables. | Se detectaron problemas reales: rutas de recuperacion sin prefijo `/api`, credenciales/login, cache de periodos y persistencia de consultas. Fueron corregidos durante el despliegue. | Aprobada | Historial de QA y `docs/qa/evidencia-comandos.md` |
| CAL-QA-022 | Pruebas Ad-Hoc sobre API y cache de periodos | Ad-Hoc | Validar rapidamente hipotesis surgidas durante errores reportados por el usuario. | Backend desplegado y frontend apuntando a Railway. | Solicitudes directas a `/auth/login`, `/periodos`, `/auth/recuperar-contrasena`; creacion temporal de periodo. | Ejecutar peticiones manuales con `curl`/Node, crear un periodo temporal, listarlo y eliminarlo; revisar respuesta de endpoints protegidos. | Confirmar si el fallo esta en API, datos, cache o UI. | Se confirmo que la API de periodos funcionaba, que la base no tenia periodos persistidos y que el frontend necesitaba invalidar cache relacionada. | Aprobada | `docs/qa/evidencia-comandos.md` |

## Criterios de salida

- Las pruebas criticas de disponibilidad y login deben estar aprobadas.
- Las pruebas fallidas deben quedar registradas como incidencia y retornar al estado To Do/Inicio.
- Las pruebas pendientes deben tener responsable y fecha de ejecucion.
- La evidencia debe incluir capturas, salida de comandos o video, segun aplique.
- La relacion completa caso-evidencia esta registrada en `docs/qa/evidencia-por-caso.md`.
