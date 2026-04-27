export default function EvaluacionDocente() {
  const dimensiones = [
    { nombre: 'Metodologia de ensenanza', puntaje: 4.8, peso: 25 },
    { nombre: 'Puntualidad y asistencia', puntaje: 4.5, peso: 15 },
    { nombre: 'Dominio del idioma', puntaje: 4.9, peso: 30 },
    { nombre: 'Comunicacion y trato', puntaje: 4.7, peso: 20 },
    { nombre: 'Comentarios abiertos', puntaje: 4.2, peso: 10 },
  ];

  const puntajeGlobal = dimensiones.reduce((acc, d) => acc + (d.puntaje * d.peso / 100), 0);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mi Evaluacion</h1>
          <p className="text-gray-500 text-sm">Resultados del periodo 2026-1</p>
        </div>
        <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full font-medium">Periodo cerrado</span>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 col-span-1">
          <p className="text-xs text-gray-500 mb-1">Puntaje global</p>
          <p className="text-4xl font-bold text-blue-600">{puntajeGlobal.toFixed(1)}</p>
          <p className="text-xs text-gray-400 mt-1">sobre 5.0 puntos</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500 mb-1">Participacion</p>
          <p className="text-4xl font-bold text-gray-900">91%</p>
          <p className="text-xs text-gray-400 mt-1">de estudiantes respondieron</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500 mb-1">Grupos evaluados</p>
          <p className="text-4xl font-bold text-gray-900">3</p>
          <p className="text-xs text-gray-400 mt-1">cursos activos</p>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-sm font-semibold text-gray-700 mb-5">Resultados por dimension</h2>
        <div className="space-y-5">
          {dimensiones.map((d, i) => (
            <div key={i}>
              <div className="flex justify-between items-center mb-1">
                <div>
                  <span className="text-sm text-gray-700">{d.nombre}</span>
                  <span className="ml-2 text-xs text-gray-400">({d.peso}% del total)</span>
                </div>
                <span className="text-sm font-bold text-gray-900">{d.puntaje}/5</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full">
                <div className={
                  'h-2 rounded-full ' +
                  (d.puntaje >= 4.5 ? 'bg-green-500' : d.puntaje >= 3.5 ? 'bg-yellow-400' : 'bg-red-400')
                } style={{ width: (d.puntaje / 5 * 100) + '%' }} />
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-6">Las respuestas individuales son anonimas. Solo el administrador puede ver el detalle completo.</p>
      </div>
    </div>
  );
}
