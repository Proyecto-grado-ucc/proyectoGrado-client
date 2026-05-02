import { useQuery } from '@tanstack/react-query';
import { clienteApi } from '../../../compartido/api';
import { useAuthStore } from '../../../seguridad/store';

interface Evaluacion { id: number; docenteEvaluadoId: number; docenteEvaluadoNombre: string; formularioTitulo: string; formularioId: number; estado: string; creadoEn: string; }
interface Horario { id: number; periodoNombre: string; asignaciones: { grupoId: number; docenteId: number; aulaId: number; franjaId: number; }[]; }
interface Franja { id: number; diaSemana: string; horaInicio: string; horaFin: string; }
interface Grupo { id: number; codigo: string; cursoNombre: string; }
interface Docente { id: number; usuarioNombre: string; usuarioEmail: string; }
interface Aula { id: number; codigo: string; }
interface Periodo { id: number; nombre: string; }

const fetchAll = async <T extends object>(ruta: string): Promise<T[]> => {
  const { data } = await clienteApi.get(ruta, { params: { page: 1, size: 200 } });
  return (data.items ?? data) as T[];
};

const DIAS: Record<string, string> = { LUN: 'Lun', MAR: 'Mar', MIE: 'Mie', JUE: 'Jue', VIE: 'Vie', SAB: 'Sab' };

export default function DashboardEstudiante() {
  const email = useAuthStore(s => s.usuario?.email ?? '');

  const { data: evaluaciones } = useQuery({ queryKey: ['ev-est'], queryFn: () => fetchAll<Evaluacion>('/evaluaciones') });
  const { data: horarios } = useQuery({ queryKey: ['hor-est'], queryFn: () => fetchAll<Horario>('/horarios') });
  const { data: franjas } = useQuery({ queryKey: ['fran-est'], queryFn: () => fetchAll<Franja>('/franjas-horarias') });
  const { data: grupos } = useQuery({ queryKey: ['grup-est'], queryFn: () => fetchAll<Grupo>('/grupos') });
  const { data: docentes } = useQuery({ queryKey: ['doc-est'], queryFn: () => fetchAll<Docente>('/docentes') });
  const { data: aulas } = useQuery({ queryKey: ['aul-est'], queryFn: () => fetchAll<Aula>('/aulas') });
  const { data: periodos } = useQuery({ queryKey: ['per-est'], queryFn: () => fetchAll<Periodo>('/periodos') });

  // Evaluaciones pendientes (todas las asignadas - en una implementacion completa se filtraria por grupo del estudiante)
  const pendientes = evaluaciones?.filter(e => e.estado === 'PENDIENTE') ?? [];
  const horarioActivo = horarios?.[0];
  const periodoActivo = periodos?.[0];

  // Proximas clases (primeras 4 asignaciones del horario activo como muestra)
  const proximasClases = (horarioActivo?.asignaciones ?? []).slice(0, 4).map(a => {
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
          <p className="text-xs text-gray-500 mb-1">Periodo activo</p>
          <p className="text-xl font-bold text-gray-900">{periodoActivo?.nombre ?? '-'}</p>
          <p className="text-xs text-gray-400 mt-1">Ciclo academico en curso</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500 mb-1">Evaluaciones pendientes</p>
          <p className="text-3xl font-bold text-orange-500">{pendientes.length}</p>
          <div className="mt-2 h-1 bg-orange-400 rounded-full w-1/3" />
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500 mb-1">Clases en horario</p>
          <p className="text-3xl font-bold text-gray-900">{horarioActivo?.asignaciones.length ?? 0}</p>
          <div className="mt-2 h-1 bg-blue-500 rounded-full w-2/3" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Proximas clases — {horarioActivo?.periodoNombre ?? 'Sin horario'}</h2>
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
            <p className="text-sm text-gray-400">No tienes evaluaciones pendientes. Bien hecho!</p>
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
