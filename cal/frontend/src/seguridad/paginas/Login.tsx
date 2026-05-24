import { useState } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, GraduationCap, CheckCircle2, ChevronRight, Loader2, AlertTriangle } from 'lucide-react';
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } }
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-[45%] bg-blue-950 flex-col justify-between p-12 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div 
            animate={{ y: [0, -20, 0], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-blue-600/20 blur-3xl" 
          />
          <motion.div 
            animate={{ y: [0, 20, 0], opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[40%] -right-[20%] w-[80%] h-[80%] rounded-full bg-indigo-600/20 blur-3xl" 
          />
        </div>

        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="relative z-10 flex flex-col h-full justify-between">
          <motion.div variants={itemVariants} className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <GraduationCap className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-white font-bold text-xl tracking-tight">Cambridge</h2>
              <p className="text-blue-300 text-xs font-medium uppercase tracking-widest">Academy</p>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="max-w-md">
            <h1 className="text-white text-4xl md:text-5xl font-bold leading-tight mb-6">
              Sistema de Generación de Horarios Automáticos <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">y Evaluación Docente</span>
            </h1>
            <p className="text-blue-200 text-lg mb-8 leading-relaxed">
              Plataforma para la generación automática de horarios académicos y la evaluación del desempeño docente.
            </p>
            <ul className="space-y-4">
              {['Horarios automáticos con IA', 'Evaluación docente en línea', 'Analítica y reportes KDD'].map((item, i) => (
                <motion.li 
                  key={item} 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + (i * 0.1) }}
                  className="flex items-center gap-3 text-blue-100"
                >
                  <CheckCircle2 className="w-5 h-5 text-blue-400" />
                  <span>{item}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          <motion.p variants={itemVariants} className="text-blue-400/60 text-sm">
            © 2026 Cambridge Academy of Languages. Todos los derechos reservados.
          </motion.p>
        </motion.div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center bg-white px-6 sm:px-12 relative">
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-gray-900 font-bold text-lg tracking-tight">Cambridge</h2>
              <p className="text-blue-600 text-xs font-medium uppercase tracking-widest">Academy</p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Bienvenido de vuelta</h2>
            <p className="text-gray-500">Ingresa tus credenciales para acceder a tu cuenta.</p>
          </div>

          <form onSubmit={manejarEnvio} className="space-y-6">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">Correo electrónico</label>
              <input
                type="email" required placeholder="usuario@cambridge.edu.co"
                value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm bg-gray-50/50 hover:bg-gray-50"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">Contraseña</label>
              <div className="relative">
                <input
                  type={mostrarContrasena ? 'text' : 'password'} required placeholder="••••••••"
                  value={form.contrasena} onChange={(e) => setForm({ ...form, contrasena: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm bg-gray-50/50 hover:bg-gray-50 pr-12"
                />
                <button type="button" onClick={() => setMostrarContrasena(!mostrarContrasena)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {mostrarContrasena ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <div className="flex justify-end pt-1">
                <Link to="/recuperar-contrasena" className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl flex items-start gap-2"
                >
                  <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                  <p>{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button 
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              type="submit" disabled={cargando}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 rounded-xl text-sm transition-all shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2"
            >
              {cargando ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Iniciar sesión'}
              {!cargando && <ChevronRight className="w-4 h-4" />}
            </motion.button>
          </form>

          <div className="mt-10 pt-6 border-t border-gray-100">
            <p className="text-xs text-gray-400 mb-3 text-center uppercase tracking-wider font-semibold">Plataforma multi-rol</p>
            <div className="flex flex-wrap gap-2 justify-center">
              <span className="text-xs font-medium bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full border border-blue-100">Administrador</span>
              <span className="text-xs font-medium bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full border border-emerald-100">Docente</span>
              <span className="text-xs font-medium bg-amber-50 text-amber-700 px-3 py-1.5 rounded-full border border-amber-100">Estudiante</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
