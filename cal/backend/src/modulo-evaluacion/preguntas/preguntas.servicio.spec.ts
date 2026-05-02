import { NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { Dimension } from '../entidades/dimension.entidad';
import { Pregunta, TipoPregunta } from '../entidades/pregunta.entidad';
import { PreguntasServicio } from './preguntas.servicio';

const mockDimension = (): Dimension => ({ id: 1, nombre: 'Metodología', descripcion: null, peso: 1.0, formulario: { id: 1 } as any, preguntas: [] }) as unknown as Dimension;
const mockPregunta = (): Pregunta => ({ id: 1, texto: '¿Cómo evalúa...?', tipo: TipoPregunta.Escala, ordenIdx: 0, dimension: mockDimension() }) as unknown as Pregunta;

describe('PreguntasServicio', () => {
  let servicio: PreguntasServicio;
  let preguntaRepo: { findOne: jest.Mock; findAndCount: jest.Mock; create: jest.Mock; save: jest.Mock; remove: jest.Mock };
  let dimensionRepo: { findOne: jest.Mock };

  beforeEach(async () => {
    preguntaRepo = { findOne: jest.fn(), findAndCount: jest.fn(), create: jest.fn(), save: jest.fn(), remove: jest.fn() };
    dimensionRepo = { findOne: jest.fn() };

    const modulo: TestingModule = await Test.createTestingModule({
      providers: [
        PreguntasServicio,
        { provide: getRepositoryToken(Pregunta), useValue: preguntaRepo },
        { provide: getRepositoryToken(Dimension), useValue: dimensionRepo },
      ],
    }).compile();
    servicio = modulo.get(PreguntasServicio);
  });

  it('crear lanza NotFoundException si la dimensión no existe', async () => {
    dimensionRepo.findOne.mockResolvedValue(null);
    await expect(servicio.crear({ texto: 'Test', tipo: TipoPregunta.Escala, dimensionId: 99 })).rejects.toThrow(NotFoundException);
  });

  it('crear devuelve la pregunta', async () => {
    dimensionRepo.findOne.mockResolvedValue(mockDimension());
    const p = mockPregunta();
    preguntaRepo.create.mockReturnValue(p);
    preguntaRepo.save.mockResolvedValue(p);
    const r = await servicio.crear({ texto: '¿Cómo evalúa...?', tipo: TipoPregunta.Escala, dimensionId: 1 });
    expect(r.texto).toBe('¿Cómo evalúa...?');
  });

  it('buscarPorId lanza NotFoundException si no existe', async () => {
    preguntaRepo.findOne.mockResolvedValue(null);
    await expect(servicio.buscarPorId(99)).rejects.toThrow(NotFoundException);
  });

  it('eliminar funciona correctamente', async () => {
    preguntaRepo.findOne.mockResolvedValue(mockPregunta());
    preguntaRepo.remove.mockResolvedValue(undefined);
    await expect(servicio.eliminar(1)).resolves.not.toThrow();
  });
});
