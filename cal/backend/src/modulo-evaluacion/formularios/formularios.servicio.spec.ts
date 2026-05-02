import { NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { PeriodoAcademico } from '../../compartido/entidades/periodo-academico.entidad';
import { Formulario } from '../entidades/formulario.entidad';
import { FormulariosServicio } from './formularios.servicio';

const mockPeriodo = (): PeriodoAcademico => ({ id: 1, nombre: '2024-I', fechaInicio: '2024-01-15', fechaFin: '2024-06-30' });
const mockFormulario = (): Formulario => ({ id: 1, titulo: 'Evaluación 2024', descripcion: null, periodo: mockPeriodo(), activo: true, dimensiones: [] }) as unknown as Formulario;

describe('FormulariosServicio', () => {
  let servicio: FormulariosServicio;
  let formularioRepo: { findOne: jest.Mock; findAndCount: jest.Mock; create: jest.Mock; save: jest.Mock; remove: jest.Mock };
  let periodoRepo: { findOne: jest.Mock };

  beforeEach(async () => {
    formularioRepo = { findOne: jest.fn(), findAndCount: jest.fn(), create: jest.fn(), save: jest.fn(), remove: jest.fn() };
    periodoRepo = { findOne: jest.fn() };

    const modulo: TestingModule = await Test.createTestingModule({
      providers: [
        FormulariosServicio,
        { provide: getRepositoryToken(Formulario), useValue: formularioRepo },
        { provide: getRepositoryToken(PeriodoAcademico), useValue: periodoRepo },
      ],
    }).compile();
    servicio = modulo.get(FormulariosServicio);
  });

  it('crear lanza NotFoundException si el periodo no existe', async () => {
    periodoRepo.findOne.mockResolvedValue(null);
    await expect(servicio.crear({ titulo: 'Test', periodoId: 99 })).rejects.toThrow(NotFoundException);
  });

  it('crear devuelve el formulario', async () => {
    periodoRepo.findOne.mockResolvedValue(mockPeriodo());
    const f = mockFormulario();
    formularioRepo.create.mockReturnValue(f);
    formularioRepo.save.mockResolvedValue(f);
    const r = await servicio.crear({ titulo: 'Evaluación 2024', periodoId: 1 });
    expect(r.titulo).toBe('Evaluación 2024');
  });

  it('listar devuelve paginado', async () => {
    formularioRepo.findAndCount.mockResolvedValue([[mockFormulario()], 1]);
    const r = await servicio.listar(1, 20);
    expect(r.total).toBe(1);
  });

  it('buscarPorId lanza NotFoundException si no existe', async () => {
    formularioRepo.findOne.mockResolvedValue(null);
    await expect(servicio.buscarPorId(99)).rejects.toThrow(NotFoundException);
  });

  it('eliminar funciona correctamente', async () => {
    formularioRepo.findOne.mockResolvedValue(mockFormulario());
    formularioRepo.remove.mockResolvedValue(undefined);
    await expect(servicio.eliminar(1)).resolves.not.toThrow();
  });
});
