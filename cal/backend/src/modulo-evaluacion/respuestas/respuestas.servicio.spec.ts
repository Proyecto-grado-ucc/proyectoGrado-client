import { NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { Evaluacion, EstadoEvaluacion } from '../entidades/evaluacion.entidad';
import { Pregunta, TipoPregunta } from '../entidades/pregunta.entidad';
import { Respuesta } from '../entidades/respuesta.entidad';
import { RespuestasServicio } from './respuestas.servicio';

const mockEval = (): Evaluacion => ({ id: 1, formulario: { id: 1, titulo: 'E' } as any, docenteEvaluado: { id: 1 } as any, evaluadorId: null, estado: EstadoEvaluacion.EnProgreso, creadoEn: new Date(), respuestas: [] }) as unknown as Evaluacion;
const mockPregunta = (): Pregunta => ({ id: 1, texto: '¿Texto?', tipo: TipoPregunta.Escala, ordenIdx: 0, dimension: { id: 1, nombre: 'M' } as any }) as unknown as Pregunta;
const mockRespuesta = (): Respuesta => ({ id: 1, evaluacion: mockEval(), pregunta: mockPregunta(), valorNumerico: 4.5, valorTexto: null }) as unknown as Respuesta;

describe('RespuestasServicio', () => {
  let servicio: RespuestasServicio;
  let respuestaRepo: { findOne: jest.Mock; findAndCount: jest.Mock; create: jest.Mock; save: jest.Mock; remove: jest.Mock };
  let evaluacionRepo: { findOne: jest.Mock };
  let preguntaRepo: { findOne: jest.Mock };

  beforeEach(async () => {
    respuestaRepo = { findOne: jest.fn(), findAndCount: jest.fn(), create: jest.fn(), save: jest.fn(), remove: jest.fn() };
    evaluacionRepo = { findOne: jest.fn() };
    preguntaRepo = { findOne: jest.fn() };

    const modulo: TestingModule = await Test.createTestingModule({
      providers: [
        RespuestasServicio,
        { provide: getRepositoryToken(Respuesta), useValue: respuestaRepo },
        { provide: getRepositoryToken(Evaluacion), useValue: evaluacionRepo },
        { provide: getRepositoryToken(Pregunta), useValue: preguntaRepo },
      ],
    }).compile();
    servicio = modulo.get(RespuestasServicio);
  });

  it('crear lanza NotFoundException si la evaluación no existe', async () => {
    evaluacionRepo.findOne.mockResolvedValue(null);
    await expect(servicio.crear({ evaluacionId: 99, preguntaId: 1, valorNumerico: 4 })).rejects.toThrow(NotFoundException);
  });

  it('crear lanza NotFoundException si la pregunta no existe', async () => {
    evaluacionRepo.findOne.mockResolvedValue(mockEval());
    preguntaRepo.findOne.mockResolvedValue(null);
    await expect(servicio.crear({ evaluacionId: 1, preguntaId: 99, valorNumerico: 4 })).rejects.toThrow(NotFoundException);
  });

  it('crear devuelve la respuesta', async () => {
    evaluacionRepo.findOne.mockResolvedValue(mockEval());
    preguntaRepo.findOne.mockResolvedValue(mockPregunta());
    const r = mockRespuesta();
    respuestaRepo.create.mockReturnValue(r);
    respuestaRepo.save.mockResolvedValue(r);
    const result = await servicio.crear({ evaluacionId: 1, preguntaId: 1, valorNumerico: 4.5 });
    expect(result.valorNumerico).toBe(4.5);
  });

  it('listarPorEvaluacion lanza NotFoundException si la evaluación no existe', async () => {
    evaluacionRepo.findOne.mockResolvedValue(null);
    await expect(servicio.listarPorEvaluacion(99, 1, 20)).rejects.toThrow(NotFoundException);
  });

  it('buscarPorId lanza NotFoundException si no existe', async () => {
    respuestaRepo.findOne.mockResolvedValue(null);
    await expect(servicio.buscarPorId(99)).rejects.toThrow(NotFoundException);
  });

  it('eliminar funciona correctamente', async () => {
    respuestaRepo.findOne.mockResolvedValue(mockRespuesta());
    respuestaRepo.remove.mockResolvedValue(undefined);
    await expect(servicio.eliminar(1)).resolves.not.toThrow();
  });
});
