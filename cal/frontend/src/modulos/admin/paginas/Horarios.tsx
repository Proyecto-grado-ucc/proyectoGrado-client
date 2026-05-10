import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clienteApi } from '../../../compartido/api';
import { useUIStore } from '../../../compartido/storeUI';
import { motion, AnimatePresence } from 'framer-motion';
import { SkeletonTable } from '../../../compartido/Skeleton';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

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
  const [excluirTipos, setExcluirTipos] = useState<string[]>([]);
  const { data: periodos } = useQuery({ queryKey: ['periodos-h'], queryFn: () => fetchAll<Periodo>('/periodos', 50) });
  const { data: grupos } = useQuery({ queryKey: ['grupos-h'], queryFn: () => fetchAll<Grupo>('/grupos') });
  const { data: docentes } = useQuery({ queryKey: ['docentes-h'], queryFn: () => fetchAll<Docente>('/docentes') });
  const { data: aulas } = useQuery({ queryKey: ['aulas-h'], queryFn: () => fetchAll<Aula>('/aulas') });
  const { data: franjas } = useQuery({ queryKey: ['franjas-h'], queryFn: () => fetchAll<Franja>('/franjas-horarias') });

  const mut = useMutation({
    mutationFn: (pid: number) => clienteApi.post('/horarios/generar', { periodoId: pid, excluirTiposAula: excluirTipos.length ? excluirTipos : undefined }),
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
      >
        <div className="p-6 border-b border-gray-100 bg-gray-50/50">
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
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-xs font-semibold text-gray-700 mb-2">Restricciones Voluntarias (Opcional)</p>
            <p className="text-[11px] text-gray-500 mb-2">Selecciona los tipos de aulas que deseas excluir de la asignación.</p>
            <div className="flex gap-4">
              {['SALON', 'LAB', 'VIRTUAL'].map(tipo => (
                <label key={tipo} className="flex items-center gap-1.5 text-xs text-gray-700 cursor-pointer">
                  <input type="checkbox" checked={excluirTipos.includes(tipo)}
                    onChange={(e) => {
                      if (e.target.checked) setExcluirTipos([...excluirTipos, tipo]);
                      else setExcluirTipos(excluirTipos.filter(t => t !== tipo));
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                  {tipo === 'SALON' ? 'Salón' : tipo === 'LAB' ? 'Laboratorio' : 'Virtual'}
                </label>
              ))}
            </div>
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
      </motion.div>
    </div>
  );
}

// ── Popup de detalle de celda y mover manualmente ─────────────────────────────
function DetalleAsignacion({ asig, grupos, docentes, aulas, franjas, asignaciones, onMover, onClose }: {
  asig: Asignacion; grupos: Grupo[]; docentes: Docente[]; aulas: Aula[];
  franjas: Franja[]; asignaciones: Asignacion[];
  onMover: (asigOrig: Asignacion, fIdDest: number) => void;
  onClose: () => void;
}) {
  const [nuevoDia, setNuevoDia] = useState('');
  const [nuevoBloque, setNuevoBloque] = useState<number | ''>('');
  const [error, setError] = useState('');

  const grupo = grupos.find(g => g.id === asig.grupoId);
  const docente = docentes.find(d => d.id === asig.docenteId);
  const aula = aulas.find(a => a.id === asig.aulaId);
  const franjaActual = franjas.find(f => f.id === asig.franjaId);

  const diasUnicos = [...new Set(franjas.map(f => f.diaSemana))].sort((a, b) => ORDEN_DIAS.indexOf(a) - ORDEN_DIAS.indexOf(b));
  const getHoraParaSort = (bloque: number) => { const f = franjas.find(x => x.bloqueIdx === bloque); return f ? f.horaInicio : '23:59:59'; };
  const bloquesUnicos = [...new Set(franjas.map(f => f.bloqueIdx))].sort((a, b) => getHoraParaSort(a).localeCompare(getHoraParaSort(b)));
  const getHora = (bloque: number) => { const f = franjas.find(x => x.bloqueIdx === bloque); return f ? `${f.horaInicio.substring(0, 5)}-${f.horaFin.substring(0, 5)}` : `Bloque ${bloque}`; };

  const handleGuardar = () => {
    if (!nuevoDia || nuevoBloque === '') { setError('Selecciona el nuevo día y horario.'); return; }
    const fIdDest = franjas.find(f => f.diaSemana === nuevoDia && f.bloqueIdx === nuevoBloque)?.id;
    if (!fIdDest) { setError('Franja horaria no encontrada.'); return; }
    if (fIdDest === asig.franjaId) { onClose(); return; } // No hubo cambios

    // Validar cruces
    const asigsEnDestino = asignaciones.filter(a => a.franjaId === fIdDest);
    const cruceDocente = asigsEnDestino.some(a => a.docenteId === asig.docenteId);
    const cruceAula = asigsEnDestino.some(a => a.aulaId === asig.aulaId);
    const cruceGrupo = asigsEnDestino.some(a => a.grupoId === asig.grupoId);

    if (cruceDocente || cruceAula || cruceGrupo) {
      const motivo = cruceDocente ? 'El docente' : cruceAula ? 'El aula' : 'El grupo';
      setError(`Cruce detectado: ${motivo} ya tiene clase asignada en este horario.`);
      return;
    }

    onMover(asig, fIdDest);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm max-h-[90vh] overflow-y-auto"
      >
        <h3 className="font-bold text-gray-900 mb-4 flex items-center justify-between">
          <span>Detalle y Edición</span>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </h3>
        
        <div className="space-y-3 text-sm mb-6 bg-gray-50 p-3 rounded-xl border border-gray-100">
          <div><p className="text-xs text-gray-400">Día y Hora Actual</p><p className="font-medium text-blue-700">{DIAS[franjaActual?.diaSemana ?? ''] ?? ''} - {franjaActual ? `${franjaActual.horaInicio.substring(0,5)} a ${franjaActual.horaFin.substring(0,5)}` : ''}</p></div>
          <div><p className="text-xs text-gray-400">Grupo / Curso</p><p className="font-medium">{grupo?.codigo ?? ''} - {grupo?.cursoNombre ?? '-'}</p></div>
          <div><p className="text-xs text-gray-400">Docente</p><p className="font-medium">{docente?.usuarioNombre ?? `ID ${asig.docenteId}`}</p></div>
          <div><p className="text-xs text-gray-400">Aula</p><p className="font-medium">{aula?.codigo ?? `ID ${asig.aulaId}`} ({aula?.tipo ?? ''})</p></div>
        </div>

        <div className="border-t border-gray-100 pt-4">
          <h4 className="font-medium text-sm text-gray-800 mb-3">Mover manualmente a:</h4>
          
          <div className="space-y-3 mb-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Día</label>
              <select value={nuevoDia} onChange={e => setNuevoDia(e.target.value)} className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Seleccionar día...</option>
                {diasUnicos.map(d => <option key={d} value={d}>{DIAS[d] ?? d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Horario (Bloque)</label>
              <select value={nuevoBloque} onChange={e => setNuevoBloque(Number(e.target.value))} className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Seleccionar hora...</option>
                {bloquesUnicos.map(b => <option key={b} value={b}>{getHora(b)}</option>)}
              </select>
            </div>
          </div>

          {error && <p className="text-xs text-red-600 bg-red-50 p-2 rounded-lg mb-3">{error}</p>}

          <div className="flex gap-2">
            <button onClick={onClose} className="flex-1 py-2 text-sm text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50">Cancelar</button>
            <button onClick={handleGuardar} className="flex-1 py-2 text-sm bg-blue-600 text-white rounded-xl hover:bg-blue-700">Mover Clase</button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ── Grilla semanal ────────────────────────────────────────────
function GrillaHorario({ horario, franjas, grupos, docentes, aulas, cursos, niveles, filtroDocente, filtroAula, onAsignacionesChange, guardando }: {
  horario: Horario; franjas: Franja[]; grupos: Grupo[]; docentes: Docente[]; aulas: Aula[];
  cursos: Curso[]; niveles: Nivel[];
  filtroDocente: string; filtroAula: string;
  onAsignacionesChange: (asigs: Asignacion[]) => void;
  guardando: boolean;
}) {
  const [detalle, setDetalle] = useState<Asignacion | null>(null);
  const [asignaciones, setAsignaciones] = useState<Asignacion[]>(horario.asignaciones);
  const [statusMsg, setStatusMsg] = useState('');

  // Solo reiniciar asignaciones cuando cambia el ID del horario
  useEffect(() => { setAsignaciones(horario.asignaciones); }, [horario.id]);

  const diasPresentes = [...new Set(franjas.map(f => f.diaSemana))].sort((a, b) => ORDEN_DIAS.indexOf(a) - ORDEN_DIAS.indexOf(b));
  const getHoraParaSort = (bloque: number) => { const f = franjas.find(x => x.bloqueIdx === bloque); return f ? f.horaInicio : '23:59:59'; };
  const bloquesUnicos = [...new Set(franjas.map(f => f.bloqueIdx))].sort((a, b) => getHoraParaSort(a).localeCompare(getHoraParaSort(b)));

  const asigFiltradas = asignaciones.filter(a => {
    if (filtroDocente && String(a.docenteId) !== filtroDocente) return false;
    if (filtroAula && String(a.aulaId) !== filtroAula) return false;
    return true;
  });

  const getFranjaId = (dia: string, bloque: number) => franjas.find(f => f.diaSemana === dia && f.bloqueIdx === bloque)?.id ?? null;
  const getAsigs = (dia: string, bloque: number) => { const fId = getFranjaId(dia, bloque); if (!fId) return []; return asigFiltradas.filter(a => a.franjaId === fId); };
  const getColor = (asig: Asignacion) => { const g = grupos.find(x => x.id === asig.grupoId); const c = cursos.find(x => x.id === g?.cursoId); const n = niveles.find(x => x.id === c?.nivelId); return NIVEL_COLOR[n?.codigo ?? ''] ?? '#6b7280'; };
  const getHora = (bloque: number) => { const f = franjas.find(x => x.bloqueIdx === bloque); return f ? `${f.horaInicio.substring(0, 5)}-${f.horaFin.substring(0, 5)}` : `Bloque ${bloque}`; };

  const handleMoverManual = (asigOriginal: Asignacion, fIdDest: number) => {
    const asigIdx = asignaciones.findIndex(a => a.grupoId === asigOriginal.grupoId && a.docenteId === asigOriginal.docenteId && a.aulaId === asigOriginal.aulaId && a.franjaId === asigOriginal.franjaId);
    if (asigIdx === -1) return;
    const nuevas = asignaciones.map((a, i) => i === asigIdx ? { ...a, franjaId: fIdDest } : a);
    setAsignaciones(nuevas);
    onAsignacionesChange(nuevas);
    setStatusMsg('Clase movida exitosamente.');
    setTimeout(() => setStatusMsg(''), 3000);
  };

  if (!asigFiltradas.length) return (
    <div className="flex flex-col items-center justify-center py-16 text-gray-400">
      <p className="text-sm font-medium">Sin asignaciones para el filtro seleccionado</p>
      <p className="text-xs mt-1">Ajusta los filtros o genera un nuevo horario</p>
    </div>
  );

  return (
    <>
      {/* Modal Mover */}
      <AnimatePresence>
        {detalle && <DetalleAsignacion key="modal-mover" asig={detalle} grupos={grupos} docentes={docentes} aulas={aulas} franjas={franjas} asignaciones={asignaciones} onMover={handleMoverManual} onClose={() => setDetalle(null)} />}
      </AnimatePresence>

      {/* Titulos de dias */}
      {statusMsg && <div className="mx-4 mt-2 mb-0 px-3 py-2 bg-green-50 text-green-700 text-xs rounded-lg">{statusMsg}</div>}
      {guardando && <div className="mx-4 mt-2 mb-0 px-3 py-2 bg-blue-50 text-blue-600 text-xs rounded-lg flex items-center gap-2"><span className="w-3 h-3 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin" />Guardando cambios...</div>}
      <div className="overflow-x-auto p-4" id="horario-grilla-print">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr>
              <th className="bg-gray-50 px-3 py-2 text-left text-gray-500 font-semibold border border-gray-100 w-28">Horario</th>
              {diasPresentes.map(d => <th key={d} className="bg-gray-50 px-3 py-2 text-center text-gray-700 font-semibold border border-gray-100">{DIAS[d] ?? d}</th>)}
            </tr>
          </thead>
          <tbody>
            {bloquesUnicos.map(bloque => (
              <tr key={bloque}>
                <td className="bg-gray-50 px-3 py-2 text-gray-500 border border-gray-100 whitespace-nowrap font-medium text-xs">{getHora(bloque)}</td>
                {diasPresentes.map(dia => {
                  const asigs = getAsigs(dia, bloque);
                  return (
                    <td key={dia} className="border border-gray-100 p-1 align-top min-h-[5rem] w-36">
                      {asigs.length > 0 ? (
                        <div className="flex flex-col gap-1 w-full h-full">
                          {asigs.map((asig, i) => {
                            const grupo = grupos.find(g => g.id === asig.grupoId);
                            const docente = docentes.find(d => d.id === asig.docenteId);
                            const aula = aulas.find(a => a.id === asig.aulaId);
                            const color = getColor(asig);
                            
                            return (
                              <div
                                key={`${asig.grupoId}-${asig.docenteId}-${asig.franjaId}-${i}`}
                                onClick={() => setDetalle(asig)}
                                className="w-full rounded-lg p-1.5 text-left cursor-pointer transition-all hover:opacity-80 shadow-sm"
                                style={{ backgroundColor: `${color}20`, borderLeft: `3px solid ${color}` }}>
                                <p className="font-semibold text-gray-800 truncate text-[11px] leading-tight mb-0.5">{grupo?.cursoNombre ?? `Grupo ${asig.grupoId}`}</p>
                                <p className="text-gray-500 truncate text-[10px] leading-tight">{grupo?.codigo ?? ''}</p>
                                <p className="text-gray-400 truncate text-[10px] leading-tight">{(docente?.usuarioNombre ?? '').split(' ')[0]} - {aula?.codigo ?? ''}</p>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="w-full h-full min-h-[4rem] rounded-lg border border-dashed border-gray-100 transition-colors bg-gray-50/50" />
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
  const { abrirConfirmacion } = useUIStore();
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

  const mutGuardarAsig = useMutation({
    mutationFn: (asigs: Asignacion[]) => clienteApi.patch(`/horarios/${horarioSelId}/asignaciones`, { asignaciones: asigs }),
  });

  const exportarExcel = async () => {
    if (!horarioDetalle || !franjas || !grupos || !docentes || !aulas || !cursos || !niveles) return;
    const diasP = [...new Set(franjas.map(f => f.diaSemana))].sort((a, b) => ORDEN_DIAS.indexOf(a) - ORDEN_DIAS.indexOf(b));
    const getHorS = (b: number) => { const f = franjas.find(x => x.bloqueIdx === b); return f ? f.horaInicio : '23:59:59'; };
    const bloques = [...new Set(franjas.map(f => f.bloqueIdx))].sort((a, b) => getHorS(a).localeCompare(getHorS(b)));
    const getAsig = (dia: string, blq: number) => { const fId = franjas.find(f => f.diaSemana === dia && f.bloqueIdx === blq)?.id; return fId ? horarioDetalle.asignaciones.find(a => a.franjaId === fId) : null; };
    const COLORES_HEX: Record<string, string> = { '#3b82f6': 'FF93C5F0', '#8b5cf6': 'FFCBB5FA', '#10b981': 'FF6EE7B7', '#f59e0b': 'FFFDE68A', '#ec4899': 'FFFBCFE8', '#6b7280': 'FFD1D5DB' };
    const getArgb = (asig: Asignacion) => { const g = grupos.find(x => x.id === asig.grupoId); const c = cursos.find(x => x.id === g?.cursoId); const n = niveles.find(x => x.id === c?.nivelId); const hex = NIVEL_COLOR[n?.codigo ?? ''] ?? '#6b7280'; return COLORES_HEX[hex] ?? 'FFD1D5DB'; };
    const getNivel = (asig: Asignacion) => { const g = grupos.find(x => x.id === asig.grupoId); const c = cursos.find(x => x.id === g?.cursoId); const n = niveles.find(x => x.id === c?.nivelId); return n?.codigo ?? ''; };

    const wb = new ExcelJS.Workbook();
    wb.creator = 'Sistema CAL';
    const ws = wb.addWorksheet(horarioActual?.periodoNombre ?? 'Horario', { pageSetup: { fitToPage: true, orientation: 'landscape' } });

    ws.mergeCells(1, 1, 1, diasP.length + 1);
    const titleCell = ws.getCell(1, 1);
    titleCell.value = `Horario Academico - ${horarioActual?.periodoNombre ?? ''} | Generado: ${new Date().toLocaleDateString('es-CO')}`;
    titleCell.font = { bold: true, size: 13, color: { argb: 'FFFFFFFF' } };
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A8A' } };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    ws.getRow(1).height = 28;

    const nivelesConColor = Object.entries(NIVEL_COLOR);
    ws.mergeCells(2, 1, 2, diasP.length + 1);
    const legendCell = ws.getCell(2, 1);
    legendCell.value = 'Colores por nivel: ' + nivelesConColor.map(([n]) => n).join('  |  ');
    legendCell.font = { italic: true, size: 9, color: { argb: 'FF374151' } };
    legendCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3F4F6' } };
    legendCell.alignment = { horizontal: 'center', vertical: 'middle' };
    ws.getRow(2).height = 18;

    const headerRow = ws.getRow(3);
    headerRow.values = ['Horario', ...diasP.map(d => DIAS[d] ?? d)];
    headerRow.eachCell(cell => {
      cell.font = { bold: true, size: 11, color: { argb: 'FFFFFFFF' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1D4ED8' } };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = { top: { style: 'thin', color: { argb: 'FFBFDBFE' } }, bottom: { style: 'thin', color: { argb: 'FFBFDBFE' } }, left: { style: 'thin', color: { argb: 'FFBFDBFE' } }, right: { style: 'thin', color: { argb: 'FFBFDBFE' } } };
    });
    headerRow.height = 22;

    bloques.forEach((blq, rowIdx) => {
      const f = franjas.find(x => x.bloqueIdx === blq);
      const hora = f ? `${f.horaInicio.substring(0, 5)} - ${f.horaFin.substring(0, 5)}` : `Bloque ${blq}`;
      const excelRow = ws.getRow(4 + rowIdx);
      excelRow.height = 72;

      const horaCell = excelRow.getCell(1);
      horaCell.value = hora;
      horaCell.font = { bold: true, size: 10 };
      horaCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } };
      horaCell.alignment = { horizontal: 'center', vertical: 'middle' };
      horaCell.border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };

      diasP.forEach((dia, colIdx) => {
        const a = getAsig(dia, blq);
        const cell = excelRow.getCell(2 + colIdx);
        if (a) {
          const g = grupos.find(x => x.id === a.grupoId);
          const d = docentes.find(x => x.id === a.docenteId);
          const au = aulas.find(x => x.id === a.aulaId);
          const nivel = getNivel(a);
          const argb = getArgb(a);
          cell.value = {
            richText: [
              { text: `${g?.cursoNombre ?? `Grupo ${a.grupoId}`}\n`, font: { bold: true, size: 10 } },
              { text: `📋 ${g?.codigo ?? ''}  •  Nivel: ${nivel}\n`, font: { size: 9 } },
              { text: `👤 ${d?.usuarioNombre ?? ''}\n`, font: { size: 9, italic: true } },
              { text: `🏫 ${au?.codigo ?? ''}  (${au?.tipo ?? ''})`, font: { size: 9 } },
            ]
          };
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb } };
          cell.alignment = { wrapText: true, vertical: 'top', horizontal: 'left' };
        } else {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } };
        }
        cell.border = { top: { style: 'thin', color: { argb: 'FFE5E7EB' } }, bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } }, left: { style: 'thin', color: { argb: 'FFE5E7EB' } }, right: { style: 'thin', color: { argb: 'FFE5E7EB' } } };
      });
    });

    ws.getColumn(1).width = 16;
    diasP.forEach((_, i) => { ws.getColumn(2 + i).width = 30; });

    const buffer = await wb.xlsx.writeBuffer();
    saveAs(new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), `horario_${horarioActual?.periodoNombre ?? 'export'}.xlsx`);
  };

  const exportarPdf = () => window.print();

  return (
    <div className="p-4 md:p-8 min-h-full bg-gray-50">
      <AnimatePresence>
        {mostrarModal && (
          <ModalGenerar key="modal-generar" onClose={() => setMostrarModal(false)} onSuccess={() => qc.invalidateQueries({ queryKey: ['horarios'] })} />
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Horarios {horarioActual ? `- ${horarioActual.periodoNombre}` : ''}</h1>
          <p className="text-xs md:text-sm text-gray-500 mt-0.5">
            {horarioActual
              ? `Generado ${new Date(horarioActual.creadoEn).toLocaleDateString('es-CO')} - Fitness: ${horarioActual.fitness.toFixed(4)}`
              : 'Gestion y generacion de horarios con IA'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {tab === 'activos' ? (
            <>
              {horarios && horarios.length > 0 && (
                <button 
                  onClick={() => abrirConfirmacion({ titulo: 'Archivar horarios', mensaje: '¿Seguro que deseas archivar todos los horarios activos? (Fin de periodo)', textoConfirmar: 'Sí, archivar', textoCancelar: 'Cancelar', tipo: 'peligro', onConfirmar: () => mutArchivarTodos.mutate() })}
                  disabled={mutArchivarTodos.isPending}
                  className="px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm text-yellow-700 bg-yellow-100 rounded-xl hover:bg-yellow-200">
                  {mutArchivarTodos.isPending ? 'Archivando...' : 'Archivar'}
                </button>
              )}
              {horarioSelId && (
                <button 
                  onClick={() => abrirConfirmacion({ titulo: 'Eliminar horario', mensaje: '¿Estás seguro de eliminar este horario?', textoConfirmar: 'Eliminar', textoCancelar: 'Cancelar', tipo: 'peligro', onConfirmar: () => mutEliminar.mutate(horarioSelId) })}
                  className="px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm text-red-600 border border-red-200 rounded-xl hover:bg-red-50">
                  Eliminar
                </button>
              )}
              {tieneData && (
                <>
                  <button onClick={exportarExcel} className="px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm text-green-700 border border-green-200 bg-green-50 rounded-xl hover:bg-green-100">Excel</button>
                  <button onClick={exportarPdf} className="px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm text-purple-700 border border-purple-200 bg-purple-50 rounded-xl hover:bg-purple-100">PDF</button>
                </>
              )}
              <button onClick={() => setMostrarModal(true)}
                className="px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm bg-blue-600 text-white rounded-xl hover:bg-blue-700 whitespace-nowrap">
                + Generar con IA
              </button>
            </>
          ) : (
            <button 
              onClick={() => abrirConfirmacion({ titulo: 'Borrar historial', mensaje: '¿Seguro que deseas borrar TODO el historial definitivamente?', textoConfirmar: 'Sí, borrar', textoCancelar: 'Cancelar', tipo: 'peligro', onConfirmar: () => mutBorrarHistorial.mutate() })}
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
          <SkeletonTable rows={12} cols={7} />
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
          <GrillaHorario
            horario={horarioDetalle} franjas={franjas} grupos={grupos} docentes={docentes}
            aulas={aulas} cursos={cursos} niveles={niveles}
            filtroDocente={filtroDocente} filtroAula={filtroAula}
            onAsignacionesChange={(asigs) => mutGuardarAsig.mutate(asigs)}
            guardando={mutGuardarAsig.isPending}
          />
        ) : null}
      </div>
    </div>
  );
}
