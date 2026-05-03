import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { clienteApi } from '../../../compartido/api';
import { useAuthStore } from '../../../seguridad/store';

interface Estudiante { id: number; usuarioEmail: string; grupoId: number; }
interface Asignacion { grupoId: number; docenteId: number; }
interface Horario { id: number; periodoNombre: string; asignaciones: Asignacion[]; }
interface Pregunta { id: number; texto: string; tipo: 'likert' | 'texto'; }
interface Dimension { id: number; nombre: string; preguntas: Pregunta[]; }
interface Formulario { id: number; titulo: string; descripcion: string; dimensiones: Dimension[]; }
interface Evaluacion { id: number; formularioId: number; formularioTitulo: string; docenteEvaluadoId: number; docenteEvaluadoNombre: string; estado: string; }

const fetchAll = async <T extends object>(ruta: string): Promise<T[]> => {
  const { data } = await clienteApi.get(ruta, { params: { page: 1, size: 200 } });
  return (data.items ?? data) as T[];
};

export default function FormulariosEstudiante() {
  const qc = useQueryClient();
  const email = useAuthStore(s => s.usuario?.email ?? '');
  
  const [evaluacionActiva, setEvaluacionActiva] = useState<Evaluacion | null>(null);
  const [respuestas, setRespuestas] = useState<Record<number, string | number>>({});
  const [enviando, setEnviando] = useState(false);

  const { data: estudiantes } = useQuery({ queryKey: ['estudiantes-fe'], queryFn: () => fetchAll<Estudiante>('/estudiantes') });
  const miEstudiante = estudiantes?.find(e => e.usuarioEmail === email);
  const miGrupoId = miEstudiante?.grupoId;

  const { data: horarios } = useQuery({ queryKey: ['horarios-fe'], queryFn: () => fetchAll<Horario>('/horarios') });
  const horarioActivoResumen = horarios?.[0];

  const { data: horarioDetalle } = useQuery({
    queryKey: ['horario-detalle-fe', horarioActivoResumen?.id],
    queryFn: async () => {
      const { data } = await clienteApi.get(`/horarios/${horarioActivoResumen!.id}`);
      return data as Horario;
    },
    enabled: !!horarioActivoResumen
  });

  const { data: evaluacionesTodas = [], isLoading: cargandoEvals } = useQuery({
    queryKey: ['evaluaciones-fe'],
    queryFn: () => fetchAll<Evaluacion>('/evaluaciones')
  });

  const misAsignaciones = horarioDetalle?.asignaciones?.filter(a => a.grupoId === miGrupoId) ?? [];
  const docentesDeMiGrupo = new Set(misAsignaciones.map(a => a.docenteId));

  const evaluaciones = evaluacionesTodas.filter(e => docentesDeMiGrupo.has(e.docenteEvaluadoId) && (e.estado === 'PENDIENTE' || e.estado === 'COMPLETADA' || e.estado === 'ACTIVA'));
  const pendientes = evaluaciones.filter(e => e.estado === 'PENDIENTE' || e.estado === 'ACTIVA');

  const { data: formularioActivo, isLoading: cargandoForm } = useQuery({
    queryKey: ['formulario-fe', evaluacionActiva?.formularioId],
    queryFn: async () => {
      if (!evaluacionActiva) return null;
      const { data } = await clienteApi.get(`/formularios/${evaluacionActiva.formularioId}`);
      return data as Formulario;
    },
    enabled: !!evaluacionActiva
  });

  const responder = (preguntaId: number, valor: string | number) => {
    setRespuestas(prev => ({ ...prev, [preguntaId]: valor }));
  };

  const enviarEvaluacion = async () => {
    if (!evaluacionActiva || !formularioActivo) return;
    setEnviando(true);
    try {
      const promesas = Object.entries(respuestas).map(([pId, val]) => {
        const esNum = typeof val === 'number';
        return clienteApi.post('/respuestas', {
          evaluacionId: evaluacionActiva.id,
          preguntaId: Number(pId),
          valorNumerico: esNum ? val : null,
          valorTexto: esNum ? null : val
        });
      });
      await Promise.all(promesas);
      await clienteApi.patch(`/evaluaciones/${evaluacionActiva.id}`, { estado: 'COMPLETADA' });
      qc.invalidateQueries({ queryKey: ['evaluaciones-fe'] });
      setEvaluacionActiva(null);
      setRespuestas({});
      alert('Evaluación enviada con éxito. ¡Gracias!');
    } catch (error) {
      alert('Hubo un error enviando la evaluación. Intenta de nuevo.');
      console.error(error);
    } finally {
      setEnviando(false);
    }
  };

  const esCompleta = formularioActivo?.dimensiones.every(dim => 
    dim.preguntas.filter(p => p.tipo === 'likert').every(p => respuestas[p.id] !== undefined)
  ) ?? false;

  if (cargandoEvals) {
    return <div className="p-8 text-center text-gray-500">Cargando evaluaciones...</div>;
  }

  if (!evaluacionActiva) {
    return (
      <div className="p-8 min-h-full bg-gray-50">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Evaluación Docente</h1>
          <p className="text-gray-500 text-sm mt-0.5">Selecciona un docente para evaluar</p>
        </div>

        {pendientes.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600 text-2xl">✓</div>
            <h2 className="text-lg font-bold text-gray-900 mb-1">¡Todo al día!</h2>
            <p className="text-sm text-gray-500">No tienes evaluaciones pendientes en este momento.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendientes.map(e => (
              <div key={e.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col justify-between">
                <div>
                  <span className="inline-block px-2 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded-lg mb-3">Pendiente</span>
                  <h3 className="font-bold text-gray-900 text-lg mb-1">{e.formularioTitulo}</h3>
                  <p className="text-sm text-gray-600">Docente: <span className="font-medium text-gray-900">{e.docenteEvaluadoNombre}</span></p>
                </div>
                <button 
                  onClick={() => { setEvaluacionActiva(e); setRespuestas({}); }}
                  className="mt-6 w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors"
                >
                  Iniciar evaluación
                </button>
              </div>
            ))}
          </div>
        )}

        {evaluaciones.filter(e => e.estado === 'COMPLETADA').length > 0 && (
          <div className="mt-12">
            <h2 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Historial de Completadas</h2>
            <div className="space-y-3">
              {evaluaciones.filter(e => e.estado === 'COMPLETADA').map(e => (
                <div key={e.id} className="bg-white rounded-xl p-4 border border-gray-100 flex items-center justify-between opacity-75">
                  <div>
                    <p className="font-medium text-gray-800">{e.formularioTitulo}</p>
                    <p className="text-xs text-gray-500">Docente: {e.docenteEvaluadoNombre}</p>
                  </div>
                  <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full border border-green-200">
                    Completada
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-8 min-h-full bg-gray-50">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <button onClick={() => setEvaluacionActiva(null)} className="text-sm text-blue-600 hover:underline mb-2 inline-block">← Volver</button>
          <h1 className="text-2xl font-bold text-gray-900">Evaluando a: {evaluacionActiva.docenteEvaluadoNombre}</h1>
          <p className="text-gray-500 text-sm mt-0.5">{evaluacionActiva.formularioTitulo}</p>
        </div>
      </div>

      {cargandoForm ? (
        <div className="text-center py-10 text-gray-500">Cargando formulario...</div>
      ) : !formularioActivo ? (
        <div className="text-center py-10 text-red-500">Error cargando el formulario.</div>
      ) : (
        <div className="space-y-8">
          {formularioActivo.dimensiones.map(dim => (
            <div key={dim.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
                <h2 className="font-bold text-gray-800">{dim.nombre}</h2>
              </div>
              <div className="p-6 space-y-6">
                {dim.preguntas.map(p => (
                  <div key={p.id}>
                    <p className="text-sm font-medium text-gray-800 mb-3">{p.texto}</p>
                    {p.tipo === 'likert' ? (
                      <div className="flex flex-wrap gap-2 md:gap-4 items-center">
                        <span className="text-xs text-gray-400 w-full md:w-auto">Totalmente en desacuerdo</span>
                        {[1, 2, 3, 4, 5].map(v => (
                          <button 
                            key={v} 
                            onClick={() => responder(p.id, v)}
                            className={`w-10 h-10 rounded-full border-2 text-sm font-bold transition-all ${
                              respuestas[p.id] === v 
                                ? 'bg-blue-600 border-blue-600 text-white transform scale-110' 
                                : 'bg-white border-gray-200 text-gray-500 hover:border-blue-300'
                            }`}
                          >
                            {v}
                          </button>
                        ))}
                        <span className="text-xs text-gray-400 w-full md:w-auto text-right md:text-left">Totalmente de acuerdo</span>
                      </div>
                    ) : (
                      <textarea
                        value={(respuestas[p.id] as string) || ''}
                        onChange={e => responder(p.id, e.target.value)}
                        placeholder="Escribe tus observaciones aquí..."
                        rows={3}
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="flex justify-end pt-4">
            <button 
              onClick={enviarEvaluacion} 
              disabled={!esCompleta || enviando}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-medium px-8 py-3 rounded-xl transition-all shadow-sm flex items-center gap-2"
            >
              {enviando ? 'Enviando...' : 'Enviar Evaluación'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
