import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clienteApi } from '../../../compartido/api';

const tabs = ['Aulas', 'Niveles', 'Cursos', 'Grupos', 'Franjas', 'Periodos'];

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

function TablaGenerica({ ruta, columnas, campos, titulo }: {
  ruta: string;
  columnas: string[];
  campos: { key: string; label: string; type?: string; opciones?: {value: string; label: string}[] }[];
  titulo: string;
}) {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});
  const [error, setError] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: [ruta, page],
    queryFn: () => obtener(ruta, page),
  });

  const mutCrear = useMutation({
    mutationFn: (body: object) => crear(ruta, body),
    onSuccess: () => { qc.invalidateQueries({ queryKey: [ruta] }); setModal(false); setForm({}); },
    onError: () => setError('Error al guardar.'),
  });

  const mutEliminar = useMutation({
    mutationFn: (id: number) => eliminar(ruta, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [ruta] }),
  });

  const guardar = () => {
    const vacio = campos.find(c => !form[c.key] && c.type !== 'checkbox');
    if (vacio) { setError('Todos los campos son obligatorios.'); return; }
    mutCrear.mutate(form);
  };

  const totalPaginas = data ? Math.ceil(data.total / 10) : 1;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">{titulo}</h2>
        <button onClick={() => { setModal(true); setForm({}); setError(''); }}
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
                  <td className="px-4 py-3">
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
            <h3 className="text-base font-bold text-gray-900 mb-4">Nuevo registro</h3>
            <div className="space-y-3">
              {campos.map(c => (
                <div key={c.key}>
                  <label className="block text-xs font-medium text-gray-700 mb-1">{c.label}</label>
                  {c.opciones ? (
                    <select value={form[c.key] ?? ''} onChange={e => setForm({...form, [c.key]: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="">Seleccionar...</option>
                      {c.opciones.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  ) : (
                    <input type={c.type ?? 'text'} value={form[c.key] ?? ''} onChange={e => setForm({...form, [c.key]: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  )}
                </div>
              ))}
              {error && <p className="text-xs text-red-600">{error}</p>}
            </div>
            <div className="flex gap-3 mt-5 justify-end">
              <button onClick={() => setModal(false)} className="text-sm px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Cancelar</button>
              <button onClick={guardar} className="text-sm px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Guardar</button>
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
    },
    {
      ruta: '/niveles',
      titulo: 'Niveles de idioma',
      columnas: ['Codigo', 'Nombre'],
      campos: [
        { key: 'codigo', label: 'Codigo', opciones: [{value:'A1',label:'A1'},{value:'A2',label:'A2'},{value:'B1',label:'B1'},{value:'B2',label:'B2'},{value:'C1',label:'C1'}] },
        { key: 'nombre', label: 'Nombre' },
      ],
    },
    {
      ruta: '/cursos',
      titulo: 'Cursos',
      columnas: ['Nombre', 'Nivel', 'Intensidad horaria'],
      campos: [
        { key: 'nombre', label: 'Nombre' },
        { key: 'nivelId', label: 'ID del nivel', type: 'number' },
        { key: 'intensidadHoraria', label: 'Horas semanales', type: 'number' },
      ],
    },
    {
      ruta: '/grupos',
      titulo: 'Grupos',
      columnas: ['Codigo', 'Curso', 'Cupo max', 'Jornada'],
      campos: [
        { key: 'codigo', label: 'Codigo' },
        { key: 'cursoId', label: 'ID del curso', type: 'number' },
        { key: 'cupoMax', label: 'Cupo maximo', type: 'number' },
        { key: 'jornada', label: 'Jornada', opciones: [{value:'MANANA',label:'Manana'},{value:'TARDE',label:'Tarde'},{value:'NOCHE',label:'Noche'}] },
      ],
    },
    {
      ruta: '/franjas-horarias',
      titulo: 'Franjas horarias',
      columnas: ['Dia', 'Hora inicio', 'Hora fin', 'Bloque'],
      campos: [
        { key: 'diaSemana', label: 'Dia', opciones: [{value:'LUN',label:'Lunes'},{value:'MAR',label:'Martes'},{value:'MIE',label:'Miercoles'},{value:'JUE',label:'Jueves'},{value:'VIE',label:'Viernes'},{value:'SAB',label:'Sabado'}] },
        { key: 'horaInicio', label: 'Hora inicio (HH:MM)' },
        { key: 'horaFin', label: 'Hora fin (HH:MM)' },
        { key: 'bloqueIdx', label: 'Numero de bloque', type: 'number' },
      ],
    },
    {
      ruta: '/periodos',
      titulo: 'Periodos academicos',
      columnas: ['Nombre', 'Fecha inicio', 'Fecha fin'],
      campos: [
        { key: 'nombre', label: 'Nombre (ej: 2026-1)' },
        { key: 'fechaInicio', label: 'Fecha inicio', type: 'date' },
        { key: 'fechaFin', label: 'Fecha fin', type: 'date' },
      ],
    },
  ];

  const cfg = configuraciones[tabActivo];

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

      <TablaGenerica
        key={cfg.ruta}
        ruta={cfg.ruta}
        titulo={cfg.titulo}
        columnas={cfg.columnas}
        campos={cfg.campos}
      />
    </div>
  );
}
