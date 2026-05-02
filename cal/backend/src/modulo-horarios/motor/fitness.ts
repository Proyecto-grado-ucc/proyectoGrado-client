import { Asignacion, EntradaMotor } from './tipos';

export function calcularFitness(genes: Asignacion[], entrada: EntradaMotor): number {
  let penalizacion = 0;

  const aulaMap = new Map(entrada.aulas.map((a) => [a.id, a]));
  const grupoMap = new Map(entrada.grupos.map((g) => [g.id, g]));
  const docenteMap = new Map(entrada.docentes.map((d) => [d.id, d]));

  for (let i = 0; i < genes.length; i++) {
    const gen = genes[i];

    const docente = docenteMap.get(gen.docenteId);
    if (docente && docente.franjasDisponibles.length > 0 && !docente.franjasDisponibles.includes(gen.franjaId)) {
      penalizacion += 50;
    }

    const aula = aulaMap.get(gen.aulaId);
    const grupo = grupoMap.get(gen.grupoId);
    if (aula && grupo && aula.capacidad < grupo.cupoMax) {
      penalizacion += 30;
    }

    for (let j = i + 1; j < genes.length; j++) {
      const otro = genes[j];
      if (gen.franjaId === otro.franjaId) {
        if (gen.docenteId === otro.docenteId) penalizacion += 100;
        if (gen.aulaId === otro.aulaId) penalizacion += 100;
      }
    }
  }

  const docenteHoras = new Map<number, number>();
  for (const gen of genes) {
    docenteHoras.set(gen.docenteId, (docenteHoras.get(gen.docenteId) ?? 0) + 1);
  }
  for (const [docenteId, horas] of docenteHoras) {
    const docente = docenteMap.get(docenteId);
    if (docente && horas > docente.cargaMaximaHoras) {
      penalizacion += (horas - docente.cargaMaximaHoras) * 20;
    }
  }

  return -penalizacion;
}
