import { useQuery } from '@tanstack/react-query';
import { clienteApi } from '../../../compartido/api';

async function obtenerConteo(ruta: string) {
  const { data } = await clienteApi.get(ruta, { params: { page: 1, size: 1 } });
  return data.total as number;
}

async function obtenerPeriodos() {
  const { data } = await clienteApi.get('/periodos', { params: { page: 1, size: 5 } });
  return data.items;
}

export default function Dashboard() {
  const { data: totalDocentes } = useQuery({ queryKey: ['conteo-docentes'], queryFn: () => obtenerConteo('/docentes') });
  const { data: totalCursos } = useQuery({ queryKey: ['conteo-cursos'], queryFn: () => obtenerConteo('/cursos') });
  const { data: totalAulas } = useQuery({ queryKey: ['conteo-aulas'], queryFn: () => obtenerConteo('/aulas') });
  const { data: totalUsuarios } = useQuery({ queryKey: ['conteo-usuarios'], queryFn: () => obtenerConteo('/usuarios') });
  const { data: periodos } = useQuery({ queryKey: ['periodos-dashboard'], queryFn: obtenerPeriodos });

  const tarjetas = [
    { label: 'Docentes activos', valor: totalDocentes ?? '...', barra: 'bg-blue-500' },
    { label: 'Cursos activos', valor: totalCursos ?? '...', barra: 'bg-green-500' },
    { label: 'Aulas habilitadas', valor: totalAulas ?? '...', barra: 'bg-purple-500' },
    { label: 'Usuarios totales', valor: totalUsuarios ?? '...', barra: 'bg-orange-500' },
  ];

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Dashboard</h1>
      <p className="text-gray-500 text-sm mb-8">Bienvenido al sistema CAL</p>

      <div className="grid grid-cols-4 gap-4 mb-6">
        {tarjetas.map((t) => (
          <div key={t.label} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <p className="text-xs text-gray-500 mb-1">{t.label}</p>
            <p className="text-3xl font-bold text-gray-900">{t.valor}</p>
            <div className="mt-2 h-1 rounded-full w-3/4" style={{ backgroundColor: t.barra === 'bg-blue-500' ? '#3b82f6' : t.barra === 'bg-green-500' ? '#22c55e' : t.barra === 'bg-purple-500' ? '#a855f7' : '#f97316' }} />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Estado del horario</h2>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full font-medium">Borrador</span>
            <span className="text-sm text-gray-500">Periodo {periodos?.[0]?.nombre ?? '...'}</span>
          </div>
          <p className="text-xs text-gray-400 mt-3">Motor de IA pendiente — Fase 3</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Periodo academico activo</h2>
          {periodos && periodos.length > 0 ? (
            <div>
              <p className="text-lg font-bold text-gray-900">{periodos[0].nombre}</p>
              <p className="text-xs text-gray-400 mt-1">
                {new Date(periodos[0].fechaInicio).toLocaleDateString('es-CO')} — {new Date(periodos[0].fechaFin).toLocaleDateString('es-CO')}
              </p>
            </div>
          ) : (
            <div>
              <p className="text-sm text-gray-400">Sin periodos configurados</p>
              <a href="/admin/configuracion" className="text-xs text-blue-600 hover:underline mt-1 block">Crear periodo academico</a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
