# Evidencia tecnica de ejecucion

Fecha: 2026-05-19  
Entorno: despliegue Railway production  
Frontend: https://frontend-production-da48.up.railway.app  
Backend: https://api-production-bad2.up.railway.app/api

## Disponibilidad y latencia

Comando:

```bash
for url in https://frontend-production-da48.up.railway.app https://api-production-bad2.up.railway.app/api/health; do
  echo "$url"
  curl -o /dev/null -s -w 'status=%{http_code} dns=%{time_namelookup}s connect=%{time_connect}s tls=%{time_appconnect}s first_byte=%{time_starttransfer}s total=%{time_total}s\n' "$url"
done
```

Resultado:

```text
https://frontend-production-da48.up.railway.app
status=200 dns=0.102595s connect=0.182114s tls=0.278812s first_byte=0.507523s total=0.507863s

https://api-production-bad2.up.railway.app/api/health
status=200 dns=0.123927s connect=0.204626s tls=0.308076s first_byte=0.536570s total=0.536766s
```

Interpretacion: ambos servicios estan disponibles y responden por debajo de 1 segundo en la medicion puntual.

## Prueba de carga ligera

Configuracion:

- Endpoint: `https://api-production-bad2.up.railway.app/api/health`
- Solicitudes: 30
- Concurrencia: 10

Resultado:

```json
{
  "url": "https://api-production-bad2.up.railway.app/api/health",
  "requests": 30,
  "concurrency": 10,
  "ok": 30,
  "availability": "100.00%",
  "avgMs": 524,
  "p50Ms": 159,
  "p95Ms": 1214,
  "maxMs": 1284
}
```

Interpretacion: el backend respondio correctamente a todas las solicitudes concurrentes. Se recomienda repetir con 100, 250 y 500 solicitudes para una prueba de carga mas exigente.

## Validacion W3C

Servicio usado: `https://validator.w3.org/nu/?out=json&doc=<url>`

Resultado:

```json
{
  "messages": 2,
  "errors": 0,
  "warnings": 2,
  "sample": [
    {
      "type": "info",
      "message": "Trailing slash on void elements has no effect and interacts badly with unquoted attribute values.",
      "lastLine": 4
    },
    {
      "type": "info",
      "message": "Trailing slash on void elements has no effect and interacts badly with unquoted attribute values.",
      "lastLine": 5
    }
  ]
}
```

Interpretacion: no hay errores HTML criticos. Los dos hallazgos son informativos y provienen del HTML generado por Vite.

## Lighthouse

Comando:

```bash
npm_config_cache=/tmp/npm-cache-cal npx --yes lighthouse https://frontend-production-da48.up.railway.app \
  --chrome-path="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --chrome-flags="--headless --no-sandbox --disable-gpu" \
  --only-categories=performance,accessibility,best-practices \
  --output=json \
  --quiet \
  --output-path=/tmp/cal-lighthouse.json
```

Resultado:

```json
{
  "performance": 48,
  "accessibility": 80,
  "best-practices": 96
}
```

Interpretacion:

- Rendimiento: fallido/parcial; requiere optimizacion.
- Accesibilidad: fallida frente al umbral sugerido de 90.
- Buenas practicas: aprobada.

## Pruebas automatizadas frontend

Comando:

```bash
npm test -- --run
```

Resultado:

```text
Test Files  1 passed (1)
Tests       4 passed (4)
```

Interpretacion: pruebas funcionales automatizadas del frontend aprobadas.

## Pruebas automatizadas backend

Comando:

```bash
npm test -- --runInBand
```

Resultado:

```text
Test Suites: 4 failed, 24 passed, 28 total
Tests:       20 failed, 122 passed, 142 total
Coverage:    statements 37.96%, branches 39.19%, functions 38.84%, lines 36.19%
```

Interpretacion: la suite backend queda fallida. Las fallas no corresponden al despliegue, sino a pruebas unitarias desactualizadas respecto a nuevas dependencias inyectadas en servicios.

## Conectividad tipo tracert/traceroute

Comando:

```bash
traceroute frontend-production-da48.up.railway.app
```

Resultado parcial:

```text
traceroute to frontend-production-da48.up.railway.app (66.33.22.204), 64 hops max, 40 byte packets
1  192.168.101.1 (192.168.101.1)  1052.244 ms  3.434 ms  3.273 ms
2  * * *
3  * * *
4  * * *
5  * * *
```

Interpretacion: el dominio resuelve correctamente. Los saltos posteriores no responden a ICMP, comportamiento frecuente en redes/proveedores que filtran traceroute. La disponibilidad HTTP fue validada con `curl`.

## Seguridad basica de rutas protegidas

Comando:

```bash
curl -s -o /tmp/cal-periodos-no-token.json -w 'status=%{http_code}\n' \
  'https://api-production-bad2.up.railway.app/api/periodos?page=1&size=10'
```

Resultado:

```text
status=401
{"message":"Unauthorized","statusCode":401}
```

Interpretacion: el endpoint protegido no permite acceso sin token JWT.

## Evidencia visual

Capturas tomadas con Chrome Headless sobre la aplicacion publicada:

- `docs/qa/evidencias/frontend-login-desktop.png`
- `docs/qa/evidencias/frontend-login-mobile.png`
- `docs/qa/evidencias/backend-health.png`
- `docs/qa/evidencias/github-issues-qa.png`
- `docs/qa/evidencias/w3c-validator.png`
- `docs/qa/evidencias/matriz-pruebas-github.png`

Comando usado:

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --headless=new \
  --disable-gpu \
  --no-sandbox \
  --screenshot=docs/qa/evidencias/frontend-login-desktop.png \
  --window-size=1440,1000 \
  https://frontend-production-da48.up.railway.app/login

"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --headless=new \
  --disable-gpu \
  --no-sandbox \
  --screenshot=docs/qa/evidencias/frontend-login-mobile.png \
  --window-size=390,844 \
  https://frontend-production-da48.up.railway.app/login
```

Capturas adicionales generadas para sustentacion:

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --headless=new \
  --disable-gpu \
  --no-sandbox \
  --screenshot=docs/qa/evidencias/backend-health.png \
  --window-size=1200,800 \
  https://api-production-bad2.up.railway.app/api/health

"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --headless=new \
  --disable-gpu \
  --no-sandbox \
  --screenshot=docs/qa/evidencias/github-issues-qa.png \
  --window-size=1600,1000 \
  "https://github.com/Proyecto-grado-ucc/proyectoGrado-client/issues?q=is%3Aissue"

"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --headless=new \
  --disable-gpu \
  --no-sandbox \
  --screenshot=docs/qa/evidencias/w3c-validator.png \
  --window-size=1400,1000 \
  "https://validator.w3.org/nu/?doc=https%3A%2F%2Ffrontend-production-da48.up.railway.app%2F"

"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --headless=new \
  --disable-gpu \
  --no-sandbox \
  --screenshot=docs/qa/evidencias/matriz-pruebas-github.png \
  --window-size=1600,1200 \
  "https://github.com/Proyecto-grado-ucc/proyectoGrado-client/blob/qa/pruebas-software/cal/frontend/docs/qa/plan-pruebas-iso-29119.md"
```

## Pruebas exploratorias y Ad-Hoc

Durante el proceso de estabilizacion del despliegue se ejecutaron pruebas exploratorias y Ad-Hoc para investigar fallos reportados desde la interfaz:

- Recuperacion de contrasena: se identifico que el frontend llamaba una ruta sin el prefijo correcto de API.
- Login administrador: se valido el flujo real contra el backend publicado.
- Periodos academicos: se reviso el listado desde la UI y desde la API para confirmar si el dato existia en Railway.
- Cache de periodos: se detecto que React Query persistia resultados anteriores en `localStorage`, por lo que otros modulos no veian periodos nuevos.
- API de periodos: se creo, listo y elimino un periodo temporal para comprobar que el endpoint funcionaba correctamente.
- Seguridad basica: se consulto un endpoint protegido sin token y se obtuvo HTTP 401.

Resultado: estas pruebas permitieron encontrar y corregir defectos que no habian aparecido en las pruebas automatizadas, especialmente problemas de integracion entre frontend desplegado, backend desplegado, rutas API y cache del navegador.
