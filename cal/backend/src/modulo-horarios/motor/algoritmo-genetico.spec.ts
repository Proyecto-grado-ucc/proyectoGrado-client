import { AlgoritmoGenetico } from './algoritmo-genetico';
import { calcularFitness } from './fitness';
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

describe('AlgoritmoGenetico', () => {
  it('produce el número correcto de genes (suma de sesiones)', () => {
    const ag = new AlgoritmoGenetico(entradaSintetica, { ...CONFIG_DEFAULT, tamPoblacion: 10, generaciones: 5 });
    const { mejor } = ag.evolucionar();
    const sesionesTotales = entradaSintetica.grupos.reduce((s, g) => s + g.sesiones, 0);
    expect(mejor.genes).toHaveLength(sesionesTotales);
  });

  it('todos los genes referencian IDs válidos', () => {
    const ag = new AlgoritmoGenetico(entradaSintetica, { ...CONFIG_DEFAULT, tamPoblacion: 10, generaciones: 5 });
    const { mejor } = ag.evolucionar();
    const grupoIds = new Set(entradaSintetica.grupos.map((g) => g.id));
    const docenteIds = new Set(entradaSintetica.docentes.map((d) => d.id));
    const aulaIds = new Set(entradaSintetica.aulas.map((a) => a.id));
    const franjaIds = new Set(entradaSintetica.franjas.map((f) => f.id));

    for (const gen of mejor.genes) {
      expect(grupoIds.has(gen.grupoId)).toBe(true);
      expect(docenteIds.has(gen.docenteId)).toBe(true);
      expect(aulaIds.has(gen.aulaId)).toBe(true);
      expect(franjaIds.has(gen.franjaId)).toBe(true);
    }
  });

  it('el fitness del resultado es mayor o igual al fitness inicial promedio después de más generaciones', () => {
    const pocasGen = new AlgoritmoGenetico(entradaSintetica, { ...CONFIG_DEFAULT, tamPoblacion: 20, generaciones: 1 });
    const muchasGen = new AlgoritmoGenetico(entradaSintetica, { ...CONFIG_DEFAULT, tamPoblacion: 20, generaciones: 50 });
    const { mejor: resultPoco } = pocasGen.evolucionar();
    const { mejor: resultMucho } = muchasGen.evolucionar();
    expect(resultMucho.fitness).toBeGreaterThanOrEqual(resultPoco.fitness);
  });

  it('el fitness coincide con calcularFitness aplicado sobre los genes', () => {
    const ag = new AlgoritmoGenetico(entradaSintetica, { ...CONFIG_DEFAULT, tamPoblacion: 10, generaciones: 5 });
    const { mejor } = ag.evolucionar();
    expect(mejor.fitness).toBe(calcularFitness(mejor.genes, entradaSintetica));
  });
});
