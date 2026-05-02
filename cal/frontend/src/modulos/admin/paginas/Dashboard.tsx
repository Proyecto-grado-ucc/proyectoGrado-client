import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { clienteApi } from '../../../compartido/api';

// ──────────────────────────────────────────────
// Tipos
// ──────────────────────────────────────────────
interface Periodo {
  id: number;
  nombre: string;
  fechaInicio: string;
  fechaFin: string;
}

interface DistribucionItem {
  rango: string;
  cantidad: number;
}

interface ResumenDashboard {
  totalDocentes: number;
  totalEvaluaciones: number;
  promedioGlobal: number;
  alertasCriticas: number;
  alertasAdvertencia: number;
  distribucionPuntuaciones: DistribucionItem[];
}

// ──────────────────────────────────────────────
// Fetchers
// ──────────────────────────────────────────────
async function fetchConteo(ruta: string): Promise<number> {
  const { data } = await clienteApi.get(ruta, { params: { page: 1, size: 1 } });
  return data.total as number;
}

async function fetchPeriodos(): Promise<Periodo[]> {
  const { data } = await clienteApi.get('/periodos', { params: { page: 1, size: 20 } });
  return data.items as Periodo[];
}

async function fetchResumen(periodoId: number): Promise<ResumenDashboard> {
  const { data } = await clienteApi.get('/dashboard/resumen', { params: { periodoId } });
  return data as ResumenDashboard;
}

// ──────────────────────────────────────────────
// Sub-componentes
// ──────────────────────────────────────────────
interface TarjetaConteoProps {
  label: string;
  valor: number | string;
  color: string;
  icono: string;
}

function TarjetaConteo({ label, valor, color, icono }: TarjetaConteoProps) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-start gap-4">
      <span
        className="text-2xl w-11 h-11 flex items-center justify-center rounded-xl flex-shrink-0"
        style={{ backgroundColor: `${color}1A` }}
      >
        {icono}
      </span>
      <div>
        <p className="text-xs text-gray-500 font-medium mb-0.5">{label}</p>
        <p className="text-3xl font-bold text-gray-900 leading-none">{valor}</p>
      </div>
      <div
        className="mt-auto ml-auto w-1 self-stretch rounded-full opacity-40"
        style={{ backgroundColor: color }}
      />
    </div>
  );
}

interface TarjetaEvalProps {
  label: string;
  valor: number | string;
  sub?: string;
  color: string;
  bg: string;
}

function TarjetaEval({ label, valor, sub, color, bg }: TarjetaEvalProps) {
  return (
    <div className={`rounded-2xl p-5 border ${bg}`}>
      <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color }}>
        {label}
      </p>
      <p className="text-4xl font-black" style={{ color }}>
        {valor}
      </p>
      {sub && <p className="text-xs mt-1 opacity-70" style={{ color }}>{sub}</p>}
    </div>
  );
}

// ──────────────────────────────────────────────
// Componente principal
// ──────────────────────────────────────────────
export default function Dashboard() {
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState<number | null>(null);

  // Conteos generales del sistema
  const { data: totalDocentes } = useQuery({
    queryKey: ['conteo-docentes'],
    queryFn: () => fetchConteo('/docentes'),
  });
  const { data: totalCursos } = useQuery({
    queryKey: ['conteo-cursos'],
    queryFn: () => fetchConteo('/cursos'),
  });
  const { data: totalAulas } = useQuery({
    queryKey: ['conteo-aulas'],
    queryFn: () => fetchConteo('/aulas'),
  });
  const { data: totalUsuarios } = useQuery({
    queryKey: ['conteo-usuarios'],
    queryFn: () => fetchConteo('/usuarios'),
  });

  // Periodos disponibles
  const { data: periodos, isLoading: cargandoPeriodos } = useQuery({
    queryKey: ['periodos-dashboard'],
    queryFn: fetchPeriodos,
  });

  // Auto-seleccionar el primer periodo cuando se carguen
  useEffect(() => {
    if (periodos && periodos.length > 0 && periodoSeleccionado === null) {
      setPeriodoSeleccionado(periodos[0].id);
    }
  }, [periodos]);

  // Resumen del periodo seleccionado
  const {
    data: resumen,
    isLoading: cargandoResumen,
    isError: errorResumen,
  } = useQuery({
    queryKey: ['dashboard-resumen', periodoSeleccionado],
    queryFn: () => fetchResumen(periodoSeleccionado!),
    enabled: periodoSeleccionado !== null,
  });

  const periodoActivo = periodos?.find((p) => p.id === periodoSeleccionado);
  const maxDistribucion = Math.max(
    1,
    ...(resumen?.distribucionPuntuaciones.map((d) => d.cantidad) ?? []),
  );

  const tarjetasSistema: TarjetaConteoProps[] = [
    { label: 'Docentes activos', valor: totalDocentes ?? '—', color: '#3b82f6', icono: '👨‍🏫' },
    { label: 'Cursos activos', valor: totalCursos ?? '—', color: '#10b981', icono: '📚' },
    { label: 'Aulas habilitadas', valor: totalAulas ?? '—', color: '#8b5cf6', icono: '🏫' },
    { label: 'Usuarios totales', valor: totalUsuarios ?? '—', color: '#f59e0b', icono: '👥' },
  ];

  return (
    <div className="p-8 min-h-full bg-gray-50">
      {/* Encabezado */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-0.5">Dashboard</h1>
          <p className="text-gray-500 text-sm">Panel de control del Sistema CAL</p>
        </div>

        {/* Selector de periodo */}
        <div className="flex items-center gap-2">
          <label htmlFor="selector-periodo" className="text-xs font-medium text-gray-500">
            Periodo:
          </label>
          <select
            id="selector-periodo"
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={periodoSeleccionado ?? ''}
            onChange={(e) => setPeriodoSeleccionado(Number(e.target.value))}
            disabled={cargandoPeriodos}
          >
            {cargandoPeriodos && <option value="">Cargando...</option>}
            {periodos?.length === 0 && <option value="">Sin periodos</option>}
            {periodos?.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Fila 1: Conteos del sistema ── */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {tarjetasSistema.map((t) => (
          <TarjetaConteo key={t.label} {...t} />
        ))}
      </div>

      {/* ── Fila 2: Estadísticas de evaluación del periodo ── */}
      {periodoSeleccionado === null ? (
        <div className="bg-white rounded-2xl p-8 border border-dashed border-gray-200 text-center text-gray-400 text-sm mb-6">
          Selecciona un periodo académico para ver las estadísticas de evaluación.
        </div>
      ) : cargandoResumen ? (
        <div className="bg-white rounded-2xl p-8 text-center text-gray-400 text-sm mb-6 animate-pulse">
          Cargando estadísticas del periodo...
        </div>
      ) : errorResumen ? (
        <div className="bg-red-50 rounded-2xl p-6 border border-red-100 text-red-600 text-sm mb-6">
          No se pudieron cargar las estadísticas. Verifica que el backend esté activo.
        </div>
      ) : resumen ? (
        <>
          {/* Tarjetas de evaluación */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <TarjetaEval
              label="Evaluaciones completadas"
              valor={resumen.totalEvaluaciones}
              sub={`de ${resumen.totalDocentes} docentes`}
              color="#1d4ed8"
              bg="bg-blue-50 border-blue-100"
            />
            <TarjetaEval
              label="Promedio global"
              valor={resumen.promedioGlobal.toFixed(2)}
              sub="sobre 5.0"
              color="#059669"
              bg="bg-emerald-50 border-emerald-100"
            />
            <TarjetaEval
              label="Alertas críticas"
              valor={resumen.alertasCriticas}
              sub="requieren atención"
              color="#dc2626"
              bg="bg-red-50 border-red-100"
            />
            <TarjetaEval
              label="Advertencias"
              valor={resumen.alertasAdvertencia}
              sub="en seguimiento"
              color="#d97706"
              bg="bg-amber-50 border-amber-100"
            />
          </div>

          {/* Distribución de puntuaciones */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-5">
              Distribución de puntuaciones — {periodoActivo?.nombre}
            </h2>
            <div className="flex items-end gap-4 h-36">
              {resumen.distribucionPuntuaciones.map((d) => {
                const pct = Math.round((d.cantidad / maxDistribucion) * 100);
                const colores: Record<string, string> = {
                  '1.0-2.0': '#ef4444',
                  '2.0-3.0': '#f97316',
                  '3.0-4.0': '#eab308',
                  '4.0-5.0': '#22c55e',
                };
                const color = colores[d.rango] ?? '#6b7280';
                return (
                  <div key={d.rango} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-xs font-bold text-gray-700">{d.cantidad}</span>
                    <div className="w-full rounded-t-lg transition-all" style={{ height: `${pct}%`, backgroundColor: color, minHeight: d.cantidad > 0 ? '8px' : '2px' }} />
                    <span className="text-[10px] text-gray-500 whitespace-nowrap">{d.rango}</span>
                  </div>
                );
              })}
            </div>
            {resumen.distribucionPuntuaciones.every((d) => d.cantidad === 0) && (
              <p className="text-center text-gray-400 text-xs mt-4">Sin datos de evaluación para este periodo aún.</p>
            )}
          </div>
        </>
      ) : null}

      {/* ── Fila 3: Info del periodo activo ── */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Periodo académico seleccionado</h2>
        {periodoActivo ? (
          <div className="flex items-center gap-4">
            <div>
              <p className="text-xl font-bold text-gray-900">{periodoActivo.nombre}</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {new Date(periodoActivo.fechaInicio).toLocaleDateString('es-CO')} —{' '}
                {new Date(periodoActivo.fechaFin).toLocaleDateString('es-CO')}
              </p>
            </div>
            <span className="ml-auto px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
              Activo
            </span>
          </div>
        ) : (
          <div>
            <p className="text-sm text-gray-400">Sin periodos configurados</p>
            <a href="/admin/configuracion" className="text-xs text-blue-600 hover:underline mt-1 block">
              Crear periodo académico →
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
