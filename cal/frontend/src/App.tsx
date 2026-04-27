import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './seguridad/store';
import Login from './seguridad/paginas/Login';
import RecuperarContrasena from './seguridad/paginas/RecuperarContrasena';
import Inicio from './paginas/Inicio';
import LayoutAdmin from './modulos/admin/layout/LayoutAdmin';
import Dashboard from './modulos/admin/paginas/Dashboard';
import Horarios from './modulos/admin/paginas/Horarios';
import Evaluacion from './modulos/admin/paginas/Evaluacion';
import Usuarios from './modulos/admin/paginas/Usuarios';
import Configuracion from './modulos/admin/paginas/Configuracion';
import Auditoria from './modulos/admin/paginas/Auditoria';
import LayoutDocente from './modulos/docente/layout/LayoutDocente';
import DashboardDocente from './modulos/docente/paginas/DashboardDocente';
import HorarioDocente from './modulos/docente/paginas/HorarioDocente';
import EvaluacionDocente from './modulos/docente/paginas/EvaluacionDocente';
import LayoutEstudiante from './modulos/estudiante/layout/LayoutEstudiante';
import DashboardEstudiante from './modulos/estudiante/paginas/DashboardEstudiante';
import HorarioEstudiante from './modulos/estudiante/paginas/HorarioEstudiante';
import FormulariosEstudiante from './modulos/estudiante/paginas/FormulariosEstudiante';

function RutaProtegida({ children }: { children: React.ReactNode }) {
  const estaAutenticado = useAuthStore((s) => s.estaAutenticado);
  return estaAutenticado ? <>{children}</> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/recuperar-contrasena" element={<RecuperarContrasena />} />

        <Route path="/admin" element={<RutaProtegida><LayoutAdmin /></RutaProtegida>}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="horarios" element={<Horarios />} />
          <Route path="evaluacion" element={<Evaluacion />} />
          <Route path="usuarios" element={<Usuarios />} />
          <Route path="configuracion" element={<Configuracion />} />
          <Route path="auditoria" element={<Auditoria />} />
        </Route>

        <Route path="/docente" element={<RutaProtegida><LayoutDocente /></RutaProtegida>}>
          <Route index element={<Navigate to="/docente/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardDocente />} />
          <Route path="horario" element={<HorarioDocente />} />
          <Route path="evaluacion" element={<EvaluacionDocente />} />
        </Route>

        <Route path="/estudiante" element={<RutaProtegida><LayoutEstudiante /></RutaProtegida>}>
          <Route index element={<Navigate to="/estudiante/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardEstudiante />} />
          <Route path="horario" element={<HorarioEstudiante />} />
          <Route path="formularios" element={<FormulariosEstudiante />} />
        </Route>

        <Route path="/inicio" element={<Inicio />} />
      </Routes>
    </BrowserRouter>
  );
}
