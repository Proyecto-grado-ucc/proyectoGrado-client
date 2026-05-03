import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
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

  const queryClient = useQueryClient();
  const [codigoIngresado, setCodigoIngresado] = useState('');
  const [errorMatricula, setErrorMatricula] = useState('');
  const [mostrarModalBaja, setMostrarModalBaja] = useState(false);
  const [confirmacionBaja, setConfirmacionBaja] = useState('');

  const { data: estudiantes } = useQuery({ queryKey: ['estudiantes-he'], queryFn: () => fetchAll<Estudiante>('/estudiantes') });
  const miEstudiante = estudiantes?.find(e => e.usuarioEmail === email);
  const miGrupoId = miEstudiante?.grupoId;

  const mutMatricular = useMutation({
    mutationFn: (codigoAcceso: string) => clienteApi.post('/estudiantes/matricular', { codigoAcceso }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['estudiantes-he'] });
      setErrorMatricula('');
    },
    onError: (e: any) => {
      setErrorMatricula(e?.response?.data?.message ?? 'Error al matricularse');
    }
  });

  const mutDesmatricular = useMutation({
    mutationFn: () => clienteApi.post('/estudiantes/desmatricular'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['estudiantes-he'] });
      setMostrarModalBaja(false);
      setConfirmacionBaja('');
    }
  });

  const { data: horarios } = useQuery({ queryKey: ['horarios-he'], queryFn: () => fetchAll<Horario>('/horarios?archivado=false') });
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

  const ModalBaja = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center">
        <h3 className="text-lg font-bold text-gray-900 mb-2">¿Seguro que deseas darte de baja?</h3>
        <p className="text-sm text-gray-500 mb-4">
          Perderás acceso a tu grupo actual y a tus evaluaciones docentes. Deberás volver a ingresar un código de acceso para reingresar.
        </p>
        <p className="text-xs text-gray-600 font-semibold mb-2">
          Escribe "<span className="text-red-600 select-all">Confirmo darme de baja</span>" para continuar:
        </p>
        <input
          type="text"
          value={confirmacionBaja}
          onChange={e => setConfirmacionBaja(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 text-center mb-4"
          placeholder="Confirmo darme de baja"
        />
        <div className="flex gap-2 justify-center">
          <button onClick={() => { setMostrarModalBaja(false); setConfirmacionBaja(''); }} className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">
            Cancelar
          </button>
          <button
            onClick={() => mutDesmatricular.mutate()}
            disabled={confirmacionBaja.trim().toLowerCase() !== 'confirmo darme de baja' || mutDesmatricular.isPending}
            className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            {mutDesmatricular.isPending ? 'Procesando...' : 'Darme de baja'}
          </button>
        </div>
      </div>
    </div>
  );

  if (!miGrupoId) {
    return (
      <div className="p-8 flex items-center justify-center min-h-full bg-gray-50">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 text-center border border-gray-100">
          <div className="mx-auto w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-6">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Ingresa a tu clase</h2>
          <p className="text-gray-500 mb-6 text-sm">Digita el código de acceso proporcionado por la academia para ver tu horario y docentes asignados.</p>
          
          <form onSubmit={(e) => { e.preventDefault(); mutMatricular.mutate(codigoIngresado); }}>
            <div className="mb-4 text-left">
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">Código de Acceso</label>
              <input 
                type="text" 
                placeholder="Ej. B1-X7K9" 
                value={codigoIngresado}
                onChange={e => setCodigoIngresado(e.target.value.toUpperCase())}
                className="w-full text-center text-lg tracking-widest font-mono bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors uppercase"
                disabled={mutMatricular.isPending}
                required
              />
            </div>
            {errorMatricula && <p className="text-xs text-red-600 bg-red-50 p-3 rounded-lg mb-4 text-left">{errorMatricula}</p>}
            <button 
              type="submit" 
              disabled={mutMatricular.isPending || !codigoIngresado}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl shadow-md shadow-blue-500/20 transition-all disabled:opacity-50 flex justify-center items-center gap-2"
            >
              {mutMatricular.isPending ? 'Validando...' : 'Matricularme'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (!horarioDetalle) {
    return (
      <div className="p-8 flex items-center justify-center min-h-full flex-col">
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400 mb-4 shadow-sm w-full max-w-md">
          <p className="text-base font-medium text-gray-600 mb-1">Sin horario disponible</p>
          <p className="text-sm">El administrador aún no ha publicado el horario.</p>
        </div>
        <button onClick={() => setMostrarModalBaja(true)} className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 text-sm rounded-xl font-medium transition-colors border border-red-100">
          Darme de baja del grupo actual
        </button>
        {mostrarModalBaja && <ModalBaja />}
      </div>
    );
  }

  const asignaciones = horarioDetalle.asignaciones.filter(a => a.grupoId === miGrupoId) ?? [];

  if (asignaciones.length === 0) {
    return (
      <div className="p-8 flex items-center justify-center min-h-full flex-col">
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400 mb-4 shadow-sm w-full max-w-md">
          <p className="text-base font-medium text-gray-600 mb-1">Sin clases asignadas</p>
          <p className="text-sm">No tienes clases programadas en este horario.</p>
        </div>
        <button onClick={() => setMostrarModalBaja(true)} className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 text-sm rounded-xl font-medium transition-colors border border-red-100">
          Darme de baja del grupo actual
        </button>
        {mostrarModalBaja && <ModalBaja />}
      </div>
    );
  }

  const diasPresentes = [...new Set(
    asignaciones.map(a => franjas?.find(f => f.id === a.franjaId)?.diaSemana ?? '').filter(Boolean)
  )].sort((a, b) => ORDEN_DIAS.indexOf(a) - ORDEN_DIAS.indexOf(b));

  const getHoraParaSort = (bloque: number) => {
    const f = franjas?.find(x => x.bloqueIdx === bloque);
    return f ? f.horaInicio : '23:59:59';
  };

  const bloquesUnicos = [...new Set(
    asignaciones.map(a => franjas?.find(f => f.id === a.franjaId)?.bloqueIdx ?? -1).filter(b => b >= 0)
  )].sort((a, b) => getHoraParaSort(a).localeCompare(getHoraParaSort(b)));

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
          <button onClick={() => setMostrarModalBaja(true)} className="px-3 py-1 bg-red-50 text-red-600 hover:bg-red-100 text-xs rounded-full font-medium transition-colors">
            Darme de baja
          </button>
        </div>
      </div>

      {mostrarModalBaja && <ModalBaja />}

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
