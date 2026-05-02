import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Docente } from '../../compartido/entidades/docente.entidad';
import { Alerta, NivelAlerta } from '../entidades/alerta.entidad';
import { Evaluacion } from '../entidades/evaluacion.entidad';
import { ResultadoKdd } from '../entidades/resultado-kdd.entidad';
import { DashboardServicio } from './dashboard.servicio';

const makeQb = () => ({
  innerJoin: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  andWhere: jest.fn().mockReturnThis(),
  getCount: jest.fn().mockResolvedValue(0),
});

describe('DashboardServicio', () => {
  let servicio: DashboardServicio;
  let docenteRepo: any;
  let evalRepo: any;
  let resultadoRepo: any;
  let alertaRepo: any;

  beforeEach(async () => {
    docenteRepo = { count: jest.fn().mockResolvedValue(5) };
    evalRepo = { createQueryBuilder: jest.fn(() => makeQb()) };
    resultadoRepo = { find: jest.fn().mockResolvedValue([]) };
    alertaRepo = { count: jest.fn().mockResolvedValue(0) };

    const modulo: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardServicio,
        { provide: getRepositoryToken(Docente), useValue: docenteRepo },
        { provide: getRepositoryToken(Evaluacion), useValue: evalRepo },
        { provide: getRepositoryToken(ResultadoKdd), useValue: resultadoRepo },
        { provide: getRepositoryToken(Alerta), useValue: alertaRepo },
      ],
    }).compile();

    servicio = modulo.get(DashboardServicio);
  });

  describe('resumen', () => {
    it('devuelve promedioGlobal 0 cuando no hay resultados', async () => {
      const res = await servicio.resumen(1);
      expect(res.promedioGlobal).toBe(0);
      expect(res.totalDocentes).toBe(5);
    });

    it('calcula promedio global correctamente', async () => {
      resultadoRepo.find.mockResolvedValue([
        { puntuacionGlobal: 4.0 }, { puntuacionGlobal: 3.0 },
      ]);

      const res = await servicio.resumen(1);
      expect(res.promedioGlobal).toBe(3.5);
    });

    it('incluye 4 rangos de distribución', async () => {
      const res = await servicio.resumen(1);
      expect(res.distribucionPuntuaciones).toHaveLength(4);
    });
  });
});
