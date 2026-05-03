import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clienteApi } from '../../../compartido/api';

const tabs = ['Aulas', 'Niveles', 'Cursos', 'Grupos', 'Franjas', 'Periodos', 'Docentes'];

const FRANJAS_INSTITUCIONALES = [
  { diaSemana: 'MAR', horaInicio: '14:00:00', horaFin: '16:00:00', bloqueIdx: 1 },
  { diaSemana: 'MIE', horaInicio: '14:00:00', horaFin: '16:00:00', bloqueIdx: 1 },
  { diaSemana: 'JUE', horaInicio: '14:00:00', horaFin: '16:00:00', bloqueIdx: 1 },
  { diaSemana: 'MAR', horaInicio: '16:00:00', horaFin: '18:00:00', bloqueIdx: 2 },
  { diaSemana: 'MIE', horaInicio: '16:00:00', horaFin: '18:00:00', bloqueIdx: 2 },
  { diaSemana: 'JUE', horaInicio: '16:00:00', horaFin: '18:00:00', bloqueIdx: 2 },
  { diaSemana: 'MAR', horaInicio: '18:00:00', horaFin: '20:00:00', bloqueIdx: 3 },
  { diaSemana: 'MIE', horaInicio: '18:00:00', horaFin: '20:00:00', bloqueIdx: 3 },
  { diaSemana: 'JUE', horaInicio: '18:00:00', horaFin: '20:00:00', bloqueIdx: 3 },
  { diaSemana: 'LUN', horaInicio: '08:00:00', horaFin: '10:00:00', bloqueIdx: 4 },
  { diaSemana: 'MAR', horaInicio: '08:00:00', horaFin: '10:00:00', bloqueIdx: 4 },
  { diaSemana: 'MIE', horaInicio: '08:00:00', horaFin: '10:00:00', bloqueIdx: 4 },
  { diaSemana: 'JUE', horaInicio: '08:00:00', horaFin: '10:00:00', bloqueIdx: 4 },
  { diaSemana: 'VIE', horaInicio: '08:00:00', horaFin: '10:00:00', bloqueIdx: 4 },
  { diaSemana: 'LUN', horaInicio: '10:00:00', horaFin: '12:00:00', bloqueIdx: 5 },
  { diaSemana: 'MAR', horaInicio: '10:00:00', horaFin: '12:00:00', bloqueIdx: 5 },
  { diaSemana: 'MIE', horaInicio: '10:00:00', horaFin: '12:00:00', bloqueIdx: 5 },
  { diaSemana: 'JUE', horaInicio: '10:00:00', horaFin: '12:00:00', bloqueIdx: 5 },
  { diaSemana: 'VIE', horaInicio: '10:00:00', horaFin: '12:00:00', bloqueIdx: 5 },
  { diaSemana: 'SAB', horaInicio: '08:30:00', horaFin: '12:00:00', bloqueIdx: 6 },
  { diaSemana: 'SAB', horaInicio: '14:30:00', horaFin: '16:00:00', bloqueIdx: 7 },
  { diaSemana: 'LUN', horaInicio: '16:30:00', horaFin: '18:00:00', bloqueIdx: 8 },
  { diaSemana: 'JUE', horaInicio: '16:30:00', horaFin: '18:00:00', bloqueIdx: 8 },
  { diaSemana: 'LUN', horaInicio: '18:30:00', horaFin: '20:00:00', bloqueIdx: 9 },
  { diaSemana: 'VIE', horaInicio: '18:30:00', horaFin: '20:00:00', bloqueIdx: 9 },
];

async function obtener(ruta: string, page: number) {
  const { data } = await clienteApi.get(ruta, { params: { page, size: 10 } });
  return data;
}
async function crear(ruta: string, body: object) {
  const { data } = await clienteApi.post(ruta, body);
  return data;
}
async function eliminar(ruta: string, id: number) {
  await clienteApi.delete(ruta + '/' + id);
}
async function actualizar(ruta: string, id: number, body: object) {
  const { data } = await clienteApi.patch(ruta + '/' + id, body);
  return data;
}

interface Campo {
  key: string;
  label: string;
  type?: string;
  opciones?: { value: string; label: string }[];
  opcionesRuta?: string;
  opcionesLabel?: string;
  opcionesValue?: string;
}

function parsearValor(valor: string, tipo?: string): string | number {
  if (tipo === 'number') return Number(valor);
  return valor;
}

function TablaFranjas() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState({ diaSemana: 'LUN', horaInicio: '', horaFin: '', bloqueIdx: '' });
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['/franjas-horarias', page],
    queryFn: () => obtener('/franjas-horarias', page),
  });

  const mutCrear = useMutation({
    mutationFn: (body: object) => crear('/franjas-horarias', body),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['/franjas-horarias'] }); setModal(false); setForm({ diaSemana: 'LUN', horaInicio: '', horaFin: '', bloqueIdx: '' }); setError(''); },
    onError: (e: unknown) => {
      const msg = (e as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(', ') : (msg ?? 'Error al guardar.'));
    },
  });

  const mutActualizar = useMutation({
    mutationFn: ({ id, body }: { id: number; body: object }) => actualizar('/franjas-horarias', id, body),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['/franjas-horarias'] }); setModal(false); setEditando(null); setError(''); },
    onError: (e: unknown) => {
      const msg = (e as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(', ') : (msg ?? 'Error al actualizar.'));
    },
  });

  const mutEliminar = useMutation({
    mutationFn: (id: number) => eliminar('/franjas-horarias', id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['/franjas-horarias'] }),
  });

  const cargarInstitucionales = async () => {
    if (!confirm('Esto creara las 25 franjas horarias institucionales de Cambridge. Continuar?')) return;
    setCargando(true);
    for (const franja of FRANJAS_INSTITUCIONALES) {
      try { await crear('/franjas-horarias', franja); } catch { /* ignorar duplicados */ }
    }
    qc.invalidateQueries({ queryKey: ['/franjas-horarias'] });
    setCargando(false);
  };

  const abrirEditar = (item: Record<string, unknown>) => {
    setEditando(item);
    setForm({
      diaSemana: String(item.diaSemana ?? 'LUN'),
      horaInicio: String(item.horaInicio ?? '').substring(0, 5),
      horaFin: String(item.horaFin ?? '').substring(0, 5),
      bloqueIdx: String(item.bloqueIdx ?? ''),
    });
    setError('');
    setModal(true);
  };

  const guardar = () => {
    if (!form.horaInicio || !form.horaFin || !form.bloqueIdx) { setError('Todos los campos son obligatorios.'); return; }
    const body = {
      diaSemana: form.diaSemana,
      horaInicio: form.horaInicio + ':00',
      horaFin: form.horaFin + ':00',
      bloqueIdx: Number(form.bloqueIdx),
    };
    if (editando) {
      mutActualizar.mutate({ id: editando.id as number, body });
    } else {
      mutCrear.mutate(body);
    }
  };

  const totalPaginas = data ? Math.ceil(data.total / 10) : 1;
  const DIAS: Record<string, string> = { LUN: 'Lunes', MAR: 'Martes', MIE: 'Miercoles', JUE: 'Jueves', VIE: 'Viernes', SAB: 'Sabado' };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Franjas horarias</h2>
        <div className="flex gap-2">
          <button onClick={cargarInstitucionales} disabled={cargando}
            className="text-xs px-3 py-1.5 border border-blue-300 text-blue-600 hover:bg-blue-50 rounded-lg disabled:opacity-50">
            {cargando ? 'Cargando...' : 'Cargar franjas institucionales'}
          </button>
          <button onClick={() => { setModal(true); setEditando(null); setForm({ diaSemana: 'LUN', horaInicio: '', horaFin: '', bloqueIdx: '' }); setError(''); }}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-3 py-1.5 rounded-lg">
            + Nuevo
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-6 text-center text-gray-400 text-sm">Cargando...</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Dia</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Hora inicio</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Hora fin</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Bloque</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {data?.items?.map((item: Record<string, unknown>) => (
                <tr key={item.id as number} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-700">{DIAS[String(item.diaSemana)] ?? String(item.diaSemana)}</td>
                  <td className="px-4 py-3 text-gray-700">{String(item.horaInicio ?? '').substring(0, 5)}</td>
                  <td className="px-4 py-3 text-gray-700">{String(item.horaFin ?? '').substring(0, 5)}</td>
                  <td className="px-4 py-3 text-gray-700">{String(item.bloqueIdx ?? '')}</td>
                  <td className="px-4 py-3 flex gap-3">
                    <button onClick={() => abrirEditar(item)} className="text-xs text-blue-600 hover:underline">Editar</button>
                    <button onClick={() => { if (confirm('Eliminar franja?')) mutEliminar.mutate(item.id as number); }}
                      className="text-xs text-red-500 hover:underline">Eliminar</button>
                  </td>
                </tr>
              ))}
              {(!data?.items || data.items.length === 0) && (
                <tr><td colSpan={5} className="px-4 py-6 text-center text-gray-400 text-xs">Sin franjas. Usa el boton para cargar las institucionales.</td></tr>
              )}
            </tbody>
          </table>
        )}
        {data && data.total > 10 && (
          <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
            <p className="text-xs text-gray-400">{data.total} registros</p>
            <div className="flex gap-2">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="text-xs px-3 py-1 border rounded disabled:opacity-40">Anterior</button>
              <span className="text-xs px-2 py-1 text-gray-500">{page}/{totalPaginas}</span>
              <button disabled={page === totalPaginas} onClick={() => setPage(p => p + 1)} className="text-xs px-3 py-1 border rounded disabled:opacity-40">Siguiente</button>
            </div>
          </div>
        )}
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-base font-bold text-gray-900 mb-4">{editando ? 'Editar franja' : 'Nueva franja'}</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Dia de la semana</label>
                <select value={form.diaSemana} onChange={e => setForm({...form, diaSemana: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {Object.entries(DIAS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Hora inicio</label>
                  <input type="time" value={form.horaInicio} onChange={e => setForm({...form, horaInicio: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Hora fin</label>
                  <input type="time" value={form.horaFin} onChange={e => setForm({...form, horaFin: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Numero de bloque</label>
                <input type="number" min="1" value={form.bloqueIdx} onChange={e => setForm({...form, bloqueIdx: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              {error && <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
            </div>
            <div className="flex gap-3 mt-5 justify-end">
              <button onClick={() => { setModal(false); setEditando(null); setError(''); }} className="text-sm px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Cancelar</button>
              <button onClick={guardar} className="text-sm px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                {editando ? 'Guardar cambios' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TablaGenerica({ ruta, columnas, campos, titulo, camposEditar }: {
  ruta: string;
  columnas: string[];
  campos: Campo[];
  titulo: string;
  camposEditar?: Campo[];
}) {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [error, setError] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: [ruta, page],
    queryFn: () => obtener(ruta, page),
  });

  const nivelesQuery = useQuery({
    queryKey: ['niveles-select'],
    queryFn: async () => {
      const { data } = await clienteApi.get('/niveles', { params: { page: 1, size: 100 } });
      return data.items;
    },
    enabled: campos.some(c => c.opcionesRuta === '/niveles') || (camposEditar ?? []).some(c => c.opcionesRuta === '/niveles'),
  });

  const cursosQuery = useQuery({
    queryKey: ['cursos-select'],
    queryFn: async () => {
      const { data } = await clienteApi.get('/cursos', { params: { page: 1, size: 100 } });
      return data.items;
    },
    enabled: campos.some(c => c.opcionesRuta === '/cursos') || (camposEditar ?? []).some(c => c.opcionesRuta === '/cursos'),
  });

  const resolverOpciones = (campo: Campo) => {
    if (campo.opciones) return campo.opciones;
    if (campo.opcionesRuta === '/niveles' && nivelesQuery.data) {
      return nivelesQuery.data.map((n: Record<string, unknown>) => ({
        value: String(n[campo.opcionesValue ?? 'id']),
        label: String(n[campo.opcionesLabel ?? 'nombre']),
      }));
    }
    if (campo.opcionesRuta === '/cursos' && cursosQuery.data) {
      return cursosQuery.data.map((c: Record<string, unknown>) => ({
        value: String(c[campo.opcionesValue ?? 'id']),
        label: String(c[campo.opcionesLabel ?? 'nombre']),
      }));
    }
    return [];
  };

  const mutCrear = useMutation({
    mutationFn: (body: object) => crear(ruta, body),
    onSuccess: () => { qc.invalidateQueries({ queryKey: [ruta] }); setModal(false); setForm({}); setError(''); },
    onError: (e: unknown) => {
      const msg = (e as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(', ') : (msg ?? 'Error al guardar.'));
    },
  });

  const mutActualizar = useMutation({
    mutationFn: ({ id, body }: { id: number; body: object }) => actualizar(ruta, id, body),
    onSuccess: () => { qc.invalidateQueries({ queryKey: [ruta] }); setModal(false); setEditando(null); setForm({}); setError(''); },
    onError: (e: unknown) => {
      const msg = (e as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(', ') : (msg ?? 'Error al actualizar.'));
    },
  });

  const mutEliminar = useMutation({
    mutationFn: (id: number) => eliminar(ruta, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [ruta] }),
  });

  const abrirEditar = (item: Record<string, unknown>) => {
    setEditando(item);
    const f: Record<string, string> = {};
    const camposForm = camposEditar ?? campos;
    camposForm.forEach(c => { f[c.key] = String(item[c.key] ?? ''); });
    setForm(f);
    setError('');
    setModal(true);
  };

  const guardar = () => {
    const camposForm = editando ? (camposEditar ?? campos) : campos;
    const vacio = camposForm.find(c => !form[c.key]);
    if (vacio) { setError('Todos los campos son obligatorios.'); return; }
    const body: Record<string, string | number> = {};
    camposForm.forEach(c => { body[c.key] = parsearValor(form[c.key], c.type); });
    if (editando) {
      mutActualizar.mutate({ id: editando.id as number, body });
    } else {
      mutCrear.mutate(body);
    }
  };

  const totalPaginas = data ? Math.ceil(data.total / 10) : 1;
  const camposForm = editando ? (camposEditar ?? campos) : campos;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">{titulo}</h2>
        <button onClick={() => { setModal(true); setEditando(null); setForm({}); setError(''); }}
          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-3 py-1.5 rounded-lg">
          + Nuevo
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-6 text-center text-gray-400 text-sm">Cargando...</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {columnas.map(c => (
                  <th key={c} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{c}</th>
                ))}
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {data?.items?.map((item: Record<string, unknown>) => (
                <tr key={item.id as number} className="hover:bg-gray-50">
                  {campos.map(c => (
                    <td key={c.key} className="px-4 py-3 text-gray-700">{String(item[c.key] ?? '')}</td>
                  ))}
                  <td className="px-4 py-3 flex gap-3">
                    <button onClick={() => abrirEditar(item)} className="text-xs text-blue-600 hover:underline">Editar</button>
                    <button onClick={() => { if (confirm('Eliminar?')) mutEliminar.mutate(item.id as number); }}
                      className="text-xs text-red-500 hover:underline">Eliminar</button>
                  </td>
                </tr>
              ))}
              {(!data?.items || data.items.length === 0) && (
                <tr><td colSpan={campos.length + 1} className="px-4 py-6 text-center text-gray-400 text-xs">Sin registros</td></tr>
              )}
            </tbody>
          </table>
        )}
        {data && data.total > 10 && (
          <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
            <p className="text-xs text-gray-400">{data.total} registros</p>
            <div className="flex gap-2">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="text-xs px-3 py-1 border rounded disabled:opacity-40">Anterior</button>
              <span className="text-xs px-2 py-1 text-gray-500">{page}/{totalPaginas}</span>
              <button disabled={page === totalPaginas} onClick={() => setPage(p => p + 1)} className="text-xs px-3 py-1 border rounded disabled:opacity-40">Siguiente</button>
            </div>
          </div>
        )}
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-base font-bold text-gray-900 mb-4">{editando ? 'Editar registro' : 'Nuevo registro'}</h3>
            <div className="space-y-3">
              {camposForm.map(c => {
                const opciones = resolverOpciones(c);
                return (
                  <div key={c.key}>
                    <label className="block text-xs font-medium text-gray-700 mb-1">{c.label}</label>
                    {opciones.length > 0 ? (
                      <select value={form[c.key] ?? ''} onChange={e => setForm({...form, [c.key]: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">Seleccionar...</option>
                        {opciones.map((o: any) => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    ) : (
                      <input type={c.type ?? 'text'} value={form[c.key] ?? ''} onChange={e => setForm({...form, [c.key]: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    )}
                  </div>
                );
              })}
              {error && <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
            </div>
            <div className="flex gap-3 mt-5 justify-end">
              <button onClick={() => { setModal(false); setEditando(null); setError(''); }} className="text-sm px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Cancelar</button>
              <button onClick={guardar} className="text-sm px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                {editando ? 'Guardar cambios' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Configuracion() {
  const [tabActivo, setTabActivo] = useState(0);

  const configuraciones = [
    {
      ruta: '/aulas',
      titulo: 'Aulas',
      columnas: ['Codigo', 'Capacidad', 'Tipo', 'Activa'],
      campos: [
        { key: 'codigo', label: 'Codigo' },
        { key: 'capacidad', label: 'Capacidad', type: 'number' },
        { key: 'tipo', label: 'Tipo', opciones: [{value:'SALON',label:'Salon'},{value:'LAB',label:'Laboratorio'},{value:'VIRTUAL',label:'Virtual'}] },
      ],
      camposEditar: [
        { key: 'codigo', label: 'Codigo' },
        { key: 'capacidad', label: 'Capacidad', type: 'number' },
        { key: 'tipo', label: 'Tipo', opciones: [{value:'SALON',label:'Salon'},{value:'LAB',label:'Laboratorio'},{value:'VIRTUAL',label:'Virtual'}] },
      ],
    },
    {
      ruta: '/niveles',
      titulo: 'Niveles de idioma',
      columnas: ['Codigo', 'Nombre'],
      campos: [
        { key: 'codigo', label: 'Codigo', opciones: [{value:'A1',label:'A1'},{value:'A2',label:'A2'},{value:'B1',label:'B1'},{value:'B2',label:'B2'},{value:'C1',label:'C1'}] },
        { key: 'nombre', label: 'Nombre' },
      ],
      camposEditar: [
        { key: 'nombre', label: 'Nombre' },
      ],
    },
    {
      ruta: '/cursos',
      titulo: 'Cursos',
      columnas: ['Nombre', 'Nivel', 'Intensidad horaria'],
      campos: [
        { key: 'nombre', label: 'Nombre' },
        { key: 'nivelId', label: 'Nivel', type: 'number', opcionesRuta: '/niveles', opcionesLabel: 'codigo', opcionesValue: 'id' },
        { key: 'intensidadHoraria', label: 'Horas semanales', type: 'number' },
      ],
      camposEditar: [
        { key: 'nombre', label: 'Nombre' },
        { key: 'nivelId', label: 'Nivel', type: 'number', opcionesRuta: '/niveles', opcionesLabel: 'codigo', opcionesValue: 'id' },
        { key: 'intensidadHoraria', label: 'Horas semanales', type: 'number' },
      ],
    },
    {
      ruta: '/grupos',
      titulo: 'Grupos',
      columnas: ['Codigo', 'Curso', 'Cupo max', 'Jornada'],
      campos: [
        { key: 'codigo', label: 'Codigo' },
        { key: 'cursoId', label: 'Curso', type: 'number', opcionesRuta: '/cursos', opcionesLabel: 'nombre', opcionesValue: 'id' },
        { key: 'cupoMax', label: 'Cupo maximo', type: 'number' },
        { key: 'jornada', label: 'Jornada', opciones: [{value:'MANANA',label:'Manana'},{value:'TARDE',label:'Tarde'},{value:'NOCHE',label:'Noche'}] },
      ],
      camposEditar: [
        { key: 'codigo', label: 'Codigo' },
        { key: 'cursoId', label: 'Curso', type: 'number', opcionesRuta: '/cursos', opcionesLabel: 'nombre', opcionesValue: 'id' },
        { key: 'cupoMax', label: 'Cupo maximo', type: 'number' },
        { key: 'jornada', label: 'Jornada', opciones: [{value:'MANANA',label:'Manana'},{value:'TARDE',label:'Tarde'},{value:'NOCHE',label:'Noche'}] },
      ],
    },
    null,
    {
      ruta: '/periodos',
      titulo: 'Periodos academicos',
      columnas: ['Nombre', 'Fecha inicio', 'Fecha fin'],
      campos: [
        { key: 'nombre', label: 'Nombre (ej: 2026-1)' },
        { key: 'fechaInicio', label: 'Fecha inicio', type: 'date' },
        { key: 'fechaFin', label: 'Fecha fin', type: 'date' },
      ],
      camposEditar: [
        { key: 'nombre', label: 'Nombre' },
        { key: 'fechaInicio', label: 'Fecha inicio', type: 'date' },
        { key: 'fechaFin', label: 'Fecha fin', type: 'date' },
      ],
    },
    {
      ruta: '/docentes',
      titulo: 'Docentes',
      columnas: ['Nombre', 'Email', 'Especialidad', 'Carga max horas'],
      campos: [
        { key: 'usuarioNombre', label: 'Nombre' },
        { key: 'usuarioEmail', label: 'Email' },
        { key: 'especialidad', label: 'Especialidad' },
        { key: 'cargaMaximaHoras', label: 'Carga max horas', type: 'number' },
      ],
      camposEditar: [
        { key: 'especialidad', label: 'Especialidad' },
        { key: 'cargaMaximaHoras', label: 'Carga maxima de horas', type: 'number' },
      ],
    },
  ];

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Configuracion</h1>
        <p className="text-gray-500 text-sm">Datos maestros del sistema</p>
      </div>

      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
        {tabs.map((tab, i) => (
          <button key={tab} onClick={() => setTabActivo(i)}
            className={i === tabActivo
              ? 'px-4 py-1.5 rounded-md text-sm font-medium bg-white text-blue-600 shadow-sm'
              : 'px-4 py-1.5 rounded-md text-sm text-gray-500 hover:text-gray-700'}>
            {tab}
          </button>
        ))}
      </div>

      {tabActivo === 4 ? (
        <TablaFranjas />
      ) : configuraciones[tabActivo] ? (
        <TablaGenerica
          key={configuraciones[tabActivo]!.ruta}
          ruta={configuraciones[tabActivo]!.ruta}
          titulo={configuraciones[tabActivo]!.titulo}
          columnas={configuraciones[tabActivo]!.columnas}
          campos={configuraciones[tabActivo]!.campos}
          camposEditar={configuraciones[tabActivo]!.camposEditar}
        />
      ) : null}
    </div>
  );
}
