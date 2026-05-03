import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clienteApi } from '../../../compartido/api';

interface Asignacion { grupoId: number; docenteId: number; aulaId: number; franjaId: number; }
interface Horario { id: number; periodoNombre: string; asignaciones: Asignacion[]; codigoAcceso?: string; }
interface Franja { id: number; diaSemana: string; horaInicio: string; horaFin: string; bloqueIdx: number; }
interface Grupo { id: number; codigo: string; cursoNombre: string; }
interface Docente { id: number; usuarioNombre: string; }
interface Aula { id: number; codigo: string; }

const DIAS: Record<string, string> = { LUN: 'Lunes', MAR: 'Martes', MIE: 'Miercoles', JUE: 'Jueves', VIE: 'Viernes', SAB: 'Sabado' };
const ORDEN_DIAS = ['LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB'];

const fetchAll = async <T extends object>(ruta: string): Promise<T[]> => {
  const { data } = await clienteApi.get(ruta, { params: { page: 1, size: 200 } });
  return (data.items ?? data) as T[];
};

// ── Pantalla ingreso de codigo ─────────────────────────────────────────────
function PantallaIngresoCodigo({ onIngresado }: { onIngresado: () => void }) {
  const [codigo, setCodigo] = useState('');
  const [error, setError] = useState('');

  const mutIngresar = useMutation({
    mutationFn: () => clienteApi.post('/horarios/ingresar', { codigo: codigo.trim().toUpperCase() }),
    onSuccess: () => onIngresado(),
    onError: (e: unknown) => {
      const m = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(m ?? 'Codigo invalido. Verifica con tu administrador.');
    },
  });

  return (
    <div className="p-8 min-h-full bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 w-full max-w-md text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M8 11V7a4 4 0 018 0v4m-4 4v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
          </svg>
        </div>

        <h1 className="text-xl font-bold text-gray-900 mb-1">Ingresar a mi clase</h1>
        <p className="text-gray-500 text-sm mb-6">
          Ingresa el código de acceso que te proporcionó el administrador para acceder a tu horario y evaluaciones.
        </p>

        <div className="space-y-4">
          <input
            type="text"
            placeholder="Ej: CAL-A4K2-8X1P"
            value={codigo}
            onChange={(e) => { setCodigo(e.target.value.toUpperCase()); setError(''); }}
            onKeyDown={(e) => e.key === 'Enter' && !mutIngresar.isPending && codigo.trim() && mutIngresar.mutate()}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-center text-lg font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
            maxLength={20}
          />

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          <button
            onClick={() => mutIngresar.mutate()}
            disabled={!codigo.trim() || mutIngresar.isPending}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {mutIngresar.isPending ? 'Verificando...' : 'Ingresar a mi clase'}
          </button>
        </div>

        <p className="text-xs text-gray-400 mt-5">
          El código tiene el formato <span className="font-mono font-medium">CAL-XXXX-XXXX</span>
        </p>
      </div>
    </div>
  );
}

// ── Vista del horario ──────────────────────────────────────────────────────
function VistaHorario({ horario }: { horario: Horario }) {
  const { data: franjas } = useQuery({ queryKey: ['franjas-est'], queryFn: () => fetchAll<Franja>('/franjas-horarias') });
  const { data: grupos } = useQuery({ queryKey: ['grupos-est'], queryFn: () => fetchAll<Grupo>('/grupos') });
  const { data: docentes } = useQuery({ queryKey: ['docentes-est'], queryFn: () => fetchAll<Docente>('/docentes') });
  const { data: aulas } = useQuery({ queryKey: ['aulas-est'], queryFn: () => fetchAll<Aula>('/aulas') });

  const asignaciones = horario.asignaciones ?? [];

  const diasPresentes = [...new Set(
    asignaciones.map(a => franjas?.find(f => f.id === a.franjaId)?.diaSemana ?? '').filter(Boolean)
  )].sort((a, b) => ORDEN_DIAS.indexOf(a) - ORDEN_DIAS.indexOf(b));

  const bloquesUnicos = [...new Set(
    asignaciones.map(a => franjas?.find(f => f.id === a.franjaId)?.bloqueIdx ?? -1).filter(b => b >= 0)
  )].sort((a, b) => a - b);

  const getAsig = (dia: string, bloque: number) => {
    const franja = franjas?.find(f => f.diaSemana === dia && f.bloqueIdx === bloque);
    if (!franja) return null;
    return asignaciones.find(a => a.franjaId === franja.id) ?? null;
  };

  const getHora = (bloque: number) => {
    const f = franjas?.find(x => x.bloqueIdx === bloque);
    return f ? `${f.horaInicio.substring(0, 5)}-${f.horaFin.substring(0, 5)}` : `Bloque ${bloque}`;
  };

  return (
    <div className="p-8 min-h-full bg-gray-50">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mi Horario</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {horario.periodoNombre} — {asignaciones.length} sesiones
          </p>
        </div>
        <div className="flex items-center gap-3">
          {horario.codigoAcceso && (
            <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs rounded-full font-mono font-medium border border-blue-200">
              {horario.codigoAcceso}
            </span>
          )}
          <span className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">Inscrito</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr>
              <th className="bg-gray-50 px-3 py-2 text-left text-gray-500 font-semibold border border-gray-100 w-28">Horario</th>
              {diasPresentes.map(d => (
                <th key={d} className="bg-gray-50 px-3 py-2 text-center text-gray-700 font-semibold border border-gray-100">{DIAS[d] ?? d}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {bloquesUnicos.map(bloque => (
              <tr key={bloque}>
                <td className="bg-gray-50 px-3 py-2 text-gray-500 border border-gray-100 whitespace-nowrap font-medium">{getHora(bloque)}</td>
                {diasPresentes.map(dia => {
                  const asig = getAsig(dia, bloque);
                  const grupo = asig ? grupos?.find(g => g.id === asig.grupoId) : null;
                  const docente = asig ? docentes?.find(d => d.id === asig.docenteId) : null;
                  const aula = asig ? aulas?.find(a => a.id === asig.aulaId) : null;
                  return (
                    <td key={dia} className="border border-gray-100 p-1 align-top h-20 w-40">
                      {asig ? (
                        <div className="w-full h-full rounded-lg p-2 bg-blue-50 border-l-2 border-blue-400">
                          <p className="font-semibold text-blue-900 truncate">{grupo?.cursoNombre ?? `Grupo ${asig.grupoId}`}</p>
                          <p className="text-blue-700 truncate text-xs">{grupo?.codigo ?? ''}</p>
                          <p className="text-blue-500 truncate text-xs">{(docente?.usuarioNombre ?? '').split(' ')[0]} · {aula?.codigo ?? ''}</p>
                        </div>
                      ) : (
                        <div className="w-full h-full rounded-lg border border-dashed border-gray-200" />
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Componente principal ───────────────────────────────────────────────────
export default function HorarioEstudiante() {
  const qc = useQueryClient();

  const { data: horario, isLoading } = useQuery<Horario | null>({
    queryKey: ['mi-horario-est'],
    queryFn: async () => {
      try {
        const { data } = await clienteApi.get('/horarios/estudiante/mi-horario');
        return data as Horario;
      } catch {
        return null;
      }
    },
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-full">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!horario) {
    return <PantallaIngresoCodigo onIngresado={() => qc.invalidateQueries({ queryKey: ['mi-horario-est'] })} />;
  }

  return <VistaHorario horario={horario} />;
}
