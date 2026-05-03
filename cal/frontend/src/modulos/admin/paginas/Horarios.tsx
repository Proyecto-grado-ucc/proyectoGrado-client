import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clienteApi } from '../../../compartido/api';

interface Periodo { id: number; nombre: string; fechaInicio: string; fechaFin: string; }
interface Asignacion { grupoId: number; docenteId: number; aulaId: number; franjaId: number; }
interface Horario {
  id: number; periodoId: number; periodoNombre: string;
  asignaciones: Asignacion[]; fitness: number; generaciones: number; tiempoMs: number; creadoEn: string;
}
interface Franja { id: number; diaSemana: string; horaInicio: string; horaFin: string; bloqueIdx: number; }
interface Grupo { id: number; codigo: string; cursoNombre: string; cursoId: number; }
interface Curso { id: number; nivelId: number; }
interface Nivel { id: number; codigo: string; }
interface Docente { id: number; usuarioNombre: string; usuarioEmail: string; }
interface Aula { id: number; codigo: string; tipo: string; }

const fetchAll = async <T extends object>(ruta: string, size = 200, extraParams: any = {}): Promise<T[]> => {
  const { data } = await clienteApi.get(ruta, { params: { page: 1, size, ...extraParams } });
  return data.items as T[];
};
const fetchHorarios = (archivado: boolean) => fetchAll<Horario>('/horarios', 50, { archivado });
const fetchHorario = async (id: number): Promise<Horario> => { const { data } = await clienteApi.get(`/horarios/${id}`); return data as Horario; };

const DIAS: Record<string, string> = { LUN: 'Lunes', MAR: 'Martes', MIE: 'Miercoles', JUE: 'Jueves', VIE: 'Viernes', SAB: 'Sabado' };
const ORDEN_DIAS = ['LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB'];
const NIVEL_COLOR: Record<string, string> = { A1: '#3b82f6', A2: '#8b5cf6', B1: '#10b981', B2: '#f59e0b', C1: '#ec4899' };

// ── Modal Generar ─────────────────────────────────────────────────────────────
function ModalGenerar({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [periodoId, setPeriodoId] = useState<number | ''>('');
  const [error, setError] = useState('');
  const { data: periodos } = useQuery({ queryKey: ['periodos-h'], queryFn: () => fetchAll<Periodo>('/periodos', 50) });
  const { data: grupos } = useQuery({ queryKey: ['grupos-h'], queryFn: () => fetchAll<Grupo>('/grupos') });
  const { data: docentes } = useQuery({ queryKey: ['docentes-h'], queryFn: () => fetchAll<Docente>('/docentes') });
  const { data: aulas } = useQuery({ queryKey: ['aulas-h'], queryFn: () => fetchAll<Aula>('/aulas') });
  const { data: franjas } = useQuery({ queryKey: ['franjas-h'], queryFn: () => fetchAll<Franja>('/franjas-horarias') });

  const mut = useMutation({
    mutationFn: (pid: number) => clienteApi.post('/horarios/generar', { periodoId: pid }),
    onSuccess: () => { onSuccess(); onClose(); },
    onError: (e: unknown) => {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg ?? 'Error al generar. Verifica grupos, docentes, aulas y franjas configuradas.');
    },
  });

  const resumen = [
    { label: 'Grupos activos', valor: grupos?.length ?? '-', color: '#3b82f6' },
    { label: 'Docentes disponibles', valor: docentes?.length ?? '-', color: '#8b5cf6' },
    { label: 'Aulas habilitadas', valor: aulas?.length ?? '-', color: '#10b981' },
    { label: 'Franjas configuradas', valor: franjas?.length ?? '-', color: '#f59e0b' },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Generar horario con IA</h2>
          <p className="text-sm text-gray-500 mt-0.5">Motor: Algoritmo Genetico + Busqueda Tabu + Gemini</p>
        </div>
        <div className="p-6 space-y-5">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Periodo academico</label>
            <select value={periodoId} onChange={e => setPeriodoId(Number(e.target.value))}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Seleccionar periodo...</option>
              {periodos?.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {resumen.map(r => (
              <div key={r.label} className="rounded-xl p-3 border border-gray-100 bg-gray-50 flex items-center gap-3">
                <div className="w-2 h-8 rounded-full flex-shrink-0" style={{ backgroundColor: r.color }} />
                <div>
                  <p className="text-xs text-gray-500">{r.label}</p>
                  <p className="text-xl font-bold text-gray-900">{r.valor}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-blue-50 rounded-xl p-4">
            <p className="text-xs font-semibold text-blue-700 mb-2">Restricciones duras aplicadas</p>
            <ul className="space-y-1">
              {['Sin cruces de docente en la misma franja', 'Sin cruces de aula en la misma franja', 'Respeta disponibilidad horaria del docente', 'Respeta carga maxima de horas', 'Sesiones correctas por grupo'].map(r => (
                <li key={r} className="flex items-start gap-2 text-xs text-blue-600"><span className="mt-0.5">v</span>{r}</li>
              ))}
            </ul>
          </div>
          <p className="text-xs text-gray-400 text-center">Tiempo estimado: 30 - 120 segundos</p>
          {error && <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-xl">{error}</p>}
        </div>
        <div className="p-6 border-t border-gray-100 flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm border border-gray-200 rounded-xl hover:bg-gray-50">Cancelar</button>
          <button
            onClick={() => { if (!periodoId) { setError('Selecciona un periodo.'); return; } mut.mutate(periodoId as number); }}
            disabled={mut.isPending}
            className="px-5 py-2 text-sm bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-60 flex items-center gap-2">
            {mut.isPending
              ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Generando...</>
              : 'Generar horario'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Popup de detalle de celda ─────────────────────────────────────────────────
function DetalleAsignacion({ asig, grupos, docentes, aulas, onClose }: {
  asig: Asignacion; grupos: Grupo[]; docentes: Docente[]; aulas: Aula[]; onClose: () => void;
}) {
  const grupo = grupos.find(g => g.id === asig.grupoId);
  const docente = docentes.find(d => d.id === asig.docenteId);
  const aula = aulas.find(a => a.id === asig.aulaId);
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-72">
        <h3 className="font-bold text-gray-900 mb-4">Detalle de asignacion</h3>
        <div className="space-y-3 text-sm">
          <div><p className="text-xs text-gray-400">Grupo</p><p className="font-medium">{grupo?.codigo ?? `ID ${asig.grupoId}`}</p></div>
          <div><p className="text-xs text-gray-400">Curso</p><p className="font-medium">{grupo?.cursoNombre ?? '-'}</p></div>
          <div><p className="text-xs text-gray-400">Docente</p><p className="font-medium">{docente?.usuarioNombre ?? `ID ${asig.docenteId}`}</p></div>
          <div><p className="text-xs text-gray-400">Aula</p><p className="font-medium">{aula?.codigo ?? `ID ${asig.aulaId}`} ({aula?.tipo ?? ''})</p></div>
        </div>
        <button onClick={onClose} className="mt-5 w-full py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-xl">Cerrar</button>
      </div>
    </div>
  );
}

// ── Grilla semanal ─────────────────────────────────────────────────────────────
function GrillaHorario({ horario, franjas, grupos, docentes, aulas, cursos, niveles, filtroDocente, filtroAula }: {
  horario: Horario; franjas: Franja[]; grupos: Grupo[]; docentes: Docente[]; aulas: Aula[];
  cursos: Curso[]; niveles: Nivel[];
  filtroDocente: string; filtroAula: string;
}) {
  const [detalle, setDetalle] = useState<Asignacion | null>(null);
  const diasPresentes = [...new Set(franjas.map(f => f.diaSemana))].sort((a, b) => ORDEN_DIAS.indexOf(a) - ORDEN_DIAS.indexOf(b));
  const bloquesUnicos = [...new Set(franjas.map(f => f.bloqueIdx))].sort((a, b) => a - b);

  const asigFiltradas = horario.asignaciones.filter(a => {
    if (filtroDocente && String(a.docenteId) !== filtroDocente) return false;
    if (filtroAula && String(a.aulaId) !== filtroAula) return false;
    return true;
  });

  const getAsig = (dia: string, bloque: number) => {
    const franja = franjas.find(f => f.diaSemana === dia && f.bloqueIdx === bloque);
    if (!franja) return null;
    return asigFiltradas.find(a => a.franjaId === franja.id) ?? null;
  };

  const getColor = (asig: Asignacion) => {
    const grupo = grupos.find(g => g.id === asig.grupoId);
    const curso = cursos.find(c => c.id === grupo?.cursoId);
    const nivel = niveles.find(n => n.id === curso?.nivelId);
    return NIVEL_COLOR[nivel?.codigo ?? ''] ?? '#6b7280';
  };

  const getHora = (bloque: number) => {
    const f = franjas.find(x => x.bloqueIdx === bloque);
    return f ? `${f.horaInicio.substring(0, 5)}-${f.horaFin.substring(0, 5)}` : `Bloque ${bloque}`;
  };

  if (!asigFiltradas.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400">
        <p className="text-sm font-medium">Sin asignaciones para el filtro seleccionado</p>
        <p className="text-xs mt-1">Ajusta los filtros o genera un nuevo horario</p>
      </div>
    );
  }

  return (
    <>
      {detalle && <DetalleAsignacion asig={detalle} grupos={grupos} docentes={docentes} aulas={aulas} onClose={() => setDetalle(null)} />}
      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr>
              <th className="bg-gray-50 px-3 py-2 text-left text-gray-500 font-semibold border border-gray-100 w-28">Horario</th>
              {diasPresentes.map(d => (
                <th key={d} className="bg-gray-50 px-3 py-2 text-center text-gray-700 font-semibold border border-gray-100">{DIAS[d] ?? d}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {bloquesUnicos.map(bloque => (
              <tr key={bloque}>
                <td className="bg-gray-50 px-3 py-2 text-gray-500 border border-gray-100 whitespace-nowrap font-medium text-xs">{getHora(bloque)}</td>
                {diasPresentes.map(dia => {
                  const asig = getAsig(dia, bloque);
                  const grupo = asig ? grupos.find(g => g.id === asig.grupoId) : null;
                  const docente = asig ? docentes.find(d => d.id === asig.docenteId) : null;
                  const aula = asig ? aulas.find(a => a.id === asig.aulaId) : null;
                  const color = asig ? getColor(asig) : '';
                  return (
                    <td key={dia} className="border border-gray-100 p-1 align-top h-20 w-36">
                      {asig ? (
                        <button onClick={() => setDetalle(asig)}
                          className="w-full h-full rounded-lg p-1.5 text-left hover:opacity-80 transition-opacity"
                          style={{ backgroundColor: `${color}20`, borderLeft: `3px solid ${color}` }}>
                          <p className="font-semibold text-gray-800 truncate text-xs">{grupo?.cursoNombre ?? `Grupo ${asig.grupoId}`}</p>
                          <p className="text-gray-500 truncate text-xs">{grupo?.codigo ?? ''}</p>
                          <p className="text-gray-400 truncate text-xs">{(docente?.usuarioNombre ?? '').split(' ')[0]} - {aula?.codigo ?? ''}</p>
                        </button>
                      ) : (
                        <div className="w-full h-full rounded-lg border border-dashed border-gray-200" />
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

// ── Componente principal ───────────────────────────────────────────────────────
export default function Horarios() {
  const qc = useQueryClient();
  const [horarioSelId, setHorarioSelId] = useState<number | null>(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [filtroDocente, setFiltroDocente] = useState('');
  const [filtroAula, setFiltroAula] = useState('');
  const [tab, setTab] = useState<'activos' | 'historial'>('activos');

  const { data: horarios, isLoading: cargandoLista } = useQuery({ queryKey: ['horarios', tab], queryFn: () => fetchHorarios(tab === 'historial') });
  const { data: horarioDetalle, isLoading: cargandoDetalle } = useQuery({
    queryKey: ['horario', horarioSelId], queryFn: () => fetchHorario(horarioSelId!), enabled: horarioSelId !== null,
  });
  const { data: franjas } = useQuery({ queryKey: ['franjas-grid'], queryFn: () => fetchAll<Franja>('/franjas-horarias') });
  const { data: grupos } = useQuery({ queryKey: ['grupos-grid'], queryFn: () => fetchAll<Grupo>('/grupos') });
  const { data: docentes } = useQuery({ queryKey: ['docentes-grid'], queryFn: () => fetchAll<Docente>('/docentes') });
  const { data: aulas } = useQuery({ queryKey: ['aulas-grid'], queryFn: () => fetchAll<Aula>('/aulas') });
  const { data: cursos } = useQuery({ queryKey: ['cursos-grid'], queryFn: () => fetchAll<Curso>('/cursos') });
  const { data: niveles } = useQuery({ queryKey: ['niveles-grid'], queryFn: () => fetchAll<Nivel>('/niveles') });

  useEffect(() => {
    if (horarios && horarios.length > 0 && !horarios.find(h => h.id === horarioSelId)) setHorarioSelId(horarios[0].id);
    if (horarios?.length === 0) setHorarioSelId(null);
  }, [horarios]);

  const mutEliminar = useMutation({
    mutationFn: (id: number) => clienteApi.delete(`/horarios/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['horarios'] }); setHorarioSelId(null); },
  });

  const mutArchivarTodos = useMutation({
    mutationFn: () => clienteApi.post('/horarios/archivar-todos'),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['horarios'] }); setHorarioSelId(null); },
  });

  const mutBorrarHistorial = useMutation({
    mutationFn: () => clienteApi.delete('/horarios/historial'),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['horarios'] }); setHorarioSelId(null); },
  });

  const horarioActual = horarios?.find(h => h.id === horarioSelId);
  const tieneData = franjas && grupos && docentes && aulas && cursos && niveles && horarioDetalle;

  return (
    <div className="p-8 min-h-full bg-gray-50">
      {mostrarModal && (
        <ModalGenerar onClose={() => setMostrarModal(false)} onSuccess={() => qc.invalidateQueries({ queryKey: ['horarios'] })} />
      )}

      {/* Encabezado */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Horarios {horarioActual ? `- ${horarioActual.periodoNombre}` : ''}</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {horarioActual
              ? `Generado ${new Date(horarioActual.creadoEn).toLocaleDateString('es-CO')} - Fitness: ${horarioActual.fitness.toFixed(4)} - ${horarioActual.generaciones} generaciones - ${(horarioActual.tiempoMs / 1000).toFixed(1)}s`
              : 'Gestion y generacion de horarios con IA'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {tab === 'activos' ? (
            <>
              {horarios && horarios.length > 0 && (
                <button onClick={() => { if (confirm('¿Seguro que deseas archivar todos los horarios activos? (Fin de periodo)')) mutArchivarTodos.mutate(); }}
                  disabled={mutArchivarTodos.isPending}
                  className="px-4 py-2 text-sm text-yellow-700 bg-yellow-100 rounded-xl hover:bg-yellow-200">
                  {mutArchivarTodos.isPending ? 'Archivando...' : 'Archivar todos (Fin de periodo)'}
                </button>
              )}
              {horarioSelId && (
                <button onClick={() => { if (confirm('Eliminar este horario?')) mutEliminar.mutate(horarioSelId); }}
                  className="px-3 py-2 text-sm text-red-600 border border-red-200 rounded-xl hover:bg-red-50">
                  Eliminar
                </button>
              )}
              <button onClick={() => setMostrarModal(true)}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-xl hover:bg-blue-700">
                + Generar con IA
              </button>
            </>
          ) : (
            <button onClick={() => { if (confirm('¿Seguro que deseas borrar TODO el historial definitivamente?')) mutBorrarHistorial.mutate(); }}
              disabled={mutBorrarHistorial.isPending}
              className="px-4 py-2 text-sm bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-60">
              {mutBorrarHistorial.isPending ? 'Borrando...' : 'Borrar Historial'}
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 bg-gray-100 p-1 rounded-xl w-fit">
        <button onClick={() => setTab('activos')} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${tab === 'activos' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Activos</button>
        <button onClick={() => setTab('historial')} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${tab === 'historial' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Historial</button>
      </div>

      {/* Controles */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-5 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-gray-500">Horario:</label>
          <select value={horarioSelId ?? ''} onChange={e => setHorarioSelId(Number(e.target.value))}
            disabled={cargandoLista || !horarios?.length}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
            {cargandoLista && <option value="">Cargando...</option>}
            {!cargandoLista && !horarios?.length && <option value="">Sin horarios</option>}
            {horarios?.map(h => (
              <option key={h.id} value={h.id}>{h.periodoNombre} - {new Date(h.creadoEn).toLocaleDateString('es-CO')}</option>
            ))}
          </select>
        </div>
        <div className="w-px h-5 bg-gray-200" />
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-gray-500">Docente:</label>
          <select value={filtroDocente} onChange={e => setFiltroDocente(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Todos</option>
            {docentes?.map(d => <option key={d.id} value={String(d.id)}>{d.usuarioNombre}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-gray-500">Aula:</label>
          <select value={filtroAula} onChange={e => setFiltroAula(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Todas</option>
            {aulas?.map(a => <option key={a.id} value={String(a.id)}>{a.codigo}</option>)}
          </select>
        </div>
        {(filtroDocente || filtroAula) && (
          <button onClick={() => { setFiltroDocente(''); setFiltroAula(''); }}
            className="text-xs text-gray-400 hover:text-gray-600 underline">Limpiar filtros</button>
        )}
        <div className="ml-auto flex gap-4 text-xs text-gray-400">
          {Object.entries(NIVEL_COLOR).map(([n, c]) => (
            <span key={n} className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c }} />{n}
            </span>
          ))}
        </div>
      </div>

      {/* Grilla */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {cargandoLista ? (
          <div className="p-12 text-center text-gray-400 text-sm animate-pulse">Cargando horarios...</div>
        ) : !horarios?.length ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <p className="text-base font-semibold text-gray-600 mb-1">Aun no hay horarios generados</p>
            <p className="text-sm mb-5">Usa el boton "Generar con IA" para crear el primero</p>
            <button onClick={() => setMostrarModal(true)} className="px-5 py-2.5 bg-blue-600 text-white text-sm rounded-xl hover:bg-blue-700">
              + Generar con IA
            </button>
          </div>
        ) : cargandoDetalle ? (
          <div className="p-12 text-center text-gray-400 text-sm animate-pulse">Cargando detalle...</div>
        ) : tieneData ? (
          <GrillaHorario horario={horarioDetalle} franjas={franjas} grupos={grupos} docentes={docentes} aulas={aulas} cursos={cursos} niveles={niveles} filtroDocente={filtroDocente} filtroAula={filtroAula} />
        ) : null}
      </div>
    </div>
  );
}
