import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Calendar, ClipboardList, Menu, X, LogOut, GraduationCap, Moon, Sun } from 'lucide-react';
import { useAuthStore } from '../../../seguridad/store';

const menu = [
  { path: '/docente/dashboard', icono: LayoutDashboard, label: 'Dashboard' },
  { path: '/docente/horario', icono: Calendar, label: 'Mi Horario' },
  { path: '/docente/evaluacion', icono: ClipboardList, label: 'Mi Evaluación' },
];

export default function LayoutDocente() {
  const navigate = useNavigate();
  const { cerrarSesion, usuario } = useAuthStore();

  const manejarSalida = () => { cerrarSesion(); navigate('/login'); };
  const iniciales = usuario?.email?.substring(0, 2).toUpperCase() ?? 'DO';
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [darkMode, setDarkMode] = useState(
    document.documentElement.classList.contains('dark')
  );

  const toggleTheme = () => {
    if (darkMode) {
      document.documentElement.classList.remove('dark');
      setDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      setDarkMode(true);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 flex-col md:flex-row transition-colors duration-300">
      {/* Cabecera Móvil */}
      <div className="md:hidden flex items-center justify-between bg-blue-950 dark:bg-gray-950 p-4 text-white shrink-0 border-b border-blue-900 dark:border-gray-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-white text-sm font-bold tracking-tight leading-tight">Cambridge</p>
            <p className="text-emerald-300 text-[10px] font-medium uppercase tracking-widest">Academy</p>
          </div>
        </div>
        <button onClick={() => setMenuAbierto(true)} className="p-2 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-colors focus:outline-none">
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Overlay Móvil */}
      {menuAbierto && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setMenuAbierto(false)}></div>
      )}

      {/* Barra Lateral */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 lg:w-56 bg-blue-950 dark:bg-gray-950 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 flex flex-col shadow-xl md:shadow-none ${menuAbierto ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between px-6 py-6 border-b border-white/5 md:justify-start">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-white text-base font-bold tracking-tight leading-tight">Cambridge</p>
              <p className="text-emerald-300 text-[11px] font-medium uppercase tracking-widest">Academy</p>
            </div>
          </div>
          <button onClick={() => setMenuAbierto(false)} className="md:hidden p-1.5 bg-white/10 rounded-lg text-gray-300 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2">
          {menu.map((item) => {
            const Icon = item.icono;
            return (
              <NavLink key={item.path} to={item.path}
                className={({ isActive }) =>
                  isActive
                    ? 'flex items-center gap-3 px-4 py-3 rounded-xl text-sm bg-emerald-600/20 text-emerald-400 font-medium border border-emerald-500/20 transition-all'
                    : 'flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-gray-400 hover:bg-white/5 hover:text-gray-200 transition-all'
                }
                onClick={() => setMenuAbierto(false)}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="px-6 py-4 flex items-center justify-between border-t border-white/5 bg-black/10">
          <span className="text-xs text-gray-400 font-medium tracking-wide">TEMA</span>
          <button
            onClick={toggleTheme}
            className="p-2 bg-white/5 hover:bg-white/10 rounded-xl text-gray-300 transition-colors border border-white/5"
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>

        <div className="px-6 py-6 border-t border-white/5 bg-black/10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-sm font-bold shrink-0">
              {iniciales}
            </div>
            <div className="truncate">
              <p className="text-white text-sm font-medium truncate">{usuario?.email?.split('@')[0] || 'Docente'}</p>
              <p className="text-emerald-400 text-xs font-medium uppercase tracking-wider mt-0.5">Docente</p>
            </div>
          </div>
          <button onClick={manejarSalida} className="w-full flex items-center justify-center gap-2 text-sm font-medium text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 py-2.5 rounded-xl transition-all border border-white/5 hover:border-white/10">
            <LogOut className="w-4 h-4" />
            Cerrar sesión
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900 h-[calc(100vh-72px)] md:h-screen w-full relative transition-colors duration-300"><Outlet /></main>
    </div>
  );
}
