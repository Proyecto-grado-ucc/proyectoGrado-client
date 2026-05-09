import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { clienteApi } from '../../../compartido/api';
import { useAuthStore } from '../../../seguridad/store';

interface Docente { id: number; usuarioNombre: string; usuarioEmail: string; }
interface ResultadoKdd { docenteId: number; puntuacionGlobal: number; totalEvaluaciones: number; detalleDimensiones: Record<string, number>; periodoId: number; }
interface Evaluacion { id: number; docenteEvaluadoId: number; formularioTitulo: string; estado: string; }
interface Periodo { id: number; nombre: string; }

const fetchAll = async <T extends object>(ruta: string, size = 200): Promise<T[]> => {
  const { data } = await clienteApi.get(ruta, { params: { page: 1, size } });
  return (data.items ?? data) as T[];
};

// Fetch que no lanza error en 403 — retorna array vacio para docentes sin acceso
const fetchSafe = async <T extends object>(ruta: string, params?: Record<string, unknown>): Promise<T[]> => {
  try {
    const { data } = await clienteApi.get(ruta, { params });
    return (data.items ?? data) as T[];
  } catch {
    return [];
  }
};



export default function DashboardDocente() {
  const email = useAuthStore(s => s.usuario?.email ?? '');
  const [periodoId, setPeriodoId] = useState<number | null>(null);

  const { data: docentes } = useQuery({ queryKey: ['docentes-dash'], queryFn: () => fetchAll<Docente>('/docentes') });
  const { data: periodos } = useQuery({ queryKey: ['periodos-dash'], queryFn: () => fetchAll<Periodo>('/periodos', 50) });

  // Evaluaciones y KDD usan fetchSafe — si devuelven 403, retornan array vacio sin cerrar sesion
  const { data: evaluaciones = [] } = useQuery({
    queryKey: ['evaluaciones-dash'],
    queryFn: () => fetchSafe<Evaluacion>('/evaluaciones'),
  });

  useEffect(() => {
    if (periodos && periodos.length > 0 && periodoId === null) setPeriodoId(periodos[0].id);
  }, [periodos]);

  const { data: resultados = [] } = useQuery({
    queryKey: ['kdd-dash', periodoId],
    queryFn: () => fetchSafe<ResultadoKdd>('/kdd/resultados', { periodoId }),
    enabled: periodoId !== null,
  });

  const miDocente = docentes?.find(d => d.usuarioEmail === email);
  const miResultado = resultados.find(r => r.docenteId === miDocente?.id);
  const misEvaluaciones = evaluaciones.filter(e => e.docenteEvaluadoId === miDocente?.id);

  const periodoSeleccionado = periodos?.find(p => p.id === periodoId);
  
  // Agregar propiedad comentariosAnonimos al interface de Evaluacion si no está (Typecast para TS)
  const comentarios = misEvaluaciones.flatMap(e => (e as any).comentariosAnonimos || []);



  return (
    <div className="p-8 min-h-full bg-gray-50 flex flex-col">
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mis Resultados de Evaluación - {periodoSeleccionado?.nombre ?? 'Sin periodo'}</h1>
          <p className="text-gray-500 text-sm mt-0.5">El período de evaluación está cerrado. Estos son tus resultados agregados.</p>
        </div>
        <select
          value={periodoId ?? ''}
          onChange={e => setPeriodoId(Number(e.target.value))}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          {periodos?.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
        </select>
      </div>

      <div className="flex gap-6 flex-1">
        {/* Columna Izquierda */}
        <div className="w-[300px] flex flex-col gap-6">
          {/* Puntaje Global */}
          <div className="bg-white rounded-xl shadow-sm border-2 border-blue-500 p-8 flex flex-col items-center justify-center text-center">
            <div className="relative w-32 h-32 mb-4">
              <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                <path
                  className="text-gray-100"
                  strokeWidth="2"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className={`${miResultado ? 'text-green-500' : 'text-gray-300'}`}
                  strokeDasharray={`${miResultado ? (miResultado.puntuacionGlobal / 5) * 100 : 0}, 100`}
                  strokeWidth="2"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-3xl font-bold ${miResultado ? 'text-green-600' : 'text-gray-400'}`}>
                  {miResultado ? miResultado.puntuacionGlobal.toFixed(1) : '-'}
                </span>
              </div>
            </div>
            <h2 className="text-sm font-medium text-gray-500 mb-3">Puntaje global</h2>
            {miResultado && (
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                miResultado.puntuacionGlobal >= 4 ? 'bg-green-100 text-green-700' :
                miResultado.puntuacionGlobal >= 3 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
              }`}>
                {miResultado.puntuacionGlobal >= 4 ? 'Buen desempeño' : 
                 miResultado.puntuacionGlobal >= 3 ? 'Desempeño promedio' : 'Requiere mejora'}
              </span>
            )}
          </div>

          {/* Participación y Periodos Anteriores */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex-1">
            <h3 className="text-sm font-bold text-gray-900 mb-4">Participación</h3>
            <div className="text-center mb-6">
              <span className="text-3xl font-bold text-blue-600">
                {miResultado ? miResultado.totalEvaluaciones : 0}
              </span>
              <p className="text-xs text-gray-500 mt-1">estudiantes respondieron en este periodo</p>
            </div>

            <div className="border-t border-gray-100 pt-6 mt-4">
              <h3 className="text-sm font-bold text-gray-900 mb-4">Períodos anteriores</h3>
              <div className="space-y-3">
                {resultados
                  .filter(r => r.docenteId === miDocente?.id && r.periodoId !== periodoId)
                  .map(r => {
                    const p = periodos?.find(per => per.id === r.periodoId);
                    return (
                      <div key={r.periodoId} className="flex justify-between items-center text-sm">
                        <span className="text-gray-500">{p?.nombre ?? `Periodo ${r.periodoId}`}</span>
                        <span className="font-bold text-gray-900">{r.puntuacionGlobal.toFixed(1)}</span>
                      </div>
                    );
                  })}
                {resultados.filter(r => r.docenteId === miDocente?.id && r.periodoId !== periodoId).length === 0 && (
                  <p className="text-xs text-gray-400">No hay historial disponible.</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Columna Derecha */}
        <div className="flex-1 flex flex-col gap-6">
          {/* Resultados por dimensión */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <h3 className="text-base font-bold text-gray-900 mb-6">Resultados por dimensión</h3>
            
            {!miResultado ? (
              <p className="text-sm text-gray-400 py-4">No hay datos para mostrar en este periodo.</p>
            ) : (
              <div className="space-y-6">
                {Object.entries(miResultado.detalleDimensiones).map(([dim, val]) => {
                  const pct = (val / 5) * 100;
                  return (
                    <div key={dim}>
                      <div className="flex justify-between items-end mb-2">
                        <span className="text-sm font-medium text-gray-700">{dim}</span>
                        <span className={`text-sm font-bold ${pct >= 85 ? 'text-green-500' : pct >= 70 ? 'text-yellow-500' : 'text-red-500'}`}>
                          {val.toFixed(1)} / 5.0
                        </span>
                      </div>
                      <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${pct >= 85 ? 'bg-green-500' : pct >= 70 ? 'bg-yellow-500' : 'bg-red-500'}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Comentarios */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 flex-1">
            <h3 className="text-base font-bold text-gray-900 mb-6">Comentarios de estudiantes (anónimos)</h3>
            <div className="space-y-4">
              {comentarios.length === 0 ? (
                <p className="text-sm text-gray-400 py-4">No hay comentarios en este periodo.</p>
              ) : (
                comentarios.map((com, idx) => (
                  <div key={idx} className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                    <p className="text-sm text-gray-600 italic">"{com}"</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
