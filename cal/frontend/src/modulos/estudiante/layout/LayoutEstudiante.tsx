import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../seguridad/store';

const menu = [
  { path: '/estudiante/dashboard', icono: 'D', label: 'Dashboard' },
  { path: '/estudiante/horario', icono: 'H', label: 'Mi Horario' },
  { path: '/estudiante/formularios', icono: 'F', label: 'Evaluaciones' },
];

export default function LayoutEstudiante() {
  const navigate = useNavigate();
  const { cerrarSesion, usuario } = useAuthStore();

  const manejarSalida = () => { cerrarSesion(); navigate('/login'); };
  const iniciales = usuario?.email?.substring(0, 2).toUpperCase() ?? 'ES';
  const [menuAbierto, setMenuAbierto] = useState(false);

  return (
    <div className="flex h-screen bg-gray-100 flex-col md:flex-row">
      {/* Cabecera Móvil */}
      <div className="md:hidden flex items-center justify-between bg-blue-950 p-4 text-white shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm">C</div>
          <div>
            <p className="text-white text-sm font-semibold leading-tight">Cambridge</p>
            <p className="text-blue-300 text-xs">Academy</p>
          </div>
        </div>
        <button onClick={() => setMenuAbierto(true)} className="p-2 bg-blue-900 rounded-lg text-white focus:outline-none">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>
      </div>

      {/* Overlay Móvil */}
      {menuAbierto && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setMenuAbierto(false)}></div>
      )}

      {/* Barra Lateral */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 md:w-48 bg-blue-950 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 flex flex-col ${menuAbierto ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between px-4 py-5 border-b border-white/10 md:justify-start">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm">C</div>
            <div>
              <p className="text-white text-sm font-semibold leading-tight">Cambridge</p>
              <p className="text-blue-300 text-xs">Academy</p>
            </div>
          </div>
          <button onClick={() => setMenuAbierto(false)} className="md:hidden p-1 text-gray-400 hover:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <nav className="flex-1 px-2 py-4 space-y-1">
          {menu.map((item) => (
            <NavLink key={item.path} to={item.path}
              className={({ isActive }) =>
                isActive
                  ? 'flex items-center gap-3 px-3 py-2 rounded-lg text-sm bg-white/15 text-white font-medium'
                  : 'flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-blue-200 hover:bg-white/10 hover:text-white'
              }
              onClick={() => setMenuAbierto(false)}
            >
              <span className="text-base w-4 text-center">{item.icono}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="px-4 py-4 border-t border-white/10">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center text-white text-xs font-bold">{iniciales}</div>
            <div>
              <p className="text-white text-xs font-medium truncate">{usuario?.email}</p>
              <p className="text-blue-300 text-xs">Estudiante</p>
            </div>
          </div>
          <button onClick={manejarSalida} className="w-full text-xs text-blue-300 hover:text-white hover:bg-white/10 py-1 rounded transition-colors">
            Cerrar sesion
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto bg-gray-50 h-[calc(100vh-72px)] md:h-screen w-full relative"><Outlet /></main>
    </div>
  );
}
