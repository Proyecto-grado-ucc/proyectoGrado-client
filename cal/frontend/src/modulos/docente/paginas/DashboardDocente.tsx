export default function DashboardDocente() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Mi Dashboard</h1>
      <p className="text-gray-500 text-sm mb-8">Bienvenido al panel docente</p>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500 mb-1">Horas semanales</p>
          <p className="text-3xl font-bold text-gray-900">12</p>
          <div className="mt-2 h-1 bg-green-500 rounded-full w-3/4" />
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500 mb-1">Grupos asignados</p>
          <p className="text-3xl font-bold text-gray-900">3</p>
          <div className="mt-2 h-1 bg-blue-500 rounded-full w-1/2" />
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500 mb-1">Mi puntaje global</p>
          <p className="text-3xl font-bold text-gray-900">87.3</p>
          <div className="mt-2 h-1 bg-purple-500 rounded-full w-4/5" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Horario esta semana</h2>
          <div className="space-y-2">
            {[
              { dia: 'Martes', hora: '14:00 - 16:00', grupo: 'Ingles B1 - G02', aula: 'A-02' },
              { dia: 'Miercoles', hora: '16:00 - 18:00', grupo: 'Ingles B1 - G01', aula: 'A-01' },
              { dia: 'Jueves', hora: '14:00 - 16:00', grupo: 'Ingles B2 - G01', aula: 'A-03' },
            ].map((c, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50">
                <div>
                  <p className="text-xs font-medium text-gray-800">{c.grupo}</p>
                  <p className="text-xs text-gray-400">{c.dia} {c.hora}</p>
                </div>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{c.aula}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Mi evaluacion — Periodo 2026-1</h2>
          <div className="space-y-3">
            {[
              { dim: 'Metodologia', puntaje: 4.8 },
              { dim: 'Puntualidad', puntaje: 4.5 },
              { dim: 'Dominio del idioma', puntaje: 4.9 },
              { dim: 'Comunicacion', puntaje: 4.7 },
            ].map((d, i) => (
              <div key={i}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-600">{d.dim}</span>
                  <span className="font-medium text-gray-800">{d.puntaje}/5</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full">
                  <div className="h-1.5 bg-blue-500 rounded-full" style={{ width: (d.puntaje / 5 * 100) + '%' }} />
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-4">Periodo cerrado — datos de solo lectura</p>
        </div>
      </div>
    </div>
  );
}
