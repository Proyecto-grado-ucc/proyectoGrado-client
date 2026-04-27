export default function HorarioEstudiante() {
  const dias = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'];
  const franjas = ['08:00-10:00', '10:00-12:00', '14:00-16:00', '16:00-18:00', '18:00-20:00'];

  const clases: Record<string, { grupo: string; docente: string; aula: string }> = {
    'Martes-14:00-16:00': { grupo: 'Ingles B1 G02', docente: 'R. Lopez', aula: 'A-02' },
    'Miercoles-14:00-16:00': { grupo: 'Ingles B1 G02', docente: 'R. Lopez', aula: 'A-02' },
    'Jueves-14:00-16:00': { grupo: 'Ingles B1 G02', docente: 'R. Lopez', aula: 'A-02' },
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mi Horario</h1>
          <p className="text-gray-500 text-sm">Ingles B1 — Grupo G02 — Periodo 2026-1</p>
        </div>
        <span className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">Publicado</span>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="grid grid-cols-7 border-b border-gray-100">
          <div className="px-3 py-3 text-xs font-semibold text-gray-400 bg-gray-50" />
          {dias.map(d => (
            <div key={d} className="px-3 py-3 text-xs font-semibold text-gray-600 text-center bg-gray-50 border-l border-gray-100">{d}</div>
          ))}
        </div>
        {franjas.map(franja => (
          <div key={franja} className="grid grid-cols-7 border-b border-gray-50">
            <div className="px-3 py-4 text-xs text-gray-400 bg-gray-50 flex items-center">{franja}</div>
            {dias.map(dia => {
              const key = dia + '-' + franja;
              const clase = clases[key];
              return (
                <div key={dia} className="border-l border-gray-50 p-1 min-h-16">
                  {clase && (
                    <div className="rounded-lg border bg-blue-100 border-blue-300 text-blue-800 p-2 h-full">
                      <p className="text-xs font-medium leading-tight">{clase.grupo}</p>
                      <p className="text-xs opacity-70 mt-0.5">Prof. {clase.docente}</p>
                      <p className="text-xs opacity-70">{clase.aula}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
