import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Docente } from '../../compartido/entidades/docente.entidad';
import { Alerta } from '../entidades/alerta.entidad';
import { EstadoEvaluacion, Evaluacion } from '../entidades/evaluacion.entidad';
import { ResultadoKdd } from '../entidades/resultado-kdd.entidad';
import { Respuesta } from '../entidades/respuesta.entidad';
import { KddPipelineServicio } from './kdd-pipeline.servicio';

const makeQb = () => ({
  innerJoin: jest.fn().mockReturnThis(),
  innerJoinAndSelect: jest.fn().mockReturnThis(),
  leftJoinAndSelect: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  andWhere: jest.fn().mockReturnThis(),
  getMany: jest.fn().mockResolvedValue([]),
  getCount: jest.fn().mockResolvedValue(0),
});

describe('KddPipelineServicio', () => {
  let servicio: KddPipelineServicio;
  let evalRepo: any;
  let respRepo: any;
  let resultadoRepo: any;
  let alertaRepo: any;
  let docenteRepo: any;

  beforeEach(async () => {
    evalRepo = { createQueryBuilder: jest.fn(() => makeQb()) };
    respRepo = { createQueryBuilder: jest.fn(() => makeQb()) };
    resultadoRepo = {
      find: jest.fn().mockResolvedValue([]),
      delete: jest.fn().mockResolvedValue(undefined),
      create: jest.fn(d => d),
      save: jest.fn().mockResolvedValue([]),
    };
    alertaRepo = {
      delete: jest.fn().mockResolvedValue(undefined),
      create: jest.fn(d => d),
      save: jest.fn().mockResolvedValue([]),
    };
    docenteRepo = { find: jest.fn().mockResolvedValue([]) };

    const modulo: TestingModule = await Test.createTestingModule({
      providers: [
        KddPipelineServicio,
        { provide: getRepositoryToken(Evaluacion), useValue: evalRepo },
        { provide: getRepositoryToken(Respuesta), useValue: respRepo },
        { provide: getRepositoryToken(ResultadoKdd), useValue: resultadoRepo },
        { provide: getRepositoryToken(Alerta), useValue: alertaRepo },
        { provide: getRepositoryToken(Docente), useValue: docenteRepo },
      ],
    }).compile();

    servicio = modulo.get(KddPipelineServicio);
  });

  describe('ejecutar', () => {
    it('retorna ceros cuando no hay evaluaciones completadas', async () => {
      const resultado = await servicio.ejecutar(1);
      expect(resultado.resultados).toBe(0);
      expect(resultado.alertas).toBe(0);
    });

    it('genera alertas SIN_EVALUACIONES para docentes sin resultados', async () => {
      const qb = makeQb();
      qb.getMany.mockResolvedValue([]);
      evalRepo.createQueryBuilder.mockReturnValue(qb);
      docenteRepo.find.mockResolvedValue([
        { id: 1, usuario: { nombre: 'Docente Uno' } },
      ]);

      await servicio.ejecutar(1);

      expect(alertaRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ tipo: 'SIN_EVALUACIONES' }),
      );
    });
  });

  describe('listarResultados', () => {
    it('devuelve los resultados del período', async () => {
      const mockResultado = {
        id: 1, periodoId: 1, docenteId: 2, puntuacionGlobal: 4.2,
        totalEvaluaciones: 5, detalleDimensiones: { Metodología: 4.2 }, creadoEn: new Date(),
      };
      resultadoRepo.find.mockResolvedValue([mockResultado]);

      const res = await servicio.listarResultados(1);
      expect(res).toHaveLength(1);
      expect(res[0].puntuacionGlobal).toBe(4.2);
    });
  });
});
