import { useState } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { clienteApi } from '../../compartido/api';
import { useAuthStore } from '../store';
import type { CredencialesLogin, RespuestaAuth } from '../tipos';

export default function Login() {
  const navigate = useNavigate();
  const { iniciarSesion, estaAutenticado, usuario } = useAuthStore();

  const [form, setForm] = useState<CredencialesLogin>({ email: '', contrasena: '' });
  const [mostrarContrasena, setMostrarContrasena] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  if (estaAutenticado && usuario) {
    if (usuario.rol === 'Admin') return <Navigate to="/admin/dashboard" replace />;
    if (usuario.rol === 'Docente') return <Navigate to="/docente/dashboard" replace />;
    return <Navigate to="/estudiante/dashboard" replace />;
  }

  const manejarEnvio = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);
    setError('');
    try {
      const { data } = await clienteApi.post<RespuestaAuth>('/auth/login', form);
      iniciarSesion(data.access_token, data.refresh_token, data.rol, form.email);
      if (data.rol === 'Admin') navigate('/admin/dashboard', { replace: true });
      else if (data.rol === 'Docente') navigate('/docente/dashboard', { replace: true });
      else navigate('/estudiante/dashboard', { replace: true });
    } catch {
      setError('Credenciales incorrectas. Verifica tu correo y contrasena.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-2/5 bg-gradient-to-br from-blue-900 to-blue-700 flex-col justify-between p-10 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-white" />
          <div className="absolute bottom-20 right-5 w-96 h-96 rounded-full bg-white" />
        </div>
        <div className="relative z-10">
          <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">C</span>
          </div>
        </div>
        <div className="relative z-10">
          <p className="text-blue-300 text-sm mb-2">Cambridge Academy of Languages</p>
          <h1 className="text-white text-4xl font-bold leading-tight mb-8">Gestion Academica Inteligente</h1>
          <ul className="space-y-3">
            {['Horarios automaticos con IA', 'Evaluacion docente en linea', 'Analitica en tiempo real'].map((item) => (
              <li key={item} className="flex items-center gap-2 text-blue-100 text-sm">
                <span className="text-blue-300">+</span> {item}
              </li>
            ))}
          </ul>
        </div>
        <p className="relative z-10 text-blue-400 text-xs">Cambridge Academy of Languages 2026</p>
      </div>

      <div className="flex-1 flex items-center justify-center bg-white px-8">
        <div className="w-full max-w-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Bienvenido de vuelta</h2>
          <p className="text-gray-500 text-sm mb-8">Ingresa tus credenciales para acceder</p>

          <form onSubmit={manejarEnvio} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Correo electronico</label>
              <input
                type="email" required placeholder="usuario@cambridge.edu.co"
                value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contrasena</label>
              <div className="relative">
                <input
                  type={mostrarContrasena ? 'text' : 'password'} required placeholder="**********"
                  value={form.contrasena} onChange={(e) => setForm({ ...form, contrasena: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                />
                <button type="button" onClick={() => setMostrarContrasena(!mostrarContrasena)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs">
                  {mostrarContrasena ? 'Ocultar' : 'Ver'}
                </button>
              </div>
              <div className="text-right mt-1">
                <Link to="/recuperar-contrasena" className="text-xs text-blue-600 hover:underline">Olvidaste tu contrasena?</Link>
              </div>
            </div>

            {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>}

            <button type="submit" disabled={cargando}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2.5 rounded-lg text-sm transition-colors flex items-center justify-center gap-2">
              {cargando ? 'Iniciando sesion...' : 'Iniciar sesion'}
            </button>
          </form>

          <div className="mt-6">
            <p className="text-xs text-gray-400 mb-2 text-center">Roles disponibles en el sistema</p>
            <div className="flex gap-2 justify-center">
              <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full">Administrador</span>
              <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full">Docente</span>
              <span className="text-xs bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full">Estudiante</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
