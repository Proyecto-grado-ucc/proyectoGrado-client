import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { clienteApi } from '../../../compartido/api';
import { useUIStore } from '../../../compartido/storeUI';

interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol: string;
  activo: boolean;
  fechaCreacion: string;
}

interface PaginadoUsuario {
  items: Usuario[];
  total: number;
  page: number;
  size: number;
}

async function obtenerUsuarios(page: number): Promise<PaginadoUsuario> {
  const { data } = await clienteApi.get('/usuarios', { params: { page, size: 10 } });
  return data;
}

async function crearUsuario(body: object) {
  const { data } = await clienteApi.post('/usuarios', body);
  return data;
}

async function registrarDocente(usuarioId: number) {
  await clienteApi.post('/docentes', { usuarioId, especialidad: 'Ingles', cargaMaximaHoras: 40 });
}

async function registrarEstudiante(usuarioId: number) {
  await clienteApi.post('/estudiantes', { usuarioId });
}

async function actualizarUsuario(id: number, body: object) {
  const { data } = await clienteApi.patch('/usuarios/' + id, body);
  return data;
}

async function eliminarUsuario(id: number) {
  await clienteApi.delete('/usuarios/' + id);
}

const ROLES = ['Admin', 'Docente', 'Estudiante'];

function invalidarConsultasDeUsuarios(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: ['usuarios'] });
  qc.invalidateQueries({ queryKey: ['conteo-docentes'] });
  qc.invalidateQueries({
    predicate: query => query.queryKey.some(part => (
      typeof part === 'string'
        && ['docentes', 'dashboard-resumen', 'formularios', 'kdd', 'horarios', 'evaluaciones']
          .some(token => part.toLowerCase().includes(token.toLowerCase()))
    )),
  });
}

export default function Usuarios() {
  const qc = useQueryClient();
  const { abrirConfirmacion } = useUIStore();
  const [page, setPage] = useState(1);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [editando, setEditando] = useState<Usuario | null>(null);
  const [form, setForm] = useState({ nombre: '', email: '', contrasena: '', rol: 'Docente', activo: true });
  const [error, setError] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['usuarios', page],
    queryFn: () => obtenerUsuarios(page),
  });

  const mutCrear = useMutation({
    mutationFn: crearUsuario,
    onSuccess: async (usuario) => {
      if (usuario.rol === 'Docente') await registrarDocente(usuario.id);
      if (usuario.rol === 'Estudiante') await registrarEstudiante(usuario.id);
      invalidarConsultasDeUsuarios(qc);
      cerrarModal();
    },
    onError: (e: unknown) => {
      const msg = (e as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(', ') : (msg ?? 'Error al guardar.'));
    },
  });

  const mutActualizar = useMutation({
    mutationFn: ({ id, body }: { id: number; body: object }) => actualizarUsuario(id, body),
    onSuccess: () => { invalidarConsultasDeUsuarios(qc); cerrarModal(); },
    onError: () => setError('Error al actualizar.'),
  });

  const mutEliminar = useMutation({
    mutationFn: eliminarUsuario,
    onSuccess: () => {
      invalidarConsultasDeUsuarios(qc);
    },
  });

  const abrirCrear = () => {
    setEditando(null);
    setForm({ nombre: '', email: '', contrasena: '', rol: 'Docente', activo: true });
    setError('');
    setModalAbierto(true);
  };

  const abrirEditar = (u: Usuario) => {
    setEditando(u);
    setForm({ nombre: u.nombre, email: u.email, contrasena: '', rol: u.rol, activo: u.activo });
    setError('');
    setModalAbierto(true);
  };

  const cerrarModal = () => { setModalAbierto(false); setEditando(null); setError(''); };

  const guardar = () => {
    if (!form.nombre || !form.email) { setError('Nombre y correo son obligatorios.'); return; }
    if (editando) {
      const body: Record<string, unknown> = { nombre: form.nombre, email: form.email, rol: form.rol, activo: form.activo };
      if (form.contrasena) body.contrasena = form.contrasena;
      mutActualizar.mutate({ id: editando.id, body });
    } else {
      if (!form.contrasena) { setError('La contrasena es obligatoria.'); return; }
      mutCrear.mutate({ nombre: form.nombre, email: form.email, contrasena: form.contrasena, rol: form.rol, activo: true });
    }
  };

  const totalPaginas = data ? Math.ceil(data.total / 10) : 1;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Usuarios</h1>
          <p className="text-gray-500 text-sm">Gestion de cuentas del sistema</p>
        </div>
        <button onClick={abrirCrear} className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          + Nuevo usuario
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-400 text-sm">Cargando...</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Nombre</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Correo</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Rol</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Estado</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {data?.items.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3 font-medium text-gray-900">{u.nombre}</td>
                  <td className="px-5 py-3 text-gray-500">{u.email}</td>
                  <td className="px-5 py-3">
                    <span className={
                      u.rol === 'Admin' ? 'px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700' :
                      u.rol === 'Docente' ? 'px-2 py-1 rounded-full text-xs bg-green-100 text-green-700' :
                      'px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-700'
                    }>{u.rol}</span>
                  </td>
                  <td className="px-5 py-3">
                    <span className={u.activo ? 'px-2 py-1 rounded-full text-xs bg-green-100 text-green-700' : 'px-2 py-1 rounded-full text-xs bg-red-100 text-red-700'}>
                      {u.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-5 py-3 flex gap-2">
                    <button onClick={() => abrirEditar(u)} className="text-xs text-blue-600 hover:underline">Editar</button>
                    <button 
                      onClick={() => {
                        abrirConfirmacion({
                          titulo: 'Eliminar usuario',
                          mensaje: `¿Estás seguro de que deseas eliminar a ${u.nombre}? Esta acción no se puede deshacer.`,
                          textoConfirmar: 'Sí, eliminar',
                          textoCancelar: 'Cancelar',
                          tipo: 'peligro',
                          onConfirmar: () => mutEliminar.mutate(u.id)
                        });
                      }} 
                      className="text-xs text-red-500 hover:underline"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {data && data.total > 10 && (
          <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
            <p className="text-xs text-gray-400">{data.total} usuarios en total</p>
            <div className="flex gap-2">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="text-xs px-3 py-1 border rounded disabled:opacity-40">Anterior</button>
              <span className="text-xs px-3 py-1 text-gray-500">{page} / {totalPaginas}</span>
              <button disabled={page === totalPaginas} onClick={() => setPage(p => p + 1)} className="text-xs px-3 py-1 border rounded disabled:opacity-40">Siguiente</button>
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {modalAbierto && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={cerrarModal}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-6">{editando ? 'Editar usuario' : 'Nuevo usuario'}</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo</label>
                  <input value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50/50 hover:bg-gray-50 transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Correo electrónico</label>
                  <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50/50 hover:bg-gray-50 transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{editando ? 'Nueva contraseña (dejar vacío para no cambiar)' : 'Contraseña'}</label>
                  <input type="password" value={form.contrasena} onChange={e => setForm({...form, contrasena: e.target.value})}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50/50 hover:bg-gray-50 transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
                  <select value={form.rol} onChange={e => setForm({...form, rol: e.target.value})}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50/50 hover:bg-gray-50 transition-colors">
                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                {editando && (
                  <div className="flex items-center gap-2 pt-2">
                    <input type="checkbox" id="activo" checked={form.activo} onChange={e => setForm({...form, activo: e.target.checked})} className="rounded text-blue-600 focus:ring-blue-500" />
                    <label htmlFor="activo" className="text-sm font-medium text-gray-700">Usuario activo</label>
                  </div>
                )}
                {error && <p className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-xl">{error}</p>}
              </div>
              <div className="flex gap-3 mt-8 justify-end">
                <button onClick={cerrarModal} className="text-sm px-5 py-2.5 font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">Cancelar</button>
                <button onClick={guardar} className="text-sm px-5 py-2.5 font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-sm shadow-blue-200 transition-colors">
                  {editando ? 'Guardar cambios' : 'Crear usuario'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
