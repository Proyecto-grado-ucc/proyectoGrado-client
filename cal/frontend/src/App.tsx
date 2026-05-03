import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useAuthStore } from './seguridad/store';
import TransicionPagina from './compartido/TransicionPagina';
import Login from './seguridad/paginas/Login';
import RecuperarContrasena from './seguridad/paginas/RecuperarContrasena';
import RestablecerContrasena from './seguridad/paginas/RestablecerContrasena';
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

function RutasAnimadas() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<TransicionPagina><Login /></TransicionPagina>} />
        <Route path="/recuperar-contrasena" element={<TransicionPagina><RecuperarContrasena /></TransicionPagina>} />
        <Route path="/nueva-contrasena" element={<TransicionPagina><RestablecerContrasena /></TransicionPagina>} />

        <Route path="/admin" element={<RutaProtegida><LayoutAdmin /></RutaProtegida>}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<TransicionPagina><Dashboard /></TransicionPagina>} />
          <Route path="horarios" element={<TransicionPagina><Horarios /></TransicionPagina>} />
          <Route path="evaluacion" element={<TransicionPagina><Evaluacion /></TransicionPagina>} />
          <Route path="usuarios" element={<TransicionPagina><Usuarios /></TransicionPagina>} />
          <Route path="configuracion" element={<TransicionPagina><Configuracion /></TransicionPagina>} />
          <Route path="auditoria" element={<TransicionPagina><Auditoria /></TransicionPagina>} />
        </Route>

        <Route path="/docente" element={<RutaProtegida><LayoutDocente /></RutaProtegida>}>
          <Route index element={<Navigate to="/docente/dashboard" replace />} />
          <Route path="dashboard" element={<TransicionPagina><DashboardDocente /></TransicionPagina>} />
          <Route path="horario" element={<TransicionPagina><HorarioDocente /></TransicionPagina>} />
          <Route path="evaluacion" element={<TransicionPagina><EvaluacionDocente /></TransicionPagina>} />
        </Route>

        <Route path="/estudiante" element={<RutaProtegida><LayoutEstudiante /></RutaProtegida>}>
          <Route index element={<Navigate to="/estudiante/dashboard" replace />} />
          <Route path="dashboard" element={<TransicionPagina><DashboardEstudiante /></TransicionPagina>} />
          <Route path="horario" element={<TransicionPagina><HorarioEstudiante /></TransicionPagina>} />
          <Route path="formularios" element={<TransicionPagina><FormulariosEstudiante /></TransicionPagina>} />
        </Route>

        <Route path="/inicio" element={<Inicio />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <RutasAnimadas />
    </BrowserRouter>
  );
}
