import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clienteApi } from '../../../compartido/api';

interface Evaluacion { id: number; docenteEvaluadoNombre: string; formularioTitulo: string; formularioId: number; estado: string; }
interface Pregunta { id: number; texto: string; tipo: string; dimensionId: number; }
interface RespuestaLocal { preguntaId: number; valorNumerico: number | null; valorTexto: string | null; }

const fetchAll = async <T extends object>(ruta: string): Promise<T[]> => {
  const { data } = await clienteApi.get(ruta, { params: { page: 1, size: 100 } });
  return (data.items ?? data) as T[];
};

// ── Formulario de respuestas ───────────────────────────────────────────────────
function FormularioRespuestas({ evaluacion, onVolver }: { evaluacion: Evaluacion; onVolver: () => void }) {
  const qc = useQueryClient();
  const [respuestas, setRespuestas] = useState<Record<number, RespuestaLocal>>({});
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState('');

  const { data: preguntas, isLoading } = useQuery({
    queryKey: ['preguntas-form', evaluacion.formularioId],
    queryFn: () => fetchAll<Pregunta>(`/preguntas?formularioId=${evaluacion.formularioId}`),
  });

  const responder = (preguntaId: number, tipo: string, valor: string | number) => {
    setRespuestas(prev => ({
      ...prev,
      [preguntaId]: tipo === 'TEXTO'
        ? { preguntaId, valorNumerico: null, valorTexto: String(valor) }
        : { preguntaId, valorNumerico: Number(valor), valorTexto: null },
    }));
  };

  const likerts = preguntas?.filter(p => p.tipo === 'LIKERT') ?? [];
  const completado = likerts.length > 0 && likerts.every(p => respuestas[p.id] !== undefined);

  const mutEnviar = useMutation({
    mutationFn: async () => {
      for (const r of Object.values(respuestas)) {
        await clienteApi.post('/respuestas', { evaluacionId: evaluacion.id, ...r });
      }
      await clienteApi.patch(`/evaluaciones/${evaluacion.id}`, { estado: 'COMPLETADA' });
    },
    onSuccess: () => { setEnviado(true); qc.invalidateQueries({ queryKey: ['evaluaciones-formularios'] }); },
    onError: (e: unknown) => {
      const m = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(m ?? 'Error al enviar. Intenta de nuevo.');
    },
  });

  if (enviado) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-96">
        <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center max-w-md">
          <p className="text-5xl mb-4">v</p>
          <h2 className="text-lg font-bold text-gray-900 mb-2">Evaluacion enviada</h2>
          <p className="text-sm text-gray-500 mb-5">Gracias por tu participacion. Tus respuestas son anonimas.</p>
          <button onClick={onVolver} className="px-5 py-2 text-sm bg-blue-600 text-white rounded-xl hover:bg-blue-700">Volver a evaluaciones</button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 min-h-full bg-gray-50">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onVolver} className="text-sm text-gray-500 hover:text-gray-700">Atras</button>
        <span className="text-gray-300">/</span>
        <div>
          <h1 className="text-xl font-bold text-gray-900">{evaluacion.formularioTitulo}</h1>
          <p className="text-gray-500 text-xs">Docente: {evaluacion.docenteEvaluadoNombre}</p>
        </div>
      </div>
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 text-xs text-yellow-700 mb-5">
        Tus respuestas son completamente anonimas. El docente no puede ver quien respondio.
      </div>
      {isLoading ? (
        <div className="text-center text-gray-400 py-8">Cargando preguntas...</div>
      ) : (
        <div className="space-y-4">
          {preguntas?.map((p, i) => (
            <div key={p.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <p className="text-sm font-medium text-gray-800 mb-3">{i + 1}. {p.texto}</p>
              {p.tipo === 'LIKERT' ? (
                <div className="flex gap-3 items-center flex-wrap">
                  <span className="text-xs text-gray-400">Muy en desacuerdo</span>
                  {[1, 2, 3, 4, 5].map(v => (
                    <button key={v} onClick={() => responder(p.id, p.tipo, v)}
                      className={`w-9 h-9 rounded-full border-2 text-sm font-medium transition-colors ${respuestas[p.id]?.valorNumerico === v ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-200 text-gray-500 hover:border-blue-400'}`}>
                      {v}
                    </button>
                  ))}
                  <span className="text-xs text-gray-400">Muy de acuerdo</span>
                </div>
              ) : (
                <textarea
                  value={respuestas[p.id]?.valorTexto ?? ''}
                  onChange={e => responder(p.id, p.tipo, e.target.value)}
                  placeholder="Escribe tu comentario (opcional)..."
                  rows={3}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
              )}
            </div>
          ))}
        </div>
      )}
      {error && <p className="mt-4 text-xs text-red-600 bg-red-50 px-4 py-2 rounded-xl">{error}</p>}
      <div className="mt-6 flex items-center justify-between">
        <p className="text-xs text-gray-400">{Object.values(respuestas).filter(r => r.valorNumerico !== null).length} de {likerts.length} preguntas respondidas</p>
        <button onClick={() => mutEnviar.mutate()} disabled={!completado || mutEnviar.isPending}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white text-sm font-medium px-6 py-2.5 rounded-xl transition-colors">
          {mutEnviar.isPending ? 'Enviando...' : 'Enviar evaluacion'}
        </button>
      </div>
    </div>
  );
}

// ── Lista de evaluaciones pendientes ──────────────────────────────────────────
export default function FormulariosEstudiante() {
  const [evaluacionActiva, setEvaluacionActiva] = useState<Evaluacion | null>(null);
  const { data: evaluaciones, isLoading } = useQuery({
    queryKey: ['evaluaciones-formularios'],
    queryFn: async () => {
      try {
        const { data } = await clienteApi.get('/evaluaciones/estudiante/mis-evaluaciones');
        return (data as Evaluacion[]);
      } catch {
        return [] as Evaluacion[];
      }
    },
  });

  const pendientes = evaluaciones?.filter(e => e.estado !== 'COMPLETADA') ?? [];
  const completadas = evaluaciones?.filter(e => e.estado === 'COMPLETADA') ?? [];

  if (evaluacionActiva) {
    return <FormularioRespuestas evaluacion={evaluacionActiva} onVolver={() => setEvaluacionActiva(null)} />;
  }

  return (
    <div className="p-8 min-h-full bg-gray-50">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Mis evaluaciones</h1>
        <p className="text-gray-500 text-sm mt-0.5">Evaluaciones de docentes asignadas a tu perfil</p>
      </div>

      {isLoading ? (
        <div className="text-center text-gray-400 py-12">Cargando...</div>
      ) : (
        <>
          {pendientes.length > 0 && (
            <div className="mb-6">
              <h2 className="text-sm font-semibold text-gray-700 mb-3">Pendientes ({pendientes.length})</h2>
              <div className="space-y-3">
                {pendientes.map(e => (
                  <div key={e.id} className="bg-white rounded-2xl border border-orange-200 p-5 flex items-center justify-between shadow-sm">
                    <div>
                      <p className="font-medium text-gray-900">{e.formularioTitulo}</p>
                      <p className="text-sm text-gray-500 mt-0.5">Docente: {e.docenteEvaluadoNombre}</p>
                    </div>
                    <button onClick={() => setEvaluacionActiva(e)}
                      className="px-4 py-2 text-sm bg-blue-600 text-white rounded-xl hover:bg-blue-700 flex-shrink-0">
                      Evaluar
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {completadas.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-gray-700 mb-3">Completadas ({completadas.length})</h2>
              <div className="space-y-3">
                {completadas.map(e => (
                  <div key={e.id} className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center justify-between shadow-sm opacity-70">
                    <div>
                      <p className="font-medium text-gray-700">{e.formularioTitulo}</p>
                      <p className="text-sm text-gray-400 mt-0.5">Docente: {e.docenteEvaluadoNombre}</p>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">Completada</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!pendientes.length && !completadas.length && (
            <div className="text-center py-16 text-gray-400">
              <p className="text-base font-medium text-gray-600 mb-1">Sin evaluaciones asignadas</p>
              <p className="text-sm">Cuando el administrador asigne evaluaciones apareceran aqui.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
