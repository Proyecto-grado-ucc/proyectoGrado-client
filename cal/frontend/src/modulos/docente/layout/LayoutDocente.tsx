import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../seguridad/store';

const menu = [
  { path: '/docente/dashboard', icono: 'D', label: 'Dashboard' },
  { path: '/docente/horario', icono: 'H', label: 'Mi Horario' },
  { path: '/docente/evaluacion', icono: 'E', label: 'Mi Evaluacion' },
];

export default function LayoutDocente() {
  const navigate = useNavigate();
  const { cerrarSesion, usuario } = useAuthStore();

  const manejarSalida = () => { cerrarSesion(); navigate('/login'); };
  const iniciales = usuario?.email?.substring(0, 2).toUpperCase() ?? 'DO';

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-48 flex flex-col bg-blue-950">
        <div className="flex items-center gap-2 px-4 py-5 border-b border-white/10">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm">C</div>
          <div>
            <p className="text-white text-sm font-semibold leading-tight">Cambridge</p>
            <p className="text-blue-300 text-xs">Academy</p>
          </div>
        </div>
        <nav className="flex-1 px-2 py-4 space-y-1">
          {menu.map((item) => (
            <NavLink key={item.path} to={item.path}
              className={({ isActive }) =>
                isActive
                  ? 'flex items-center gap-3 px-3 py-2 rounded-lg text-sm bg-white/15 text-white font-medium'
                  : 'flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-blue-200 hover:bg-white/10 hover:text-white'
              }>
              <span className="text-base w-4 text-center">{item.icono}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="px-4 py-4 border-t border-white/10">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white text-xs font-bold">{iniciales}</div>
            <div>
              <p className="text-white text-xs font-medium truncate">{usuario?.email}</p>
              <p className="text-blue-300 text-xs">Docente</p>
            </div>
          </div>
          <button onClick={manejarSalida} className="w-full text-xs text-blue-300 hover:text-white hover:bg-white/10 py-1 rounded transition-colors">
            Cerrar sesion
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto"><Outlet /></main>
    </div>
  );
}
