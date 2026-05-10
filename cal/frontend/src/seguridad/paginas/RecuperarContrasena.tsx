import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, Mail, ArrowLeft, Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { clienteApi } from '../../compartido/api';

export default function RecuperarContrasena() {
  const [email, setEmail] = useState('');
  const [cargando, setCargando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState('');

  const manejarEnvio = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);
    setError('');

    try {
      await clienteApi.post('/auth/recuperar-contrasena', { email });
      setEnviado(true);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg ?? 'Ocurrio un error. Por favor intenta de nuevo.');
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
              Recupera tu <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">acceso</span>
            </h1>
            <p className="text-blue-200 text-lg mb-8 leading-relaxed">
              Te enviaremos un enlace seguro a tu correo institucional para restablecer tu contraseña rápidamente y sin complicaciones.
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
            Volver al inicio de sesión
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center pt-16">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" as const, delay: 0.2 }}
            className="w-full max-w-md"
          >
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
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Restablecer contraseña</h2>
              <p className="text-gray-500">
                Ingresa tu correo institucional y te enviaremos las instrucciones de recuperación.
              </p>
            </div>

            <AnimatePresence mode="wait">
              {!enviado ? (
                <motion.form 
                  key="form"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  onSubmit={manejarEnvio} className="space-y-6"
                >
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-gray-700">
                      Correo electrónico
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        required
                        placeholder="usuario@cambridge.edu.co"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 pl-11 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm bg-gray-50/50 hover:bg-gray-50"
                      />
                      <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
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
                    type="submit"
                    disabled={cargando}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 rounded-xl text-sm transition-all shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2"
                  >
                    {cargando ? <Loader2 className="w-5 h-5 animate-spin" /> : <Mail className="w-5 h-5" />}
                    {cargando ? 'Enviando...' : 'Enviar enlace de recuperación'}
                  </motion.button>
                </motion.form>
              ) : (
                <motion.div 
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                  className="bg-emerald-50 border border-emerald-100 p-8 rounded-2xl text-center shadow-sm"
                >
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">¡Enlace enviado!</h3>
                  <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                    Hemos enviado las instrucciones para restablecer tu contraseña a <strong>{email}</strong>. Por favor, revisa tu bandeja de entrada.
                  </p>
                  <Link
                    to="/login"
                    className="inline-flex items-center justify-center w-full bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 font-medium py-2.5 rounded-xl text-sm transition-colors mb-4"
                  >
                    Volver a iniciar sesión
                  </Link>
                  <p className="text-xs text-gray-400 text-center mt-4 border-t border-gray-200/60 pt-4">
                    ¿No recibiste el correo?{' '}
                    <button
                      onClick={() => { setEnviado(false); setError(''); }}
                      className="text-blue-600 font-medium hover:underline"
                    >
                      Intentar de nuevo
                    </button>
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
