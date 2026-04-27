import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './seguridad/store';
import Login from './seguridad/paginas/Login';
import RecuperarContrasena from './seguridad/paginas/RecuperarContrasena';
import Inicio from './paginas/Inicio';

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
        <Route path="/admin/dashboard" element={
          <RutaProtegida>
            <div className="min-h-screen flex items-center justify-center text-gray-700 text-xl">Dashboard Administrador</div>
          </RutaProtegida>
        } />
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
