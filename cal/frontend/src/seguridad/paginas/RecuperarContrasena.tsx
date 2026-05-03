import { useState } from 'react';
import { Link } from 'react-router-dom';
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

  return (
    <div className="min-h-screen flex">
      {/* Panel izquierdo decorativo */}
      <div className="hidden lg:flex lg:w-2/5 bg-gradient-to-br from-blue-900 to-blue-700 flex-col justify-between p-10 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-white" />
          <div className="absolute bottom-20 right-5 w-96 h-96 rounded-full bg-white" />
        </div>
        <div className="relative z-10">
          <div className="w-10 h-10 bg-blue-800 border border-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">C</span>
          </div>
        </div>
        <div className="relative z-10">
          <p className="text-blue-300 text-sm mb-2">Cambridge Academy of Languages</p>
          <h1 className="text-white text-4xl font-bold leading-tight mb-4">Recupera tu acceso</h1>
          <p className="text-blue-200 text-sm leading-relaxed">
            Te enviaremos un enlace seguro a tu correo institucional para restablecer tu contrasena.
          </p>
        </div>
        <p className="relative z-10 text-blue-400 text-xs">Cambridge Academy of Languages 2026</p>
      </div>

      {/* Panel derecho */}
      <div className="flex-1 flex flex-col bg-white">
        <div className="flex justify-end p-6">
          <Link to="/login" className="text-sm text-blue-600 hover:underline">
            Volver al inicio de sesion
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center px-8">
          <div className="w-full max-w-md">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Restablecer contrasena</h2>
            <p className="text-gray-500 text-sm mb-8">
              Ingresa tu correo institucional y te enviaremos las instrucciones de recuperacion.
            </p>

            {!enviado ? (
              <form onSubmit={manejarEnvio} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Correo electronico
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="usuario@cambridge.edu.co"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={cargando}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2.5 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
                >
                  {cargando ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    'Enviar enlace de recuperacion'
                  )}
                </button>

                <p className="text-xs text-gray-400 text-center">El enlace expira en 30 minutos</p>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-xl p-5 text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-green-800 font-semibold text-sm mb-1">Correo enviado</p>
                  <p className="text-green-700 text-sm">
                    Revisa la bandeja de <strong>{email}</strong>. El enlace expira en 30 minutos.
                  </p>
                </div>
                <p className="text-xs text-gray-400 text-center">
                  No recibiste el correo?{' '}
                  <button
                    onClick={() => { setEnviado(false); setError(''); }}
                    className="text-blue-600 hover:underline"
                  >
                    Intentar de nuevo
                  </button>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
