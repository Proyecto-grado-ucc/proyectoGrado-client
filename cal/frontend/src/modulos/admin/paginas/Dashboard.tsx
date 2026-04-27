export default function Dashboard() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Dashboard</h1>
      <p className="text-gray-500 text-sm">Bienvenido al sistema CAL</p>

      <div className="grid grid-cols-4 gap-4 mt-8">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500 mb-1">Docentes activos</p>
          <p className="text-3xl font-bold text-gray-900">12</p>
          <div className="mt-2 h-1 bg-blue-500 rounded-full w-3/4" />
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500 mb-1">Cursos activos</p>
          <p className="text-3xl font-bold text-gray-900">18</p>
          <div className="mt-2 h-1 bg-green-500 rounded-full w-2/3" />
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500 mb-1">Aulas habilitadas</p>
          <p className="text-3xl font-bold text-gray-900">8</p>
          <div className="mt-2 h-1 bg-purple-500 rounded-full w-1/2" />
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500 mb-1">Período activo</p>
          <p className="text-3xl font-bold text-gray-900">2026-1</p>
          <div className="mt-2 h-1 bg-orange-500 rounded-full w-full" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-4">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Estado del horario</h2>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full font-medium">Borrador</span>
            <span className="text-sm text-gray-500">Período 2026-1</span>
          </div>
          <p className="text-xs text-gray-400 mt-3">Última generación: hace 2 horas</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Evaluación docente</h2>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">Período cerrado</span>
          </div>
          <p className="text-xs text-gray-400 mt-3">Promedio global: 87.3 puntos</p>
        </div>
      </div>
    </div>
  );
}
