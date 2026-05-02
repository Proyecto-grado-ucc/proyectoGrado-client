import { calcularFitness } from './fitness';
import { ConfiguracionMotor, Cromosoma, EntradaMotor } from './tipos';

type TipoMovimiento = 'docente' | 'aula' | 'franja';

interface Movimiento {
  idx: number;
  tipo: TipoMovimiento;
  valorAnterior: number;
}

function elem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export class BusquedaTabu {
  private listaTabu: Movimiento[] = [];

  constructor(
    private readonly entrada: EntradaMotor,
    private readonly config: ConfiguracionMotor,
  ) {}

  refinar(inicial: Cromosoma): Cromosoma {
    let actual: Cromosoma = { genes: inicial.genes.map((g) => ({ ...g })), fitness: inicial.fitness };
    let mejor = actual;

    for (let iter = 0; iter < this.config.iteracionesTabu; iter++) {
      const vecinos = this.generarVecinos(actual);
      const candidatos = vecinos.filter(({ mov }) => !this.esTabu(mov));
      if (!candidatos.length) break;

      const mejorVecino = candidatos.reduce((m, v) => (v.crom.fitness > m.crom.fitness ? v : m));
      actual = mejorVecino.crom;

      this.listaTabu.push(mejorVecino.mov);
      if (this.listaTabu.length > this.config.tamListaTabu) this.listaTabu.shift();

      if (actual.fitness > mejor.fitness) mejor = actual;
    }

    return mejor;
  }

  private generarVecinos(c: Cromosoma): { crom: Cromosoma; mov: Movimiento }[] {
    const vecinos: { crom: Cromosoma; mov: Movimiento }[] = [];
    const muestra = Math.min(c.genes.length, 8);

    for (let i = 0; i < muestra; i++) {
      const idx = Math.floor(Math.random() * c.genes.length);
      const tipos: TipoMovimiento[] = ['docente', 'aula', 'franja'];

      for (const tipo of tipos) {
        const genes = c.genes.map((g) => ({ ...g }));
        let valorAnterior: number;

        if (tipo === 'docente') {
          valorAnterior = genes[idx].docenteId;
          genes[idx].docenteId = elem(this.entrada.docentes).id;
        } else if (tipo === 'aula') {
          valorAnterior = genes[idx].aulaId;
          genes[idx].aulaId = elem(this.entrada.aulas).id;
        } else {
          valorAnterior = genes[idx].franjaId;
          genes[idx].franjaId = elem(this.entrada.franjas).id;
        }

        vecinos.push({
          crom: { genes, fitness: calcularFitness(genes, this.entrada) },
          mov: { idx, tipo, valorAnterior },
        });
      }
    }

    return vecinos;
  }

  private esTabu(mov: Movimiento): boolean {
    return this.listaTabu.some((t) => t.idx === mov.idx && t.tipo === mov.tipo && t.valorAnterior === mov.valorAnterior);
  }
}
