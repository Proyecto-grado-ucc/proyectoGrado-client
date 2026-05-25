import { useEffect, useMemo, useState } from 'react';
import { Activity, CheckCircle2, Clock3, Database, Globe2, Lock, RefreshCw, Server, ShieldCheck, WifiOff } from 'lucide-react';

type EstadoServicio = 'operational' | 'degraded' | 'down' | 'checking';

interface HealthPayload {
  estado?: string;
  timestamp?: string;
  version?: string;
}

interface ResultadoChequeo {
  apiEstado: EstadoServicio;
  seguridadEstado: EstadoServicio;
  latenciaMs: number | null;
  codigoHealth: number | null;
  codigoSeguridad: number | null;
  version: string;
  timestampApi: string | null;
  revisadoEn: Date;
}

const API_BASE = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');

const estadoConfig: Record<EstadoServicio, { label: string; badge: string; dot: string; text: string }> = {
  operational: {
    label: 'Operativo',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dot: 'bg-emerald-500',
    text: 'text-emerald-700',
  },
  degraded: {
    label: 'Degradado',
    badge: 'bg-amber-50 text-amber-700 border-amber-200',
    dot: 'bg-amber-500',
    text: 'text-amber-700',
  },
  down: {
    label: 'No disponible',
    badge: 'bg-red-50 text-red-700 border-red-200',
    dot: 'bg-red-500',
    text: 'text-red-700',
  },
  checking: {
    label: 'Verificando',
    badge: 'bg-slate-50 text-slate-600 border-slate-200',
    dot: 'bg-slate-400',
    text: 'text-slate-600',
  },
};

function formatearHora(fecha: Date | string | null) {
  if (!fecha) return 'Sin dato';
  return new Date(fecha).toLocaleString('es-CO', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

function evaluarLatencia(ms: number | null): EstadoServicio {
  if (ms === null) return 'down';
  if (ms < 900) return 'operational';
  if (ms < 1800) return 'degraded';
  return 'down';
}

function ServicioFila({
  icono,
  nombre,
  detalle,
  estado,
  metrica,
}: {
  icono: React.ReactNode;
  nombre: string;
  detalle: string;
  estado: EstadoServicio;
  metrica: string;
}) {
  const cfg = estadoConfig[estado];
  return (
    <div className="grid grid-cols-[auto_1fr_auto] items-center gap-4 border-b border-slate-100 px-5 py-4 last:border-b-0">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
        {icono}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-slate-950">{nombre}</p>
        <p className="mt-0.5 text-xs text-slate-500">{detalle}</p>
      </div>
      <div className="flex items-center gap-3">
        <span className="hidden text-xs font-medium text-slate-500 sm:inline">{metrica}</span>
        <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${cfg.badge}`}>
          <span className={`h-2 w-2 rounded-full ${cfg.dot}`} />
          {cfg.label}
        </span>
      </div>
    </div>
  );
}

function MetricCard({ label, valor, detalle, icono }: { label: string; valor: string; detalle: string; icono: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</span>
        <span className="text-slate-400">{icono}</span>
      </div>
      <p className="text-2xl font-bold text-slate-950">{valor}</p>
      <p className="mt-1 text-xs text-slate-500">{detalle}</p>
    </div>
  );
}

export default function Status() {
  const [resultado, setResultado] = useState<ResultadoChequeo | null>(null);
  const [cargando, setCargando] = useState(true);

  const revisarEstado = async () => {
    setCargando(true);
    const inicio = performance.now();
    let healthStatus: number | null = null;
    let securityStatus: number | null = null;
    let payload: HealthPayload = {};
    let latencia: number | null = null;

    try {
      const health = await fetch(`${API_BASE}/health`, { cache: 'no-store' });
      healthStatus = health.status;
      latencia = Math.round(performance.now() - inicio);
      payload = await health.json();
    } catch {
      latencia = null;
    }

    try {
      const seguridad = await fetch(`${API_BASE}/periodos?page=1&size=1`, { cache: 'no-store' });
      securityStatus = seguridad.status;
    } catch {
      securityStatus = null;
    }

    const apiEstado: EstadoServicio = healthStatus === 200 && payload.estado === 'ok'
      ? evaluarLatencia(latencia)
      : 'down';

    const seguridadEstado: EstadoServicio = securityStatus === 401 || securityStatus === 403
      ? 'operational'
      : securityStatus === null
        ? 'down'
        : 'degraded';

    setResultado({
      apiEstado,
      seguridadEstado,
      latenciaMs: latencia,
      codigoHealth: healthStatus,
      codigoSeguridad: securityStatus,
      version: payload.version ?? 'No reportada',
      timestampApi: payload.timestamp ?? null,
      revisadoEn: new Date(),
    });
    setCargando(false);
  };

  useEffect(() => {
    revisarEstado();
    const intervalo = window.setInterval(revisarEstado, 60_000);
    return () => window.clearInterval(intervalo);
  }, []);

  const estadoGlobal = useMemo<EstadoServicio>(() => {
    if (!resultado) return cargando ? 'checking' : 'down';
    if (resultado.apiEstado === 'operational' && resultado.seguridadEstado === 'operational') return 'operational';
    if (resultado.apiEstado === 'down') return 'down';
    return 'degraded';
  }, [resultado, cargando]);

  const cfgGlobal = estadoConfig[estadoGlobal];
  const latenciaTexto = resultado?.latenciaMs !== null && resultado?.latenciaMs !== undefined
    ? `${resultado.latenciaMs} ms`
    : 'Sin respuesta';

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-10 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
              <Activity className="h-4 w-4" />
              Sistema CAL Status
            </div>
            <h1 className="text-4xl font-bold tracking-normal text-slate-950 md:text-5xl">Estado del servicio</h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
              Monitoreo publico del frontend, API y capa de seguridad del Sistema CAL desplegado en AWS.
            </p>
          </div>
          <button
            onClick={revisarEstado}
            disabled={cargando}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <RefreshCw className={`h-4 w-4 ${cargando ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-8">
        <div className={`mb-6 rounded-lg border px-5 py-4 ${cfgGlobal.badge}`}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              {estadoGlobal === 'down' ? <WifiOff className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}
              <div>
                <p className="text-sm font-bold">Estado general: {cfgGlobal.label}</p>
                <p className="text-xs opacity-80">
                  Ultima verificacion: {resultado ? formatearHora(resultado.revisadoEn) : 'Ejecutando chequeo inicial'}
                </p>
              </div>
            </div>
            <span className="text-xs font-semibold">
              API {resultado?.codigoHealth ?? '-'} · Seguridad {resultado?.codigoSeguridad ?? '-'}
            </span>
          </div>
        </div>

        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <MetricCard
            label="Latencia API"
            valor={latenciaTexto}
            detalle="Medicion desde el navegador actual"
            icono={<Clock3 className="h-5 w-5" />}
          />
          <MetricCard
            label="Version API"
            valor={resultado?.version ?? 'Verificando'}
            detalle="Reportada por /api/health"
            icono={<Server className="h-5 w-5" />}
          />
          <MetricCard
            label="Timestamp backend"
            valor={resultado?.timestampApi ? 'Sincronizado' : 'Verificando'}
            detalle={formatearHora(resultado?.timestampApi ?? null)}
            icono={<Database className="h-5 w-5" />}
          />
        </div>

        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="text-base font-bold text-slate-950">Componentes monitoreados</h2>
            <p className="mt-1 text-xs text-slate-500">Chequeos en vivo contra la aplicacion publicada.</p>
          </div>
          <ServicioFila
            icono={<Globe2 className="h-5 w-5" />}
            nombre="Frontend web"
            detalle="Interfaz React servida desde AWS Amplify"
            estado="operational"
            metrica="Pagina cargada"
          />
          <ServicioFila
            icono={<Server className="h-5 w-5" />}
            nombre="API REST"
            detalle={`${API_BASE}/health`}
            estado={resultado?.apiEstado ?? 'checking'}
            metrica={latenciaTexto}
          />
          <ServicioFila
            icono={<ShieldCheck className="h-5 w-5" />}
            nombre="Rutas protegidas"
            detalle="Validacion de rechazo sin token JWT"
            estado={resultado?.seguridadEstado ?? 'checking'}
            metrica={`HTTP ${resultado?.codigoSeguridad ?? '-'}`}
          />
          <ServicioFila
            icono={<Lock className="h-5 w-5" />}
            nombre="Autenticacion"
            detalle="Capa JWT y control de acceso del backend"
            estado={resultado?.seguridadEstado ?? 'checking'}
            metrica="JWT requerido"
          />
        </div>

        <div className="mt-6 rounded-lg border border-slate-200 bg-white px-5 py-4 text-xs leading-6 text-slate-500">
          Este panel ejecuta chequeos desde el navegador. Los resultados pueden variar por red, region y disponibilidad temporal de AWS.
        </div>
      </section>
    </main>
  );
}
