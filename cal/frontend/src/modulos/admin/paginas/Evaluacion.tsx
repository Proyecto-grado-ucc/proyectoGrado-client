import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clienteApi } from '../../../compartido/api';

// Tipos
interface Periodo { id: number; nombre: string; }
interface Formulario { id: number; titulo: string; descripcion: string | null; periodoId: number; periodoNombre: string; activo: boolean; }
interface Docente { id: number; usuarioNombre: string; }
interface Evaluacion { id: number; formularioId: number; formularioTitulo: string; docenteEvaluadoId: number; docenteEvaluadoNombre: string; evaluadorId: number | null; estado: string; creadoEn: string; }
interface ResultadoKdd { id: number; periodoId: number; docenteId: number; puntuacionGlobal: number; totalEvaluaciones: number; detalleDimensiones: Record<string, number>; creadoEn: string; }
interface Alerta { id: number; docenteId: number; periodoId: number; tipo: string; nivel: string; mensaje: string; leida: boolean; creadoEn: string; }

// Helpers
const api = clienteApi;

const fetchList = async <T extends object>(ruta: string, params?: Record<string, unknown>): Promise<T[]> => {
  const { data } = await api.get(ruta, { params: { page: 1, size: 100, ...params } });
  return (data.items ?? data) as T[];
};

const errMsg = (e: unknown): string => {
  const m = (e as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message;
  return Array.isArray(m) ? m.join(', ') : (m ?? 'Error inesperado');
};

const TABS = ['Formularios', 'Asignaciones', 'Resultados KDD', 'Alertas'];

const estadoBadge: Record<string, string> = {
  PENDIENTE: 'bg-gray-100 text-gray-600',
  EN_PROGRESO: 'bg-yellow-100 text-yellow-700',
  COMPLETADA: 'bg-green-100 text-green-700',
};

const nivelBadge: Record<string, string> = {
  INFO: 'bg-blue-100 text-blue-700',
  ADVERTENCIA: 'bg-yellow-100 text-yellow-700',
  CRITICO: 'bg-red-100 text-red-700',
};

// Tab Formularios
function TabFormularios() {
  const qc = useQueryClient();
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ titulo: '', periodoId: '', tipoEvaluacion: 'DESEMPENO' });
  const [err, setErr] = useState('');

  const { data: formularios, isLoading } = useQuery({
    queryKey: ['formularios'],
    queryFn: () => fetchList<Formulario>('/formularios'),
  });
  const { data: periodos } = useQuery({
    queryKey: ['periodos-ev'],
    queryFn: () => fetchList<Periodo>('/periodos'),
  });

  const mutCrear = useMutation({
    mutationFn: () => api.post('/formularios', { titulo: form.titulo, periodoId: Number(form.periodoId), activo: true, tipoEvaluacion: form.tipoEvaluacion }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['formularios'] });
      setModal(false);
      setForm({ titulo: '', periodoId: '', tipoEvaluacion: 'DESEMPENO' });
      setErr('');
    },
    onError: (e: unknown) => setErr(errMsg(e)),
  });

  const mutEliminar = useMutation({
    mutationFn: (id: number) => api.delete(`/formularios/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['formularios'] }),
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">{formularios?.length ?? 0} formularios registrados</p>
        <button onClick={() => setModal(true)} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-xl hover:bg-blue-700">
          + Nuevo formulario
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-400 text-sm">Cargando...</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Titulo', 'Periodo', 'Estado', 'Acciones'].map(c => (
                  <th key={c} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{c}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {formularios?.map(f => (
                <tr key={f.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{f.titulo}</td>
                  <td className="px-4 py-3 text-gray-600">{f.periodoNombre}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${f.activo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {f.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => { if (confirm('Eliminar formulario?')) mutEliminar.mutate(f.id); }}
                      className="text-xs text-red-500 hover:underline"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
              {!formularios?.length && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-gray-400 text-xs">
                    Sin formularios. Crea el primero.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-base font-bold text-gray-900 mb-4">Nuevo formulario de evaluacion</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Titulo</label>
                <input
                  value={form.titulo}
                  onChange={e => setForm({ ...form, titulo: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: Evaluacion Docente 2026-1"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Periodo academico</label>
                <select
                  value={form.periodoId}
                  onChange={e => setForm({ ...form, periodoId: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccionar...</option>
                  {periodos?.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Tipo de evaluación</label>
                <select
                  value={form.tipoEvaluacion}
                  onChange={e => setForm({ ...form, tipoEvaluacion: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="DESEMPENO">Desempeño Docente (Predeterminada)</option>
                  <option value="">Personalizada (Vacía)</option>
                </select>
              </div>
              {err && <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">{err}</p>}
            </div>
            <div className="flex gap-3 mt-5 justify-end">
              <button
                onClick={() => { setModal(false); setErr(''); }}
                className="text-sm px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  if (!form.titulo || !form.periodoId) { setErr('Completa todos los campos.'); return; }
                  mutCrear.mutate();
                }}
                disabled={mutCrear.isPending}
                className="text-sm px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60"
              >
                {mutCrear.isPending ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Tab Asignaciones
function TabAsignaciones() {
  const qc = useQueryClient();
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ formularioId: '', docenteEvaluadoId: '' });
  const [asignarTodos, setAsignarTodos] = useState(false);
  const [err, setErr] = useState('');

  const { data: evaluaciones, isLoading } = useQuery({
    queryKey: ['evaluaciones'],
    queryFn: () => fetchList<Evaluacion>('/evaluaciones'),
  });
  const { data: formularios } = useQuery({
    queryKey: ['formularios-sel'],
    queryFn: () => fetchList<Formulario>('/formularios'),
  });
  const { data: docentes } = useQuery({
    queryKey: ['docentes-sel'],
    queryFn: () => fetchList<Docente>('/docentes'),
  });

  const mutCrear = useMutation({
    mutationFn: () => {
      if (asignarTodos) {
        return api.post('/evaluaciones/asignar-todos', { formularioId: Number(form.formularioId) });
      }
      return api.post('/evaluaciones', {
        formularioId: Number(form.formularioId),
        docenteEvaluadoId: Number(form.docenteEvaluadoId),
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['evaluaciones'] });
      setModal(false);
      setForm({ formularioId: '', docenteEvaluadoId: '' });
      setAsignarTodos(false);
      setErr('');
    },
    onError: (e: unknown) => setErr(errMsg(e)),
  });

  const mutEliminar = useMutation({
    mutationFn: (id: number) => api.delete(`/evaluaciones/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['evaluaciones'] }),
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">{evaluaciones?.length ?? 0} asignaciones</p>
        <button onClick={() => setModal(true)} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-xl hover:bg-blue-700">
          + Nueva asignacion
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-400 text-sm">Cargando...</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Formulario', 'Docente evaluado', 'Estado', 'Creado', 'Acciones'].map(c => (
                  <th key={c} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{c}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {evaluaciones?.map(e => (
                <tr key={e.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{e.formularioTitulo}</td>
                  <td className="px-4 py-3 text-gray-600">{e.docenteEvaluadoNombre}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${estadoBadge[e.estado] ?? 'bg-gray-100 text-gray-600'}`}>
                      {e.estado}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{new Date(e.creadoEn).toLocaleDateString('es-CO')}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => { if (confirm('Eliminar asignacion?')) mutEliminar.mutate(e.id); }}
                      className="text-xs text-red-500 hover:underline"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
              {!evaluaciones?.length && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-400 text-xs">Sin asignaciones.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-base font-bold text-gray-900 mb-4">Nueva asignacion de evaluacion</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Formulario</label>
                <select
                  value={form.formularioId}
                  onChange={e => setForm({ ...form, formularioId: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccionar...</option>
                  {formularios?.map(f => <option key={f.id} value={f.id}>{f.titulo}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Docente evaluado</label>
                <select
                  value={form.docenteEvaluadoId}
                  onChange={e => setForm({ ...form, docenteEvaluadoId: e.target.value })}
                  disabled={asignarTodos}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-400"
                >
                  <option value="">Seleccionar...</option>
                  {docentes?.map(d => <option key={d.id} value={d.id}>{d.usuarioNombre}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  id="asignarTodos"
                  checked={asignarTodos}
                  onChange={(e) => setAsignarTodos(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="asignarTodos" className="text-sm text-gray-700 font-medium">Asignar a todos los docentes</label>
              </div>
              {err && <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">{err}</p>}
            </div>
            <div className="flex gap-3 mt-5 justify-end">
              <button
                onClick={() => { setModal(false); setErr(''); setAsignarTodos(false); }}
                className="text-sm px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  if (!form.formularioId || (!asignarTodos && !form.docenteEvaluadoId)) { setErr('Completa todos los campos necesarios.'); return; }
                  mutCrear.mutate();
                }}
                disabled={mutCrear.isPending}
                className="text-sm px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60"
              >
                {mutCrear.isPending ? 'Guardando...' : 'Asignar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Tab KDD
function TabKdd() {
  const [periodoId, setPeriodoId] = useState<number | ''>('');
  const [ejecutando, setEjecutando] = useState(false);
  const [msgKdd, setMsgKdd] = useState('');

  const { data: periodos } = useQuery({
    queryKey: ['periodos-kdd'],
    queryFn: () => fetchList<Periodo>('/periodos'),
  });
  const { data: resultados, refetch } = useQuery({
    queryKey: ['kdd-resultados', periodoId],
    queryFn: () => clienteApi.get('/kdd/resultados', { params: { periodoId } }).then(r => r.data as ResultadoKdd[]),
    enabled: periodoId !== '',
  });
  const { data: docentes } = useQuery({
    queryKey: ['docentes-kdd'],
    queryFn: () => fetchList<Docente>('/docentes'),
  });

  const ejecutar = async () => {
    if (!periodoId) { setMsgKdd('Selecciona un periodo primero.'); return; }
    setEjecutando(true);
    setMsgKdd('');
    try {
      const { data } = await clienteApi.post('/kdd/ejecutar', { periodoId: Number(periodoId) });
      const r = data as { resultados: number; alertas: number };
      setMsgKdd(`KDD completado: ${r.resultados} resultados, ${r.alertas} alertas generadas.`);
      refetch();
    } catch (e: unknown) {
      setMsgKdd('Error: ' + errMsg(e));
    } finally {
      setEjecutando(false);
    }
  };

  const scoreColor = (v: number) => v >= 4 ? 'text-green-600' : v >= 3 ? 'text-yellow-600' : 'text-red-600';

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <select
          value={periodoId}
          onChange={e => setPeriodoId(Number(e.target.value))}
          className="text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Seleccionar periodo...</option>
          {periodos?.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
        </select>
        <button
          onClick={ejecutar}
          disabled={ejecutando}
          className="px-4 py-2 text-sm bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-60 flex items-center gap-2"
        >
          {ejecutando ? (
            <>
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              Ejecutando KDD...
            </>
          ) : 'Ejecutar KDD'}
        </button>
        {msgKdd && (
          <span className={`text-xs px-3 py-1.5 rounded-lg ${msgKdd.startsWith('Error') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'}`}>
            {msgKdd}
          </span>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {!periodoId ? (
          <div className="p-8 text-center text-gray-400 text-sm">Selecciona un periodo para ver los resultados KDD</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Docente', 'Puntaje global', 'Evaluaciones', 'Dimensiones', 'Fecha'].map(c => (
                  <th key={c} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{c}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {resultados?.map(r => {
                const docente = docentes?.find(d => d.id === r.docenteId);
                return (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {docente?.usuarioNombre ?? `Docente ${r.docenteId}`}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-lg font-bold ${scoreColor(r.puntuacionGlobal)}`}>
                        {r.puntuacionGlobal.toFixed(2)}
                      </span>
                      <span className="text-gray-400 text-xs"> /5</span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{r.totalEvaluaciones}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {Object.entries(r.detalleDimensiones).map(([k, v]) => `${k}: ${v.toFixed(1)}`).join(' | ')}
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {new Date(r.creadoEn).toLocaleDateString('es-CO')}
                    </td>
                  </tr>
                );
              })}
              {periodoId && !resultados?.length && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-400 text-xs">
                    Sin resultados KDD para este periodo. Ejecuta el pipeline primero.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// Tab Alertas
function TabAlertas({ onConteo }: { onConteo: (n: number) => void }) {
  const qc = useQueryClient();

  const { data: alertas, isLoading } = useQuery({
    queryKey: ['alertas'],
    queryFn: () => fetchList<Alerta>('/alertas'),
  });

  useEffect(() => {
    if (alertas) onConteo(alertas.filter(a => !a.leida).length);
  }, [alertas, onConteo]);

  const mutLeer = useMutation({
    mutationFn: (id: number) => api.patch(`/alertas/${id}/leer`, {}),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['alertas'] }),
  });

  const mutEliminar = useMutation({
    mutationFn: (id: number) => api.delete(`/alertas/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['alertas'] }),
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">{alertas?.filter(a => !a.leida).length ?? 0} alertas sin leer</p>
      </div>
      <div className="space-y-3">
        {isLoading && <div className="p-8 text-center text-gray-400 text-sm">Cargando...</div>}
        {alertas?.map(a => (
          <div
            key={a.id}
            className={[
              'bg-white rounded-2xl border p-4 flex items-start gap-4',
              a.leida
                ? 'border-gray-100 opacity-60'
                : `border-l-4 ${a.nivel === 'CRITICO' ? 'border-l-red-500' : a.nivel === 'ADVERTENCIA' ? 'border-l-yellow-500' : 'border-l-blue-500'}`,
            ].join(' ')}
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${nivelBadge[a.nivel] ?? 'bg-gray-100 text-gray-600'}`}>
                  {a.nivel}
                </span>
                <span className="text-xs text-gray-400">{a.tipo.replace('_', ' ')}</span>
                {!a.leida && <span className="w-2 h-2 rounded-full bg-blue-500" />}
              </div>
              <p className="text-sm text-gray-700">{a.mensaje}</p>
              <p className="text-xs text-gray-400 mt-1">{new Date(a.creadoEn).toLocaleDateString('es-CO')}</p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              {!a.leida && (
                <button onClick={() => mutLeer.mutate(a.id)} className="text-xs text-blue-600 hover:underline">
                  Marcar leida
                </button>
              )}
              <button
                onClick={() => { if (confirm('Eliminar alerta?')) mutEliminar.mutate(a.id); }}
                className="text-xs text-red-500 hover:underline"
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
        {!isLoading && !alertas?.length && (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-gray-400 text-sm">
            Sin alertas generadas. Ejecuta el pipeline KDD para generar alertas automaticamente.
          </div>
        )}
      </div>
    </div>
  );
}

// Componente principal
export default function Evaluacion() {
  const [tab, setTab] = useState(0);
  const [alertasNoLeidas, setAlertasNoLeidas] = useState(0);

  return (
    <div className="p-8 min-h-full bg-gray-50">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Evaluacion docente</h1>
        <p className="text-gray-500 text-sm mt-0.5">Gestion del ciclo completo de evaluacion con analisis KDD</p>
      </div>

      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-xl w-fit">
        {TABS.map((t, i) => (
          <button
            key={t}
            onClick={() => setTab(i)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors relative ${
              i === tab ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t}
            {t === 'Alertas' && alertasNoLeidas > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {alertasNoLeidas}
              </span>
            )}
          </button>
        ))}
      </div>

      {tab === 0 && <TabFormularios />}
      {tab === 1 && <TabAsignaciones />}
      {tab === 2 && <TabKdd />}
      {tab === 3 && <TabAlertas onConteo={setAlertasNoLeidas} />}
    </div>
  );
}
