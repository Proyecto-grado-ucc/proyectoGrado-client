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
        <Route path="/docente/dashboard" element={
          <RutaProtegida>
            <div className="min-h-screen flex items-center justify-center text-gray-700 text-xl">Dashboard Docente</div>
          </RutaProtegida>
        } />
        <Route path="/estudiante/dashboard" element={
          <RutaProtegida>
            <div className="min-h-screen flex items-center justify-center text-gray-700 text-xl">Dashboard Estudiante</div>
          </RutaProtegida>
        } />
        <Route path="/inicio" element={<Inicio />} />
      </Routes>
    </BrowserRouter>
  );
}
