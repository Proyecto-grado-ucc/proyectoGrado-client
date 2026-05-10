import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { clienteApi } from '../../../compartido/api';
import { SkeletonTable } from '../../../compartido/Skeleton';

interface AuditLog {
  id: number;
  usuarioId: number | null;
  accion: string;
  entidad: string;
  entidadId: string | null;
  timestamp: string;
  datosPrevios: object | null;
  datosNuevos: object | null;
}

interface PaginadoAuditLog {
  items: AuditLog[];
  total: number;
  page: number;
  size: number;
}

async function obtenerAuditLog(page: number): Promise<PaginadoAuditLog> {
  const { data } = await clienteApi.get('/audit-log', { params: { page, size: 15 } });
  return data;
}

const colorAccion: Record<string, string> = {
  POST: 'bg-green-100 text-green-700',
  PATCH: 'bg-blue-100 text-blue-700',
  DELETE: 'bg-red-100 text-red-700',
  GET: 'bg-gray-100 text-gray-600',
};

export default function Auditoria() {
  const [page, setPage] = useState(1);
  const [detalle, setDetalle] = useState<AuditLog | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['audit-log', page],
    queryFn: () => obtenerAuditLog(page),
    refetchInterval: 30_000,
  });

  const totalPaginas = data ? Math.ceil(data.total / 15) : 1;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Auditoria</h1>
          <p className="text-gray-500 text-sm">Registro de acciones criticas del sistema. Se actualiza cada 30 segundos.</p>
        </div>
        {data && <span className="text-xs text-gray-400">{data.total} registros totales</span>}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <SkeletonTable rows={10} cols={6} />
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Fecha y hora</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Accion</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Entidad</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">ID</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Usuario</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Detalle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {data?.items.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3 text-gray-500 text-xs">
                    {new Date(log.timestamp).toLocaleString('es-CO')}
                  </td>
                  <td className="px-5 py-3">
                    <span className={
                      'px-2 py-1 rounded-full text-xs font-medium ' +
                      (colorAccion[log.accion] ?? 'bg-gray-100 text-gray-600')
                    }>
                      {log.accion}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-700 font-medium">{log.entidad}</td>
                  <td className="px-5 py-3 text-gray-400 text-xs">{log.entidadId ?? '-'}</td>
                  <td className="px-5 py-3 text-gray-500 text-xs">{log.usuarioId ?? 'Sistema'}</td>
                  <td className="px-5 py-3">
                    {(log.datosPrevios || log.datosNuevos) && (
                      <button onClick={() => setDetalle(log)}
                        className="text-xs text-blue-600 hover:underline">
                        Ver cambios
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {(!data?.items || data.items.length === 0) && (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-gray-400 text-sm">
                    Sin registros de auditoria
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        {data && data.total > 15 && (
          <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
            <p className="text-xs text-gray-400">Pagina {page} de {totalPaginas}</p>
            <div className="flex gap-2">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                className="text-xs px-3 py-1 border rounded disabled:opacity-40 hover:bg-gray-50">Anterior</button>
              <button disabled={page === totalPaginas} onClick={() => setPage(p => p + 1)}
                className="text-xs px-3 py-1 border rounded disabled:opacity-40 hover:bg-gray-50">Siguiente</button>
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {detalle && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setDetalle(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Detalle del cambio</h2>
                <button onClick={() => setDetalle(null)} className="text-gray-400 hover:text-gray-600 transition-colors">✕</button>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Entidad</p>
                  <p className="text-base text-gray-800 font-semibold">{detalle.entidad} <span className="text-gray-400 font-normal">#{detalle.entidadId}</span></p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Fecha</p>
                  <p className="text-base text-gray-800">{new Date(detalle.timestamp).toLocaleString('es-CO')}</p>
                </div>
                {detalle.datosPrevios && (
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-2">Datos anteriores</p>
                    <pre className="bg-red-50 text-red-800 text-sm p-4 rounded-xl overflow-auto max-h-48 border border-red-100">
                      {JSON.stringify(detalle.datosPrevios, null, 2)}
                    </pre>
                  </div>
                )}
                {detalle.datosNuevos && (
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-2">Datos nuevos</p>
                    <pre className="bg-green-50 text-green-800 text-sm p-4 rounded-xl overflow-auto max-h-48 border border-green-100">
                      {JSON.stringify(detalle.datosNuevos, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
              <div className="mt-8 flex justify-end">
                <button onClick={() => setDetalle(null)}
                  className="text-sm px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors">
                  Cerrar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
