import { useQuery } from '@tanstack/react-query';
import { clienteApi } from '../../../compartido/api';

interface Asignacion { grupoId: number; docenteId: number; aulaId: number; franjaId: number; }
interface Horario { id: number; periodoNombre: string; asignaciones: Asignacion[]; }
interface Franja { id: number; diaSemana: string; horaInicio: string; horaFin: string; bloqueIdx: number; }
interface Grupo { id: number; codigo: string; cursoNombre: string; }
interface Docente { id: number; usuarioNombre: string; }
interface Aula { id: number; codigo: string; }

const fetchAll = async <T extends object>(ruta: string): Promise<T[]> => {
  const { data } = await clienteApi.get(ruta, { params: { page: 1, size: 200 } });
  return (data.items ?? data) as T[];
};

const DIAS: Record<string, string> = { LUN: 'Lunes', MAR: 'Martes', MIE: 'Miercoles', JUE: 'Jueves', VIE: 'Viernes', SAB: 'Sabado' };
const ORDEN_DIAS = ['LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB'];

export default function HorarioEstudiante() {
  const { data: horarios } = useQuery({ queryKey: ['horarios-est'], queryFn: () => fetchAll<Horario>('/horarios') });
  const { data: franjas } = useQuery({ queryKey: ['franjas-est'], queryFn: () => fetchAll<Franja>('/franjas-horarias') });
  const { data: grupos } = useQuery({ queryKey: ['grupos-est'], queryFn: () => fetchAll<Grupo>('/grupos') });
  const { data: docentes } = useQuery({ queryKey: ['docentes-est'], queryFn: () => fetchAll<Docente>('/docentes') });
  const { data: aulas } = useQuery({ queryKey: ['aulas-est'], queryFn: () => fetchAll<Aula>('/aulas') });

  const horarioActivo = horarios?.[0];
  const asignaciones = horarioActivo?.asignaciones ?? [];

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
            {horarioActivo ? `${horarioActivo.periodoNombre} — ${asignaciones.length} sesiones` : 'Sin horario disponible'}
          </p>
        </div>
        {horarioActivo && <span className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">Publicado</span>}
      </div>

      {!horarioActivo ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400">
          <p className="text-base font-medium text-gray-600 mb-1">Sin horario disponible</p>
          <p className="text-sm">El administrador debe generar y publicar el horario.</p>
        </div>
      ) : (
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
                            <p className="text-blue-500 truncate text-xs">{(docente?.usuarioNombre ?? '').split(' ')[0]} - {aula?.codigo ?? ''}</p>
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
      )}
    </div>
  );
}
