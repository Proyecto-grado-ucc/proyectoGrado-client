import { useQuery } from '@tanstack/react-query';
import { clienteApi } from '../../../compartido/api';
import { useAuthStore } from '../../../seguridad/store';

interface Estudiante { id: number; usuarioEmail: string; grupoId: number; }
interface Asignacion { grupoId: number; docenteId: number; aulaId: number; franjaId: number; }
interface Horario { id: number; periodoNombre: string; asignaciones: Asignacion[]; }
interface Franja { id: number; diaSemana: string; horaInicio: string; horaFin: string; bloqueIdx: number; }
interface Grupo { id: number; codigo: string; cursoNombre: string; cursoId: number; }
interface Docente { id: number; usuarioNombre: string; }
interface Aula { id: number; codigo: string; tipo: string; }
interface Curso { id: number; nivelId: number; }
interface Nivel { id: number; codigo: string; }

const DIAS: Record<string, string> = { LUN: 'Lunes', MAR: 'Martes', MIE: 'Miercoles', JUE: 'Jueves', VIE: 'Viernes', SAB: 'Sabado' };
const ORDEN_DIAS = ['LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB'];
const NIVEL_COLOR: Record<string, string> = { A1: '#3b82f6', A2: '#8b5cf6', B1: '#10b981', B2: '#f59e0b', C1: '#ec4899' };

const fetchAll = async <T extends object>(ruta: string): Promise<T[]> => {
  const { data } = await clienteApi.get(ruta, { params: { page: 1, size: 200 } });
  return (data.items ?? data) as T[];
};

export default function HorarioEstudiante() {
  const email = useAuthStore(s => s.usuario?.email ?? '');

  const { data: estudiantes } = useQuery({ queryKey: ['estudiantes-he'], queryFn: () => fetchAll<Estudiante>('/estudiantes') });
  const miEstudiante = estudiantes?.find(e => e.usuarioEmail === email);
  const miGrupoId = miEstudiante?.grupoId;

  const { data: horarios } = useQuery({ queryKey: ['horarios-he'], queryFn: () => fetchAll<Horario>('/horarios') });
  const horarioActivoResumen = horarios?.[0];

  const { data: horarioDetalle, isLoading } = useQuery({
    queryKey: ['horario-detalle-he', horarioActivoResumen?.id],
    queryFn: async () => {
      const { data } = await clienteApi.get(`/horarios/${horarioActivoResumen!.id}`);
      return data as Horario;
    },
    enabled: !!horarioActivoResumen
  });

  const { data: franjas } = useQuery({ queryKey: ['franjas-he'], queryFn: () => fetchAll<Franja>('/franjas-horarias') });
  const { data: grupos } = useQuery({ queryKey: ['grupos-he'], queryFn: () => fetchAll<Grupo>('/grupos') });
  const { data: docentes } = useQuery({ queryKey: ['docentes-he'], queryFn: () => fetchAll<Docente>('/docentes') });
  const { data: aulas } = useQuery({ queryKey: ['aulas-he'], queryFn: () => fetchAll<Aula>('/aulas') });
  const { data: cursos } = useQuery({ queryKey: ['cursos-he'], queryFn: () => fetchAll<Curso>('/cursos') });
  const { data: niveles } = useQuery({ queryKey: ['niveles-he'], queryFn: () => fetchAll<Nivel>('/niveles') });

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-full">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!horarioDetalle) {
    return (
      <div className="p-8 flex items-center justify-center min-h-full">
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400">
          <p className="text-base font-medium text-gray-600 mb-1">Sin horario disponible</p>
          <p className="text-sm">El administrador aún no ha publicado el horario.</p>
        </div>
      </div>
    );
  }

  const asignaciones = horarioDetalle.asignaciones.filter(a => a.grupoId === miGrupoId) ?? [];

  if (asignaciones.length === 0) {
    return (
      <div className="p-8 flex items-center justify-center min-h-full">
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400">
          <p className="text-base font-medium text-gray-600 mb-1">Sin clases asignadas</p>
          <p className="text-sm">No tienes clases programadas en este horario.</p>
        </div>
      </div>
    );
  }

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

  const getColor = (asig: Asignacion) => {
    const grupo = grupos?.find(g => g.id === asig.grupoId);
    const curso = cursos?.find(c => c.id === grupo?.cursoId);
    const nivel = niveles?.find(n => n.id === curso?.nivelId);
    return NIVEL_COLOR[nivel?.codigo ?? ''] ?? '#6b7280';
  };

  return (
    <div className="p-8 min-h-full bg-gray-50">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mi Horario</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {horarioDetalle.periodoNombre} — {asignaciones.length} sesiones
          </p>
        </div>
        <div className="flex items-center gap-3">
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
                  const color = asig ? getColor(asig) : '';
                  return (
                    <td key={dia} className="border border-gray-100 p-1 align-top h-20 w-40">
                      {asig ? (
                        <div className="w-full h-full rounded-lg p-2"
                             style={{ backgroundColor: `${color}20`, borderLeft: `3px solid ${color}` }}>
                          <p className="font-semibold text-gray-800 truncate text-xs">{grupo?.cursoNombre ?? `Grupo ${asig.grupoId}`}</p>
                          <p className="text-gray-500 truncate text-xs">{grupo?.codigo ?? ''}</p>
                          <p className="text-gray-400 truncate text-xs">{(docente?.usuarioNombre ?? '').split(' ')[0]} · {aula?.codigo ?? ''}</p>
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
