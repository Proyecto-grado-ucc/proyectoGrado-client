# Guion de sustentacion de pruebas

Este guion organiza los 22 casos de prueba para presentarlos sin tener que ejecutar todo en vivo. La estrategia recomendada es mostrar la matriz completa, evidencias registradas y ejecutar solo una muestra representativa.

## Mensaje inicial

> Profesor, documentamos 22 casos de prueba siguiendo una estructura compatible con ISO/IEC/IEEE 29119. No todas las pruebas se ejecutan en vivo porque algunas dependen de herramientas externas, condiciones de red o tiempos de ejecucion. Por eso dejamos evidencia con fecha, comando, resultado obtenido, capturas e incidencias en GitHub Issues. Para la sustentacion ejecutaremos una muestra representativa y mostraremos la trazabilidad del resto.

## Pruebas recomendadas para ejecutar en vivo

Estas son rapidas, estables y demuestran frontend, backend, seguridad y documentacion.

### 1. Disponibilidad frontend

Caso: CAL-QA-001

```bash
curl -I https://frontend-production-da48.up.railway.app
```

Resultado esperado: `HTTP/2 200` o `HTTP/1.1 200`.

### 2. Disponibilidad backend

Casos: CAL-QA-002 y CAL-QA-004

```bash
curl -i https://api-production-bad2.up.railway.app/api/health
```

Resultado esperado: HTTP 200.

### 3. Seguridad basica sin token

Caso: CAL-QA-020

```bash
curl -i 'https://api-production-bad2.up.railway.app/api/periodos?page=1&size=10'
```

Resultado esperado: HTTP 401 Unauthorized.

### 4. Validacion W3C

Caso: CAL-QA-006

Abrir:

```text
https://validator.w3.org/nu/
```

Pegar:

```text
https://frontend-production-da48.up.railway.app
```

Resultado esperado: 0 errores criticos.

### 5. Issues de gestion colaborativa

Abrir:

```text
https://github.com/Proyecto-grado-ucc/proyectoGrado-client/issues
```

Mostrar:

- Casos aprobados.
- Bugs abiertos.
- Pruebas pendientes o en proceso.

## Pruebas que se sustentan con evidencia documental

Estas no conviene repetirlas todas en vivo porque pueden tardar o variar por la red.

| Casos | Motivo |
|---|---|
| CAL-QA-003, CAL-QA-004 | La latencia cambia segun red, por eso se deja medicion registrada. |
| CAL-QA-005 | La carga ligera puede variar por Railway y la red disponible. |
| CAL-QA-007, CAL-QA-008, CAL-QA-009 | Lighthouse tarda y sus resultados pueden fluctuar. |
| CAL-QA-010 | Los tests frontend son rapidos, pero ya tienen evidencia. Se pueden ejecutar si hay tiempo. |
| CAL-QA-011, CAL-QA-012 | Los tests backend tienen fallas registradas; se muestran como incidencias de mantenimiento. |
| CAL-QA-013 | Traceroute puede mostrar asteriscos por bloqueo ICMP. |
| CAL-QA-014 a CAL-QA-019 | Requieren capturas/manualidad; se muestran como pruebas exploratorias y pendientes de evidencia visual completa. |
| CAL-QA-021, CAL-QA-022 | Son exploratorias y Ad-Hoc, se sustentan con hallazgos documentados. |

## Si el profesor pide las 22

Responder:

> Las 22 pruebas estan registradas en la matriz. Algunas son automatizadas, otras manuales, otras exploratorias y otras de red. Por buenas practicas, no todas se ejecutan en vivo porque los resultados de rendimiento, red y herramientas externas pueden fluctuar. Lo importante segun ISO/IEC/IEEE 29119 es que cada caso tenga identificador, objetivo, precondiciones, datos, pasos, resultado esperado, resultado obtenido, estado y evidencia. Todo eso esta en la matriz y en GitHub Issues.

Luego mostrar:

1. `plan-pruebas-iso-29119.md`
2. `evidencia-comandos.md`
3. `incidencias-qa.md`
4. Issues de GitHub

## Orden recomendado de presentacion

1. Abrir el PR con la documentacion QA.
2. Abrir la matriz y mostrar los 22 casos.
3. Abrir evidencias de comandos.
4. Ejecutar frontend disponible.
5. Ejecutar backend health.
6. Ejecutar endpoint protegido sin token.
7. Mostrar W3C.
8. Mostrar issues abiertos y cerrados.
9. Cerrar explicando que las fallas quedaron como incidencias de mantenimiento.

## Cierre sugerido

> Como resultado, evidenciamos que el sistema esta desplegado y disponible, que existen pruebas aprobadas, pruebas fallidas y pruebas pendientes documentadas. Las fallas no se ocultaron: quedaron registradas como incidencias en GitHub para ser tratadas dentro del ciclo de mantenimiento.
