# 🎓 Cambridge Academy of Languages — Sistema de Gestión (Frontend)

Repositorio del **cliente web** del sistema de gestión académica CAL. Construido con React + TypeScript + Vite.

## 🖥️ Stack Tecnológico

| Tecnología | Versión | Uso |
|---|---|---|
| React | 18 | Framework de UI |
| TypeScript | 5.3 | Tipado estático |
| Vite | 5.1 | Bundler y dev server |
| TanStack Query | 5 | Fetching y caché de datos |
| React Router | 6 | Navegación SPA |
| Zustand | 4 | Estado global (auth) |
| Axios | 1.6 | Cliente HTTP |
| Recharts | 2 | Gráficas y estadísticas |
| Tailwind CSS | 3 | Estilos utilitarios |

## 📦 Estructura del Proyecto

```
src/
├── compartido/         # Utilidades y cliente API (Axios)
├── modulos/
│   ├── admin/          # Vistas del administrador
│   │   ├── paginas/    # Dashboard, Horarios, Evaluación, Configuración...
│   │   └── layout/
│   ├── docente/        # Vistas del docente (dashboard, evaluaciones)
│   └── estudiante/     # Vistas del estudiante (horario, evaluaciones)
└── seguridad/          # Autenticación, guards, store Zustand
```

## 🚀 Instalación y Ejecución

### Prerrequisitos
- Node.js 20+
- Backend corriendo en `http://localhost:3000/api` → ver [proyectoGrado-server](https://github.com/Proyecto-grado-ucc/proyectoGrado-server)

### Pasos

```bash
# 1. Clonar el repositorio
git clone -b client https://github.com/Proyecto-grado-ucc/proyectoGrado-client.git
cd proyectoGrado-client/cal/frontend

# 2. Instalar dependencias
npm install

# 3. Levantar en modo desarrollo
npm run dev
```

La app estará disponible en **http://localhost:5173**

### Scripts disponibles

```bash
npm run dev        # Servidor de desarrollo (Vite HMR)
npm run build      # Build de producción
npm run preview    # Previsualizar el build
npm run test       # Ejecutar tests con Vitest
npm run lint       # Revisar errores ESLint
```

## 🔐 Roles de Usuario

| Rol | Acceso |
|---|---|
| **Administrador** | Configuración completa, generación de horarios, evaluaciones, KDD |
| **Docente** | Dashboard personal, resultados de evaluaciones, comentarios anónimos |
| **Estudiante** | Horario de grupo, inscripción/baja, evaluación docente |

## 🌐 Variables de Entorno

El frontend no requiere `.env`. La URL base del API está configurada en `src/compartido/api.ts` apuntando a `http://localhost:3000/api`.

## 🔗 Repositorio Backend

El backend del sistema se encuentra en: [proyectoGrado-server](https://github.com/Proyecto-grado-ucc/proyectoGrado-server)
