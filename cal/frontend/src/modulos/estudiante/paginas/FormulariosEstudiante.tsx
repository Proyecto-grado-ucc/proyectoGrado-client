import { useState } from 'react';

interface Pregunta {
  id: number;
  texto: string;
  tipo: 'likert' | 'texto';
  respuesta?: number | string;
}

export default function FormulariosEstudiante() {
  const [enviado, setEnviado] = useState(false);
  const [preguntas, setPreguntas] = useState<Pregunta[]>([
    { id: 1, texto: 'El docente usa estrategias variadas de ensenanza', tipo: 'likert' },
    { id: 2, texto: 'Las actividades son pertinentes al nivel del curso', tipo: 'likert' },
    { id: 3, texto: 'El docente cumple con los horarios establecidos', tipo: 'likert' },
    { id: 4, texto: 'El docente demuestra fluidez y dominio del idioma', tipo: 'likert' },
    { id: 5, texto: 'El docente resuelve dudas de forma efectiva', tipo: 'likert' },
    { id: 6, texto: 'Comentarios adicionales (opcional)', tipo: 'texto' },
  ]);

  const responder = (id: number, valor: number | string) => {
    setPreguntas(prev => prev.map(p => p.id === id ? { ...p, respuesta: valor } : p));
  };

  const completado = preguntas.filter(p => p.tipo === 'likert').every(p => p.respuesta !== undefined);

  const enviar = () => {
    if (!completado) return;
    setEnviado(true);
  };

  if (enviado) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-96">
        <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center max-w-md">
          <p className="text-4xl mb-4">✓</p>
          <h2 className="text-lg font-bold text-gray-900 mb-2">Evaluacion enviada</h2>
          <p className="text-sm text-gray-500">Gracias por tu participacion. Tus respuestas son anonimas y ayudan a mejorar la calidad academica.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Evaluacion Docente</h1>
          <p className="text-gray-500 text-sm">Prof. R. Lopez — Ingles B1 — Periodo 2026-1</p>
        </div>
        <span className="text-xs text-orange-600 bg-orange-50 px-3 py-1 rounded-full border border-orange-200">Cierra en 5 dias</span>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3 text-xs text-yellow-700 mb-6">
        Tus respuestas son completamente anonimas. El docente no puede ver quien respondio.
      </div>

      <div className="space-y-4">
        {preguntas.map((p) => (
          <div key={p.id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <p className="text-sm font-medium text-gray-800 mb-3">{p.id}. {p.texto}</p>
            {p.tipo === 'likert' ? (
              <div className="flex gap-3 items-center">
                <span className="text-xs text-gray-400">Muy en desacuerdo</span>
                {[1, 2, 3, 4, 5].map(v => (
                  <button key={v} onClick={() => responder(p.id, v)}
                    className={
                      'w-9 h-9 rounded-full border-2 text-sm font-medium transition-colors ' +
                      (p.respuesta === v
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'border-gray-200 text-gray-500 hover:border-blue-400')
                    }>
                    {v}
                  </button>
                ))}
                <span className="text-xs text-gray-400">Muy de acuerdo</span>
              </div>
            ) : (
              <textarea
                value={(p.respuesta as string) ?? ''}
                onChange={e => responder(p.id, e.target.value)}
                placeholder="Escribe tu comentario aqui (opcional)..."
                rows={3}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between">
        <p className="text-xs text-gray-400">
          {preguntas.filter(p => p.tipo === 'likert' && p.respuesta !== undefined).length} de {preguntas.filter(p => p.tipo === 'likert').length} preguntas respondidas
        </p>
        <button onClick={enviar} disabled={!completado}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white text-sm font-medium px-6 py-2.5 rounded-lg transition-colors">
          Enviar evaluacion
        </button>
      </div>
    </div>
  );
}
