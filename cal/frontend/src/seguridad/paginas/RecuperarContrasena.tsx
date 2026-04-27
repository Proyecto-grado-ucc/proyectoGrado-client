import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function RecuperarContrasena() {
  const [email, setEmail] = useState('');
  const [cargando, setCargando] = useState(false);
  const [enviado, setEnviado] = useState(false);

  const manejarEnvio = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);
    await new Promise((r) => setTimeout(r, 1500));
    setCargando(false);
    setEnviado(true);
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
          <h1 className="text-white text-4xl font-bold leading-tight mb-4">Recupera tu acceso</h1>
          <p className="text-blue-200 text-sm leading-relaxed">
            Te enviaremos un enlace seguro a tu correo para restablecer tu contrasena.
          </p>
        </div>
        <p className="relative z-10 text-blue-400 text-xs">Cambridge Academy of Languages 2026</p>
      </div>

      <div className="flex-1 flex flex-col bg-white">
        <div className="flex justify-end p-6">
          <Link to="/login" className="text-sm text-blue-600 hover:underline">Volver al inicio de sesion</Link>
        </div>
        <div className="flex-1 flex items-center justify-center px-8">
          <div className="w-full max-w-md">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Restablecer contrasena</h2>
            <p className="text-gray-500 text-sm mb-8">Ingresa tu correo y te enviaremos las instrucciones de recuperacion.</p>

            <form onSubmit={manejarEnvio} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Correo electronico</label>
                <input
                  type="email" required placeholder="usuario@cambridge.edu.co"
                  value={email} onChange={(e) => setEmail(e.target.value)} disabled={enviado}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                />
              </div>

              {!enviado && (
                <button type="submit" disabled={cargando}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2.5 rounded-lg text-sm transition-colors flex items-center justify-center gap-2">
                  {cargando ? 'Enviando...' : 'Enviar enlace de recuperacion'}
                </button>
              )}

              <p className="text-xs text-gray-400">El enlace expira en 30 minutos</p>

              {enviado && (
                <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-lg flex items-start gap-2">
                  <span>Correo enviado! Revisa tu bandeja. El enlace expira en 30 minutos.</span>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
