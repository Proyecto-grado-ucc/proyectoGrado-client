# 🎓 Cambridge Academy of Languages — Sistema de Generación de Horarios Automáticos y Evaluación Docente (Frontend)

Repositorio del **cliente web** del sistema CAL. Construido con React + TypeScript + Vite y desplegado en **Railway**.

🌐 **Producción:** [https://proyectogrado-client-production.up.railway.app](https://proyectogrado-client-production.up.railway.app) *(ajustar URL real de Railway)*

---

## 🖥️ Stack Tecnológico

| Tecnología | Versión | Uso |
|---|---|---|
| React | 18 | Framework de UI |
| TypeScript | 5.3 | Tipado estático |
| Vite | 5.1 | Bundler y dev server |
| TanStack Query | 5 | Fetching y caché de datos |
| React Router | 6 | Navegación SPA |
| Zustand | 4 | Estado global (autenticación) |
| Axios | 1.6 | Cliente HTTP |
| Recharts | 2 | Gráficas y estadísticas |
| Framer Motion | 12 | Animaciones de UI |
| Lucide React | 1.14 | Iconografía |
| ExcelJS | 4.4 | Exportación de reportes |
| Tailwind CSS | 3 | Estilos utilitarios |
| Vite PWA | 1.3 | Soporte Progressive Web App |

---

## 📦 Estructura del Proyecto

```
cal/frontend/
└── src/
    ├── compartido/          # Cliente API Axios, utilidades compartidas
    ├── modulos/
    │   ├── admin/
    │   │   ├── paginas/     # Dashboard, Horarios, Evaluacion, Usuarios, Auditoria, Configuracion
    │   │   └── layout/      # Layout del administrador
    │   ├── docente/
    │   │   ├── paginas/     # DashboardDocente, HorarioDocente, EvaluacionDocente
    │   │   └── layout/      # Layout del docente
    │   ├── estudiante/      # Vistas del estudiante
    │   ├── evaluacion/      # Módulo de evaluación docente
    │   └── horarios/        # Módulo de generación de horarios automáticos
    ├── paginas/             # Páginas públicas (404, etc.)
    └── seguridad/           # Autenticación, guards, store Zustand
```

---

## 🔐 Roles de Usuario

| Rol | Acceso |
|---|---|
| **Administrador** | Configuración completa, generación de horarios con IA, gestión de evaluaciones, auditoría, KDD |
| **Docente** | Dashboard personal, horario asignado, resultados de evaluaciones y comentarios anónimos |
| **Estudiante** | Horario de grupo, evaluación docente |

---

## 🚀 Instalación y Ejecución Local

### Prerrequisitos
- Node.js 20+
- Backend corriendo (ver [proyectoGrado-server](https://github.com/Proyecto-grado-ucc/proyectoGrado-server))

### Pasos

```bash
# 1. Clonar el repositorio
git clone -b client https://github.com/Proyecto-grado-ucc/proyectoGrado-client.git
cd proyectoGrado-client/cal/frontend

# 2. Instalar dependencias
npm install

# 3. Crear archivo de variables de entorno
cp ../../../.env.example .env
# Editar .env con los valores correctos

# 4. Levantar en modo desarrollo
npm run dev
```

La app estará disponible en **http://localhost:5173**

### Scripts disponibles

```bash
npm run dev          # Servidor de desarrollo (Vite HMR)
npm run build        # Build de producción
npm run preview      # Previsualizar el build localmente
npm run test         # Ejecutar tests con Vitest
npm run test:watch   # Tests en modo watch
npm run lint         # Revisar errores ESLint
npm run lint:fix     # Corregir errores ESLint automáticamente
```

---

## 🌐 Variables de Entorno

El frontend usa la variable `VITE_BACKEND_URL` para apuntar al backend:

| Variable | Descripción | Valor local | Valor producción |
|---|---|---|---|
| `VITE_BACKEND_URL` | URL base del backend NestJS | `http://localhost:3000` | URL de Railway del server |

> En producción (Railway), esta variable se configura directamente en el panel de Railway como variable de entorno del servicio.

---

## 🐳 Docker

El proyecto incluye un `Dockerfile` para despliegue en contenedor:

```bash
docker build -t cal-frontend .
docker run -p 5173:5173 cal-frontend
```

También existe un `docker-compose.yml` en la raíz del repositorio para levantar frontend + backend juntos.

---

## 🔗 Repositorios relacionados

| Repositorio | Descripción |
|---|---|
| [proyectoGrado-server](https://github.com/Proyecto-grado-ucc/proyectoGrado-server) | Backend NestJS + PostgreSQL |
| [proyectoGrado-client](https://github.com/Proyecto-grado-ucc/proyectoGrado-client) | Este repositorio (Frontend React) |
