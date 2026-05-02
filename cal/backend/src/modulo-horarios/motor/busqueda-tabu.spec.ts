import { AlgoritmoGenetico } from './algoritmo-genetico';
import { BusquedaTabu } from './busqueda-tabu';
import { CONFIG_DEFAULT, EntradaMotor } from './tipos';

const entradaSintetica: EntradaMotor = {
  grupos: [
    { id: 1, cupoMax: 20, sesiones: 2 },
    { id: 2, cupoMax: 25, sesiones: 2 },
  ],
  docentes: [
    { id: 1, cargaMaximaHoras: 40, franjasDisponibles: [1, 2, 3, 4, 5, 6] },
    { id: 2, cargaMaximaHoras: 40, franjasDisponibles: [1, 2, 3, 4, 5, 6] },
  ],
  aulas: [
    { id: 1, capacidad: 30 },
    { id: 2, capacidad: 30 },
  ],
  franjas: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }, { id: 6 }],
};

describe('BusquedaTabu', () => {
  it('no empeora el fitness del cromosoma de entrada', () => {
    const ag = new AlgoritmoGenetico(entradaSintetica, { ...CONFIG_DEFAULT, tamPoblacion: 20, generaciones: 20 });
    const { mejor: inicial } = ag.evolucionar();

    const tabu = new BusquedaTabu(entradaSintetica, { ...CONFIG_DEFAULT, iteracionesTabu: 20 });
    const refinado = tabu.refinar(inicial);

    expect(refinado.fitness).toBeGreaterThanOrEqual(inicial.fitness);
  });

  it('el resultado tiene el mismo número de genes que la entrada', () => {
    const ag = new AlgoritmoGenetico(entradaSintetica, { ...CONFIG_DEFAULT, tamPoblacion: 10, generaciones: 5 });
    const { mejor: inicial } = ag.evolucionar();

    const tabu = new BusquedaTabu(entradaSintetica, { ...CONFIG_DEFAULT, iteracionesTabu: 10 });
    const refinado = tabu.refinar(inicial);

    expect(refinado.genes).toHaveLength(inicial.genes.length);
  });

  it('todos los genes del resultado tienen IDs válidos', () => {
    const ag = new AlgoritmoGenetico(entradaSintetica, { ...CONFIG_DEFAULT, tamPoblacion: 10, generaciones: 5 });
    const { mejor: inicial } = ag.evolucionar();

    const tabu = new BusquedaTabu(entradaSintetica, { ...CONFIG_DEFAULT, iteracionesTabu: 10 });
    const refinado = tabu.refinar(inicial);

    const docenteIds = new Set(entradaSintetica.docentes.map((d) => d.id));
    const aulaIds = new Set(entradaSintetica.aulas.map((a) => a.id));
    const franjaIds = new Set(entradaSintetica.franjas.map((f) => f.id));

    for (const gen of refinado.genes) {
      expect(docenteIds.has(gen.docenteId)).toBe(true);
      expect(aulaIds.has(gen.aulaId)).toBe(true);
      expect(franjaIds.has(gen.franjaId)).toBe(true);
    }
  });
});
