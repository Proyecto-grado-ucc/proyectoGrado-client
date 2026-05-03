import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
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
          <h1 className="text-white text-4xl font-bold leading-tight mb-4">Nueva contrasena</h1>
          <p className="text-blue-200 text-sm leading-relaxed">
            Crea una contrasena segura para proteger tu cuenta del Sistema CAL.
          </p>
        </div>
        <p className="relative z-10 text-blue-400 text-xs">Cambridge Academy of Languages 2026</p>
      </div>

      {/* Panel derecho */}
      <div className="flex-1 flex flex-col bg-white">
        <div className="flex justify-end p-6">
          <Link to="/login" className="text-sm text-blue-600 hover:underline">
            Ir al inicio de sesion
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center px-8">
          <div className="w-full max-w-md">
            {exitoso ? (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Contrasena restablecida</h2>
                <p className="text-gray-500 text-sm">
                  Tu contrasena fue actualizada correctamente. Seras redirigido al inicio de sesion en unos segundos...
                </p>
                <Link
                  to="/login"
                  className="inline-block mt-4 px-6 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
                >
                  Ir al inicio de sesion
                </Link>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">Crea tu nueva contrasena</h2>
                <p className="text-gray-500 text-sm mb-8">
                  Debe tener al menos 8 caracteres, una mayuscula y un numero.
                </p>

                <form onSubmit={manejarEnvio} className="space-y-5">
                  {/* Nueva contrasena */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nueva contrasena
                    </label>
                    <div className="relative">
                      <input
                        type={mostrarPass ? 'text' : 'password'}
                        required
                        value={nuevaContrasena}
                        onChange={(e) => setNuevaContrasena(e.target.value)}
                        placeholder="Minimo 8 caracteres"
                        disabled={!token}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                      />
                      <button
                        type="button"
                        onClick={() => setMostrarPass(!mostrarPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {mostrarPass ? (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                    {/* Indicador de fortaleza */}
                    {nuevaContrasena && (
                      <div className="mt-2">
                        <div className="flex gap-1 mb-1">
                          {[1, 2, 3, 4].map((i) => (
                            <div
                              key={i}
                              className={`h-1 flex-1 rounded-full transition-colors ${
                                i <= ft.nivel ? ft.color : 'bg-gray-200'
                              }`}
                            />
                          ))}
                        </div>
                        {ft.texto && (
                          <p className="text-xs text-gray-500">Fortaleza: <span className="font-medium">{ft.texto}</span></p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Confirmar contrasena */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Confirmar contrasena
                    </label>
                    <input
                      type={mostrarPass ? 'text' : 'password'}
                      required
                      value={confirmar}
                      onChange={(e) => setConfirmar(e.target.value)}
                      placeholder="Repite tu contrasena"
                      disabled={!token}
                      className={`w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 ${
                        confirmar && confirmar !== nuevaContrasena
                          ? 'border-red-300 bg-red-50'
                          : 'border-gray-300'
                      }`}
                    />
                    {confirmar && confirmar !== nuevaContrasena && (
                      <p className="text-xs text-red-500 mt-1">Las contrasenas no coinciden</p>
                    )}
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
                      {error}
                      {error.includes('expirado') && (
                        <span> <Link to="/recuperar-contrasena" className="underline font-medium">Solicitar nuevo enlace</Link></span>
                      )}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={cargando || !token}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2.5 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
                  >
                    {cargando ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      'Guardar nueva contrasena'
                    )}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
