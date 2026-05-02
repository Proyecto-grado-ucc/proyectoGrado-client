import { calcularFitness } from './fitness';
import { Asignacion, ConfiguracionMotor, Cromosoma, EntradaMotor } from './tipos';

function elem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function crearGenesAleatorios(entrada: EntradaMotor): Asignacion[] {
  const genes: Asignacion[] = [];
  for (const grupo of entrada.grupos) {
    for (let s = 0; s < grupo.sesiones; s++) {
      genes.push({
        grupoId: grupo.id,
        docenteId: elem(entrada.docentes).id,
        aulaId: elem(entrada.aulas).id,
        franjaId: elem(entrada.franjas).id,
      });
    }
  }
  return genes;
}

export class AlgoritmoGenetico {
  private poblacion: Cromosoma[] = [];

  constructor(
    private readonly entrada: EntradaMotor,
    private readonly config: ConfiguracionMotor,
  ) {}

  private inicializar(): void {
    this.poblacion = Array.from({ length: this.config.tamPoblacion }, () => {
      const genes = crearGenesAleatorios(this.entrada);
      return { genes, fitness: calcularFitness(genes, this.entrada) };
    });
  }

  private seleccionTorneo(k = 3): Cromosoma {
    const candidatos = Array.from(
      { length: k },
      () => this.poblacion[Math.floor(Math.random() * this.poblacion.length)],
    );
    return candidatos.reduce((mejor, c) => (c.fitness > mejor.fitness ? c : mejor));
  }

  private cruzar(p1: Cromosoma, p2: Cromosoma): Cromosoma {
    const punto = Math.floor(Math.random() * p1.genes.length);
    const genes = [...p1.genes.slice(0, punto), ...p2.genes.slice(punto)];
    return { genes, fitness: calcularFitness(genes, this.entrada) };
  }

  private mutar(c: Cromosoma): Cromosoma {
    if (Math.random() > this.config.tasaMutacion) return c;
    const genes = c.genes.map((g) => ({ ...g }));
    const idx = Math.floor(Math.random() * genes.length);
    const tipo = Math.floor(Math.random() * 3);
    if (tipo === 0) genes[idx].docenteId = elem(this.entrada.docentes).id;
    else if (tipo === 1) genes[idx].aulaId = elem(this.entrada.aulas).id;
    else genes[idx].franjaId = elem(this.entrada.franjas).id;
    return { genes, fitness: calcularFitness(genes, this.entrada) };
  }

  evolucionar(): { mejor: Cromosoma; generaciones: number } {
    this.inicializar();
    let mejor = this.poblacion.reduce((m, c) => (c.fitness > m.fitness ? c : m));

    for (let gen = 0; gen < this.config.generaciones; gen++) {
      const nueva: Cromosoma[] = [mejor];

      while (nueva.length < this.config.tamPoblacion) {
        const p1 = this.seleccionTorneo();
        const p2 = this.seleccionTorneo();
        const hijo = Math.random() < this.config.tasaCruce ? this.cruzar(p1, p2) : p1;
        nueva.push(this.mutar(hijo));
      }

      this.poblacion = nueva;
      const candidato = this.poblacion.reduce((m, c) => (c.fitness > m.fitness ? c : m));
      if (candidato.fitness > mejor.fitness) mejor = candidato;
    }

    return { mejor, generaciones: this.config.generaciones };
  }
}
