import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { clienteApi } from '../../../compartido/api';
import { useAuthStore } from '../../../seguridad/store';

interface Docente { id: number; usuarioNombre: string; usuarioEmail: string; }
interface ResultadoKdd { docenteId: number; puntuacionGlobal: number; totalEvaluaciones: number; detalleDimensiones: Record<string, number>; periodoId: number; }
interface Evaluacion { id: number; docenteEvaluadoId: number; formularioTitulo: string; estado: string; creadoEn: string; }
interface Periodo { id: number; nombre: string; }

const fetchAll = async <T extends object>(ruta: string): Promise<T[]> => {
  const { data } = await clienteApi.get(ruta, { params: { page: 1, size: 100 } });
  return (data.items ?? data) as T[];
};

const scoreColor = (v: number) => v >= 4 ? '#10b981' : v >= 3 ? '#f59e0b' : '#ef4444';
const estadoBadge: Record<string, string> = {
  PENDIENTE: 'bg-gray-100 text-gray-600',
  EN_PROGRESO: 'bg-yellow-100 text-yellow-700',
  COMPLETADA: 'bg-green-100 text-green-700',
};

export default function EvaluacionDocente() {
  const email = useAuthStore(s => s.usuario?.email ?? '');
  const [periodoId, setPeriodoId] = useState<number | null>(null);

  const { data: docentes } = useQuery({ queryKey: ['docentes-ed'], queryFn: () => fetchAll<Docente>('/docentes') });
  const { data: periodos } = useQuery({ queryKey: ['periodos-ed'], queryFn: () => fetchAll<Periodo>('/periodos') });
  const { data: evaluaciones } = useQuery({ queryKey: ['evaluaciones-ed'], queryFn: () => fetchAll<Evaluacion>('/evaluaciones') });

  useEffect(() => {
    if (periodos && periodos.length > 0 && periodoId === null) setPeriodoId(periodos[0].id);
  }, [periodos]);

  const { data: resultados } = useQuery({
    queryKey: ['kdd-ed', periodoId],
    queryFn: () => clienteApi.get('/kdd/resultados', { params: { periodoId } }).then(r => r.data as ResultadoKdd[]),
    enabled: periodoId !== null,
  });

  const miDocente = docentes?.find(d => d.usuarioEmail === email);
  const miResultado = resultados?.find(r => r.docenteId === miDocente?.id);
  const misEvaluaciones = evaluaciones?.filter(e => e.docenteEvaluadoId === miDocente?.id) ?? [];

  return (
    <div className="p-8 min-h-full bg-gray-50">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mi Evaluacion</h1>
          <p className="text-gray-500 text-sm mt-0.5">Resultados y estado de evaluaciones recibidas</p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-gray-500">Periodo:</label>
          <select value={periodoId ?? ''} onChange={e => setPeriodoId(Number(e.target.value))}
            className="text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
            {periodos?.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
          </select>
        </div>
      </div>

      {/* Puntaje global */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-5">Resultado KDD</h2>
        {miResultado ? (
          <div>
            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-5xl font-black" style={{ color: scoreColor(miResultado.puntuacionGlobal) }}>
                {miResultado.puntuacionGlobal.toFixed(2)}
              </span>
              <span className="text-gray-400 text-lg">/5.00</span>
              <span className="text-sm text-gray-500 ml-2">basado en {miResultado.totalEvaluaciones} evaluaciones</span>
            </div>
            <div className="space-y-4">
              {Object.entries(miResultado.detalleDimensiones).map(([dim, val]) => (
                <div key={dim}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-gray-600 font-medium">{dim}</span>
                    <span className="font-bold" style={{ color: scoreColor(val) }}>{val.toFixed(2)}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full">
                    <div className="h-2 rounded-full transition-all" style={{ width: `${(val / 5) * 100}%`, backgroundColor: scoreColor(val) }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            <p className="text-sm font-medium">Sin resultados KDD para este periodo</p>
            <p className="text-xs mt-1">Los resultados se generan cuando el administrador ejecuta el pipeline KDD</p>
          </div>
        )}
      </div>

      {/* Historial de evaluaciones */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50">
          <h2 className="text-sm font-semibold text-gray-700">Historial de evaluaciones ({misEvaluaciones.length})</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {['Formulario', 'Estado', 'Fecha'].map(c => (
                <th key={c} className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">{c}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {misEvaluaciones.map(e => (
              <tr key={e.id} className="hover:bg-gray-50">
                <td className="px-6 py-3 font-medium text-gray-800">{e.formularioTitulo}</td>
                <td className="px-6 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${estadoBadge[e.estado] ?? 'bg-gray-100 text-gray-600'}`}>{e.estado}</span>
                </td>
                <td className="px-6 py-3 text-gray-400 text-xs">{new Date(e.creadoEn).toLocaleDateString('es-CO')}</td>
              </tr>
            ))}
            {!misEvaluaciones.length && (
              <tr><td colSpan={3} className="px-6 py-8 text-center text-gray-400 text-sm">Sin evaluaciones registradas.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
