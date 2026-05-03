# Sistema CAL — Cambridge Academy of Languages

Academic management system with AI-powered schedule generation and digital teacher evaluation.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | TypeScript + NestJS 10 + TypeORM |
| Database | PostgreSQL 16 |
| Frontend | React 18 + Vite 5 + TailwindCSS |
| State/Fetch | TanStack Query + Zustand |
| Charts | Recharts |
| Auth | JWT |
| AI | Gemini Flash 2.5 + Genetic Algorithm + Tabu Search |

## Requirements

- Docker and Docker Compose
- Node.js 20+

## Quick Start

### 1. Clone and configure
```bash
git clone [repo-url]
cd actividad2-compiladores
cp .env.example .env
# Edit .env with your values
```

### 2. Start database
```bash
docker-compose up db
```

### 3. Start backend
```bash
cd cal/backend
npm install
npm run start:dev
```

### 4. Start frontend (new terminal)
```bash
cd cal/frontend
npm install
npm run dev
```

## Services

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| API REST | http://localhost:3000/api |
| Swagger Docs | http://localhost:3000/api/docs |
| PostgreSQL | localhost:5432 |

## Default Admin Account
**Email:** admin@cambridge.edu.co
**Password:** Admin123!

## Modules

### Module 1 — AI Schedule Generation
- Gemini Flash 2.5 optimizes genetic algorithm hyperparameters
- Genetic Algorithm + Tabu Search generates conflict-free schedules
- Hard constraints: no teacher/room double-booking, capacity limits
- Soft constraints: consecutive hours, balanced distribution

### Module 2 — Teacher Evaluation
- Dynamic form builder with dimensions and weighted questions
- Anonymous student responses (Likert 1-5 + open text)
- KDD pipeline for statistical analysis
- Automated alerts for low-performing teachers
- Gerencial dashboard with historical comparison

### User Roles
| Role | Access |
|------|--------|
| Admin | Full system access |
| Docente | Own schedule + own evaluation results |
| Estudiante | Group schedule + pending evaluation forms |

## Development Phases
| Phase | Name | Status |
|-------|------|--------|
| 0 | Bootstrap | ✅ Complete |
| 1 | Security (Auth/RBAC/AuditLog) | ✅ Complete |
| 2 | Shared + Master Data | ✅ Complete |
| 3 | Module 1: AI Engine | ✅ Complete |
| 4 | Module 1: Gemini Integration | ✅ Complete |
| 5 | Module 2: Forms & Collection | ✅ Complete |
| 6 | Module 2: KDD + Alerts + Dashboard | ✅ Complete |
| 7 | Complete Frontend | ✅ Complete |
| 8 | Hardening | ✅ Complete |
