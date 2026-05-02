export interface Asignacion {
  grupoId: number;
  docenteId: number;
  aulaId: number;
  franjaId: number;
}

export interface InfoGrupo {
  id: number;
  cupoMax: number;
  sesiones: number;
}

export interface InfoDocente {
  id: number;
  cargaMaximaHoras: number;
  franjasDisponibles: number[];
}

export interface InfoAula {
  id: number;
  capacidad: number;
}

export interface InfoFranja {
  id: number;
}

export interface EntradaMotor {
  grupos: InfoGrupo[];
  docentes: InfoDocente[];
  aulas: InfoAula[];
  franjas: InfoFranja[];
}

export interface Cromosoma {
  genes: Asignacion[];
  fitness: number;
}

export interface ConfiguracionMotor {
  tamPoblacion: number;
  generaciones: number;
  tasaMutacion: number;
  tasaCruce: number;
  iteracionesTabu: number;
  tamListaTabu: number;
}

export const CONFIG_DEFAULT: ConfiguracionMotor = {
  tamPoblacion: 50,
  generaciones: 100,
  tasaMutacion: 0.1,
  tasaCruce: 0.8,
  iteracionesTabu: 50,
  tamListaTabu: 20,
};

export interface ResultadoMotor {
  asignaciones: Asignacion[];
  fitness: number;
  generaciones: number;
  tiempoMs: number;
}
