export default function DashboardEstudiante() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Mi Dashboard</h1>
      <p className="text-gray-500 text-sm mb-8">Bienvenido al portal estudiantil</p>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500 mb-1">Mi curso</p>
          <p className="text-xl font-bold text-gray-900">Ingles B1</p>
          <p className="text-xs text-gray-400 mt-1">Grupo G02 — Tarde</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500 mb-1">Evaluaciones pendientes</p>
          <p className="text-3xl font-bold text-orange-500">1</p>
          <div className="mt-2 h-1 bg-orange-400 rounded-full w-1/3" />
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500 mb-1">Periodo activo</p>
          <p className="text-xl font-bold text-gray-900">2026-1</p>
          <p className="text-xs text-gray-400 mt-1">Evaluacion abierta</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Mi horario esta semana</h2>
          <div className="space-y-2">
            {[
              { dia: 'Martes', hora: '14:00 - 16:00', docente: 'Prof. R. Lopez' },
              { dia: 'Miercoles', hora: '14:00 - 16:00', docente: 'Prof. R. Lopez' },
              { dia: 'Jueves', hora: '14:00 - 16:00', docente: 'Prof. R. Lopez' },
            ].map((c, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50">
                <div>
                  <p className="text-xs font-medium text-gray-800">{c.dia} {c.hora}</p>
                  <p className="text-xs text-gray-400">{c.docente}</p>
                </div>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">A-02</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Evaluaciones pendientes</h2>
          <div className="border border-orange-200 bg-orange-50 rounded-lg p-4">
            <p className="text-sm font-medium text-gray-800">Evaluacion Docente 2026-1</p>
            <p className="text-xs text-gray-500 mt-1">Prof. R. Lopez — Ingles B1</p>
            <p className="text-xs text-orange-600 mt-2">Cierra en 5 dias</p>
            <button className="mt-3 text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700">
              Ir a evaluar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
