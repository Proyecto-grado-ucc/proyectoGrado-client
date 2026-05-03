import { useQuery } from '@tanstack/react-query';
import { clienteApi } from '../../../compartido/api';
import { useAuthStore } from '../../../seguridad/store';

interface Estudiante { id: number; usuarioEmail: string; grupoId: number; }
interface Evaluacion { id: number; docenteEvaluadoId: number; docenteEvaluadoNombre: string; formularioTitulo: string; formularioId: number; estado: string; grupoId?: number; creadoEn: string; }
interface Horario { id: number; periodoNombre: string; asignaciones: { grupoId: number; docenteId: number; aulaId: number; franjaId: number; }[]; }
interface Franja { id: number; diaSemana: string; horaInicio: string; horaFin: string; }
interface Grupo { id: number; codigo: string; cursoNombre: string; }
interface Docente { id: number; usuarioNombre: string; usuarioEmail: string; }
interface Aula { id: number; codigo: string; }

const fetchAll = async <T extends object>(ruta: string): Promise<T[]> => {
  const { data } = await clienteApi.get(ruta, { params: { page: 1, size: 200 } });
  return (data.items ?? data) as T[];
};

const DIAS: Record<string, string> = { LUN: 'Lun', MAR: 'Mar', MIE: 'Mie', JUE: 'Jue', VIE: 'Vie', SAB: 'Sab' };

export default function DashboardEstudiante() {
  const email = useAuthStore(s => s.usuario?.email ?? '');

  const { data: estudiantes } = useQuery({ queryKey: ['estudiantes-de'], queryFn: () => fetchAll<Estudiante>('/estudiantes') });
  const miEstudiante = estudiantes?.find(e => e.usuarioEmail === email);
  const miGrupoId = miEstudiante?.grupoId;

  const { data: evaluacionesTodas = [] } = useQuery({ 
    queryKey: ['evaluaciones-de'], 
    queryFn: () => fetchAll<Evaluacion>('/evaluaciones') 
  });
  
  const { data: horarios } = useQuery({ queryKey: ['horarios-de'], queryFn: () => fetchAll<Horario>('/horarios') });
  const horarioActivoResumen = horarios?.[0];

  const { data: miHorario } = useQuery<Horario | null>({ 
    queryKey: ['horario-detalle-de', horarioActivoResumen?.id], 
    queryFn: async () => {
      if (!horarioActivoResumen) return null;
      const { data } = await clienteApi.get(`/horarios/${horarioActivoResumen.id}`);
      return data as Horario;
    },
    enabled: !!horarioActivoResumen
  });

  const { data: franjas } = useQuery({ queryKey: ['franjas-de'], queryFn: () => fetchAll<Franja>('/franjas-horarias') });
  const { data: grupos } = useQuery({ queryKey: ['grupos-de'], queryFn: () => fetchAll<Grupo>('/grupos') });
  const { data: docentes } = useQuery({ queryKey: ['docentes-de'], queryFn: () => fetchAll<Docente>('/docentes') });
  const { data: aulas } = useQuery({ queryKey: ['aulas-de'], queryFn: () => fetchAll<Aula>('/aulas') });

  const misAsignaciones = miHorario?.asignaciones?.filter(a => a.grupoId === miGrupoId) ?? [];
  const docentesDeMiGrupo = new Set(misAsignaciones.map(a => a.docenteId));

  const misEvaluaciones = evaluacionesTodas.filter(e => docentesDeMiGrupo.has(e.docenteEvaluadoId));
  const pendientes = misEvaluaciones.filter(e => e.estado === 'PENDIENTE');

  const miGrupo = grupos?.find(g => g.id === miGrupoId);

  const proximasClases = misAsignaciones.slice(0, 4).map(a => {
    const franja = franjas?.find(f => f.id === a.franjaId);
    const grupo = grupos?.find(g => g.id === a.grupoId);
    const docente = docentes?.find(d => d.id === a.docenteId);
    const aula = aulas?.find(au => au.id === a.aulaId);
    return { franja, grupo, docente, aula };
  });

  return (
    <div className="p-8 min-h-full bg-gray-50">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Mi Dashboard</h1>
        <p className="text-gray-500 text-sm mt-0.5">Bienvenido al portal estudiantil — {email}</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500 mb-1">Mi Grupo</p>
          <p className="text-xl font-bold text-gray-900">{miGrupo?.cursoNombre ?? '-'}</p>
          <p className="text-xs text-gray-400 mt-1">{miGrupo?.codigo ?? 'No asignado'}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500 mb-1">Evaluaciones pendientes</p>
          <p className="text-3xl font-bold text-orange-500">{pendientes.length}</p>
          <div className="mt-2 h-1 bg-orange-400 rounded-full w-1/3" />
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500 mb-1">Clases semanales</p>
          <p className="text-3xl font-bold text-gray-900">{misAsignaciones.length ?? 0}</p>
          <div className="mt-2 h-1 bg-blue-500 rounded-full w-2/3" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Próximas clases — {miHorario?.periodoNombre ?? 'Sin horario'}</h2>
          {proximasClases.length === 0 ? (
            <p className="text-sm text-gray-400">Sin clases disponibles.</p>
          ) : (
            <div className="space-y-2">
              {proximasClases.map((c, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50">
                  <div>
                    <p className="text-xs font-medium text-gray-800">{c.grupo?.cursoNombre ?? 'Grupo'} — {c.grupo?.codigo ?? ''}</p>
                    <p className="text-xs text-gray-400">{DIAS[c.franja?.diaSemana ?? ''] ?? ''} {c.franja?.horaInicio?.substring(0,5)}-{c.franja?.horaFin?.substring(0,5)} | {c.docente?.usuarioNombre?.split(' ')[0] ?? ''}</p>
                  </div>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{c.aula?.codigo ?? '-'}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Evaluaciones pendientes</h2>
          {pendientes.length === 0 ? (
            <p className="text-sm text-gray-400">No tienes evaluaciones pendientes. ¡Bien hecho!</p>
          ) : (
            <div className="space-y-3">
              {pendientes.slice(0, 3).map(e => (
                <div key={e.id} className="border border-orange-200 bg-orange-50 rounded-xl p-4">
                  <p className="text-sm font-medium text-gray-800">{e.formularioTitulo}</p>
                  <p className="text-xs text-gray-500 mt-1">Docente: {e.docenteEvaluadoNombre}</p>
                  <a href="/estudiante/formularios" className="inline-block mt-3 text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700">
                    Ir a evaluar
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
