import { NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { Docente } from '../../compartido/entidades/docente.entidad';
import { Evaluacion, EstadoEvaluacion } from '../entidades/evaluacion.entidad';
import { Formulario } from '../entidades/formulario.entidad';
import { EvaluacionesServicio } from './evaluaciones.servicio';

const mockFormulario = (): Formulario => ({ id: 1, titulo: 'Eval', descripcion: null, periodo: { id: 1, nombre: '2024-I', fechaInicio: '', fechaFin: '' }, activo: true, dimensiones: [] }) as unknown as Formulario;
const mockDocente = (): Docente => ({ id: 1, usuario: { id: 1, nombre: 'Juan', email: 'juan@cal.edu.co' }, especialidad: null, cargaMaximaHoras: 40, disponibilidades: [] }) as unknown as Docente;
const mockEval = (): Evaluacion => ({ id: 1, formulario: mockFormulario(), docenteEvaluado: mockDocente(), evaluadorId: null, estado: EstadoEvaluacion.Pendiente, creadoEn: new Date(), respuestas: [] }) as unknown as Evaluacion;

describe('EvaluacionesServicio', () => {
  let servicio: EvaluacionesServicio;
  let evalRepo: { findOne: jest.Mock; findAndCount: jest.Mock; create: jest.Mock; save: jest.Mock; remove: jest.Mock };
  let formularioRepo: { findOne: jest.Mock };
  let docenteRepo: { findOne: jest.Mock };

  beforeEach(async () => {
    evalRepo = { findOne: jest.fn(), findAndCount: jest.fn(), create: jest.fn(), save: jest.fn(), remove: jest.fn() };
    formularioRepo = { findOne: jest.fn() };
    docenteRepo = { findOne: jest.fn() };

    const modulo: TestingModule = await Test.createTestingModule({
      providers: [
        EvaluacionesServicio,
        { provide: getRepositoryToken(Evaluacion), useValue: evalRepo },
        { provide: getRepositoryToken(Formulario), useValue: formularioRepo },
        { provide: getRepositoryToken(Docente), useValue: docenteRepo },
      ],
    }).compile();
    servicio = modulo.get(EvaluacionesServicio);
  });

  it('crear lanza NotFoundException si el formulario no existe', async () => {
    formularioRepo.findOne.mockResolvedValue(null);
    await expect(servicio.crear({ formularioId: 99, docenteEvaluadoId: 1 })).rejects.toThrow(NotFoundException);
  });

  it('crear lanza NotFoundException si el docente no existe', async () => {
    formularioRepo.findOne.mockResolvedValue(mockFormulario());
    docenteRepo.findOne.mockResolvedValue(null);
    await expect(servicio.crear({ formularioId: 1, docenteEvaluadoId: 99 })).rejects.toThrow(NotFoundException);
  });

  it('crear devuelve la evaluación', async () => {
    formularioRepo.findOne.mockResolvedValue(mockFormulario());
    docenteRepo.findOne.mockResolvedValue(mockDocente());
    const e = mockEval();
    evalRepo.create.mockReturnValue(e);
    evalRepo.save.mockResolvedValue(e);
    const r = await servicio.crear({ formularioId: 1, docenteEvaluadoId: 1 });
    expect(r.estado).toBe(EstadoEvaluacion.Pendiente);
    expect(r.evaluadorId).toBeNull();
  });

  it('actualizar cambia el estado', async () => {
    const e = mockEval();
    evalRepo.findOne.mockResolvedValue(e);
    evalRepo.save.mockResolvedValue({ ...e, estado: EstadoEvaluacion.Completada });
    const r = await servicio.actualizar(1, { estado: EstadoEvaluacion.Completada });
    expect(r.estado).toBe(EstadoEvaluacion.Completada);
  });

  it('buscarPorId lanza NotFoundException si no existe', async () => {
    evalRepo.findOne.mockResolvedValue(null);
    await expect(servicio.buscarPorId(99)).rejects.toThrow(NotFoundException);
  });

  it('eliminar funciona correctamente', async () => {
    evalRepo.findOne.mockResolvedValue(mockEval());
    evalRepo.remove.mockResolvedValue(undefined);
    await expect(servicio.eliminar(1)).resolves.not.toThrow();
  });
});
