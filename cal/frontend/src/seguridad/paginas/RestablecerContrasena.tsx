import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, Eye, EyeOff, Lock, CheckCircle2, ArrowLeft, Loader2, AlertTriangle } from 'lucide-react';
import { clienteApi } from '../../compartido/api';

export default function RestablecerContrasena() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') ?? '';

  const [nuevaContrasena, setNuevaContrasena] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [mostrarPass, setMostrarPass] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [exitoso, setExitoso] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      setError('El enlace de recuperacion no es valido. Solicita uno nuevo.');
    }
  }, [token]);

  const validarContrasena = (pass: string): string => {
    if (pass.length < 8) return 'Minimo 8 caracteres';
    if (!/[A-Z]/.test(pass)) return 'Debe incluir al menos una mayuscula';
    if (!/[0-9]/.test(pass)) return 'Debe incluir al menos un numero';
    return '';
  };

  const manejarEnvio = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const validacion = validarContrasena(nuevaContrasena);
    if (validacion) { setError(validacion); return; }
    if (nuevaContrasena !== confirmar) { setError('Las contrasenas no coinciden.'); return; }

    setCargando(true);
    try {
      await clienteApi.post('/auth/restablecer-contrasena', { token, nuevaContrasena });
      setExitoso(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg ?? 'Ocurrio un error. El enlace puede haber expirado.');
    } finally {
      setCargando(false);
    }
  };

  const fortaleza = (): { nivel: number; texto: string; color: string } => {
    const p = nuevaContrasena;
    let puntos = 0;
    if (p.length >= 8) puntos++;
    if (/[A-Z]/.test(p)) puntos++;
    if (/[0-9]/.test(p)) puntos++;
    if (/[^A-Za-z0-9]/.test(p)) puntos++;
    const mapa = [
      { nivel: 0, texto: '', color: '' },
      { nivel: 1, texto: 'Debil', color: 'bg-red-500' },
      { nivel: 2, texto: 'Regular', color: 'bg-yellow-500' },
      { nivel: 3, texto: 'Buena', color: 'bg-blue-500' },
      { nivel: 4, texto: 'Fuerte', color: 'bg-green-500' },
    ];
    return mapa[puntos] ?? mapa[0];
  };

  const ft = fortaleza();

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
      {/* Panel izquierdo decorativo */}
      <div className="hidden lg:flex lg:w-[45%] bg-blue-950 flex-col justify-between p-12 relative overflow-hidden">
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
              Nueva <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">contraseña</span>
            </h1>
            <p className="text-blue-200 text-lg mb-8 leading-relaxed">
              Crea una contraseña segura y robusta para proteger tu cuenta y tu información académica dentro del Sistema CAL.
            </p>
          </motion.div>

          <motion.p variants={itemVariants} className="text-blue-400/60 text-sm">
            © 2026 Cambridge Academy of Languages. Todos los derechos reservados.
          </motion.p>
        </motion.div>
      </div>

      {/* Panel derecho */}
      <div className="flex-1 flex flex-col bg-white px-6 sm:px-12 relative">
        <div className="flex justify-start p-6 absolute top-0 left-0 w-full z-20">
          <Link to="/login" className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Ir al inicio de sesión
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center pt-16">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" as const, delay: 0.2 }}
            className="w-full max-w-md"
          >
            <AnimatePresence mode="wait">
              {exitoso ? (
                <motion.div 
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                  className="bg-emerald-50 border border-emerald-100 p-8 rounded-2xl text-center shadow-sm"
                >
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Contraseña restablecida</h2>
                  <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                    Tu contraseña fue actualizada correctamente. Serás redirigido al inicio de sesión en unos segundos...
                  </p>
                  <Link
                    to="/login"
                    className="inline-flex items-center justify-center w-full bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 font-medium py-2.5 rounded-xl text-sm transition-colors"
                  >
                    Ir al inicio de sesión ahora
                  </Link>
                </motion.div>
              ) : (
                <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
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
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Crea tu nueva contraseña</h2>
                    <p className="text-gray-500">
                      Asegúrate de que tenga al menos 8 caracteres, una mayúscula y un número.
                    </p>
                  </div>

                  <form onSubmit={manejarEnvio} className="space-y-6">
                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium text-gray-700">
                        Nueva contraseña
                      </label>
                      <div className="relative">
                        <input
                          type={mostrarPass ? 'text' : 'password'}
                          required
                          value={nuevaContrasena}
                          onChange={(e) => setNuevaContrasena(e.target.value)}
                          placeholder="••••••••"
                          disabled={!token}
                          className="w-full border border-gray-200 rounded-xl px-4 py-3 pl-11 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm bg-gray-50/50 hover:bg-gray-50 disabled:bg-gray-100 pr-12"
                        />
                        <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <button
                          type="button"
                          onClick={() => setMostrarPass(!mostrarPass)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          {mostrarPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      
                      {/* Indicador de fortaleza */}
                      <AnimatePresence>
                        {nuevaContrasena && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="pt-2 overflow-hidden">
                            <div className="flex gap-1 mb-1.5">
                              {[1, 2, 3, 4].map((i) => (
                                <div
                                  key={i}
                                  className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                                    i <= ft.nivel ? ft.color : 'bg-gray-200'
                                  }`}
                                />
                              ))}
                            </div>
                            {ft.texto && (
                              <p className="text-xs text-gray-500 flex justify-between">
                                Fuerza de contraseña: <span className={`font-semibold ${ft.color.replace('bg-', 'text-')}`}>{ft.texto}</span>
                              </p>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium text-gray-700">
                        Confirmar contraseña
                      </label>
                      <div className="relative">
                        <input
                          type={mostrarPass ? 'text' : 'password'}
                          required
                          value={confirmar}
                          onChange={(e) => setConfirmar(e.target.value)}
                          placeholder="••••••••"
                          disabled={!token}
                          className={`w-full border rounded-xl px-4 py-3 pl-11 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm disabled:bg-gray-100 pr-12 ${
                            confirmar && confirmar !== nuevaContrasena
                              ? 'border-red-300 bg-red-50/50'
                              : 'border-gray-200 bg-gray-50/50 hover:bg-gray-50'
                          }`}
                        />
                        <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                      <AnimatePresence>
                        {confirmar && confirmar !== nuevaContrasena && (
                          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-xs text-red-500 mt-1.5">
                            Las contraseñas no coinciden
                          </motion.p>
                        )}
                      </AnimatePresence>
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
                          <div>
                            <p>{error}</p>
                            {error.includes('expirado') && (
                              <p className="mt-1"><Link to="/recuperar-contrasena" className="underline font-medium hover:text-red-700">Solicitar nuevo enlace</Link></p>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={cargando || !token}
                      className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 rounded-xl text-sm transition-all shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 mt-2"
                    >
                      {cargando ? <Loader2 className="w-5 h-5 animate-spin" /> : <Lock className="w-4 h-4" />}
                      {cargando ? 'Guardando...' : 'Guardar nueva contraseña'}
                    </motion.button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
