import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { clienteApi } from '../../../compartido/api';
import { useAuthStore } from '../../../seguridad/store';

interface Docente { id: number; usuarioNombre: string; usuarioEmail: string; }
interface Horario { id: number; periodoNombre: string; asignaciones: { grupoId: number; docenteId: number; aulaId: number; franjaId: number; }[]; }
interface Franja { id: number; diaSemana: string; horaInicio: string; horaFin: string; bloqueIdx: number; }
interface Grupo { id: number; codigo: string; cursoNombre: string; }
interface Aula { id: number; codigo: string; }
interface ResultadoKdd { docenteId: number; puntuacionGlobal: number; totalEvaluaciones: number; detalleDimensiones: Record<string, number>; periodoId: number; }
interface Evaluacion { id: number; docenteEvaluadoId: number; formularioTitulo: string; estado: string; }
interface Periodo { id: number; nombre: string; }

const fetchAll = async <T extends object>(ruta: string, size = 200): Promise<T[]> => {
  const { data } = await clienteApi.get(ruta, { params: { page: 1, size } });
  return (data.items ?? data) as T[];
};

const DIAS: Record<string, string> = { LUN: 'Lunes', MAR: 'Martes', MIE: 'Miercoles', JUE: 'Jueves', VIE: 'Viernes', SAB: 'Sabado' };

export default function DashboardDocente() {
  const email = useAuthStore(s => s.usuario?.email ?? '');
  const [periodoId, setPeriodoId] = useState<number | null>(null);

  const { data: docentes } = useQuery({ queryKey: ['docentes-dash'], queryFn: () => fetchAll<Docente>('/docentes') });
  const { data: periodos } = useQuery({ queryKey: ['periodos-dash'], queryFn: () => fetchAll<Periodo>('/periodos', 50) });
  const { data: horarios } = useQuery({ queryKey: ['horarios-dash'], queryFn: () => fetchAll<Horario>('/horarios', 50) });
  const { data: franjas } = useQuery({ queryKey: ['franjas-dash'], queryFn: () => fetchAll<Franja>('/franjas-horarias') });
  const { data: grupos } = useQuery({ queryKey: ['grupos-dash'], queryFn: () => fetchAll<Grupo>('/grupos') });
  const { data: aulas } = useQuery({ queryKey: ['aulas-dash'], queryFn: () => fetchAll<Aula>('/aulas') });
  const { data: evaluaciones } = useQuery({ queryKey: ['evaluaciones-dash'], queryFn: () => fetchAll<Evaluacion>('/evaluaciones') });

  useEffect(() => {
    if (periodos && periodos.length > 0 && periodoId === null) setPeriodoId(periodos[0].id);
  }, [periodos]);

  const { data: resultados } = useQuery({
    queryKey: ['kdd-dash', periodoId],
    queryFn: () => clienteApi.get('/kdd/resultados', { params: { periodoId } }).then(r => r.data as ResultadoKdd[]),
    enabled: periodoId !== null,
  });

  const miDocente = docentes?.find(d => d.usuarioEmail === email);
  const miResultado = resultados?.find(r => r.docenteId === miDocente?.id);
  const misEvaluaciones = evaluaciones?.filter(e => e.docenteEvaluadoId === miDocente?.id) ?? [];

  // Calcular clases de esta semana desde el horario
  const horarioActivo = horarios?.[0];
  const misAsignaciones = horarioActivo?.asignaciones.filter(a => a.docenteId === miDocente?.id) ?? [];

  const scoreColor = (v: number) => v >= 4 ? '#10b981' : v >= 3 ? '#f59e0b' : '#ef4444';

  return (
    <div className="p-8 min-h-full bg-gray-50">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Mi Dashboard</h1>
        <p className="text-gray-500 text-sm mt-0.5">Bienvenido, {miDocente?.usuarioNombre ?? email}</p>
      </div>

      {/* Tarjetas resumen */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500 mb-1">Clases esta semana</p>
          <p className="text-3xl font-bold text-gray-900">{misAsignaciones.length}</p>
          <div className="mt-2 h-1 bg-green-500 rounded-full w-3/4" />
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500 mb-1">Evaluaciones recibidas</p>
          <p className="text-3xl font-bold text-gray-900">{misEvaluaciones.length}</p>
          <div className="mt-2 h-1 bg-blue-500 rounded-full w-1/2" />
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500 mb-1">Mi puntaje global</p>
          <p className="text-3xl font-bold" style={{ color: miResultado ? scoreColor(miResultado.puntuacionGlobal) : '#9ca3af' }}>
            {miResultado ? miResultado.puntuacionGlobal.toFixed(2) : '-'}
          </p>
          <div className="mt-2 h-1 rounded-full w-4/5" style={{ backgroundColor: miResultado ? scoreColor(miResultado.puntuacionGlobal) : '#e5e7eb' }} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Horario semanal resumido */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Mi horario — {horarioActivo?.periodoNombre ?? 'Sin horario'}</h2>
          {misAsignaciones.length === 0 ? (
            <p className="text-sm text-gray-400">Sin asignaciones en el horario activo.</p>
          ) : (
            <div className="space-y-2">
              {misAsignaciones.slice(0, 5).map((a, i) => {
                const franja = franjas?.find(f => f.id === a.franjaId);
                const grupo = grupos?.find(g => g.id === a.grupoId);
                const aula = aulas?.find(au => au.id === a.aulaId);
                return (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50">
                    <div>
                      <p className="text-xs font-medium text-gray-800">{grupo?.cursoNombre ?? `Grupo ${a.grupoId}`} — {grupo?.codigo ?? ''}</p>
                      <p className="text-xs text-gray-400">{DIAS[franja?.diaSemana ?? ''] ?? franja?.diaSemana} {franja?.horaInicio?.substring(0, 5)}-{franja?.horaFin?.substring(0, 5)}</p>
                    </div>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{aula?.codigo ?? `Aula ${a.aulaId}`}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Resultados KDD */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-700">Mi evaluacion</h2>
            <select value={periodoId ?? ''} onChange={e => setPeriodoId(Number(e.target.value))}
              className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none">
              {periodos?.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </select>
          </div>
          {miResultado ? (
            <div className="space-y-3">
              {Object.entries(miResultado.detalleDimensiones).map(([dim, val]) => (
                <div key={dim}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-600">{dim}</span>
                    <span className="font-medium text-gray-800">{val.toFixed(2)}/5</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full">
                    <div className="h-1.5 rounded-full" style={{ width: `${(val / 5) * 100}%`, backgroundColor: scoreColor(val) }} />
                  </div>
                </div>
              ))}
              <p className="text-xs text-gray-400 mt-2">Basado en {miResultado.totalEvaluaciones} evaluaciones</p>
            </div>
          ) : (
            <p className="text-sm text-gray-400">Sin resultados KDD para este periodo.</p>
          )}
        </div>
      </div>
    </div>
  );
}
