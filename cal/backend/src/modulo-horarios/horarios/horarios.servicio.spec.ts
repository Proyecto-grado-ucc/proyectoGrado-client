import { BadRequestException, NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { PeriodoAcademico } from '../../compartido/entidades/periodo-academico.entidad';
import { Docente } from '../../compartido/entidades/docente.entidad';
import { GeminiServicio } from '../motor/gemini.servicio';
import { CONFIG_DEFAULT } from '../motor/tipos';
import { Aula, TipoAula } from '../entidades/aula.entidad';
import { Disponibilidad } from '../entidades/disponibilidad.entidad';
import { DiaSemana, FranjaHoraria } from '../entidades/franja-horaria.entidad';
import { Grupo, Jornada } from '../entidades/grupo.entidad';
import { Horario } from '../entidades/horario.entidad';
import { HorariosServicio } from './horarios.servicio';
import { CodigoNivel, NivelIdioma } from '../entidades/nivel-idioma.entidad';

const mockNivel: NivelIdioma = { id: 1, codigo: CodigoNivel.A1, nombre: 'Principiante', cursos: [] };
const mockCurso = { id: 1, nombre: 'Inglés A1', nivel: mockNivel, intensidadHoraria: 2, grupos: [] };
const mockPeriodo: PeriodoAcademico = { id: 1, nombre: '2024-I', fechaInicio: '2024-01-15', fechaFin: '2024-06-30' };
const mockUsuario = { id: 1, nombre: 'Juan', email: 'juan@cal.edu.co', rol: { nombre: 'Docente' }, activo: true, fechaCreacion: new Date(), sesiones: [] };
const mockDocente = { id: 1, usuario: mockUsuario, especialidad: null, cargaMaximaHoras: 40, disponibilidades: [] } as unknown as Docente;
const mockAula = { id: 1, codigo: 'A-101', capacidad: 30, tipo: TipoAula.Salon, activa: true } as Aula;
const mockGrupo = { id: 1, codigo: 'G-01', curso: mockCurso, cupoMax: 20, jornada: Jornada.Manana } as unknown as Grupo;
const mockFranja = { id: 1, diaSemana: DiaSemana.Lunes, horaInicio: '08:00', horaFin: '10:00', bloqueIdx: 1 } as FranjaHoraria;
const mockDisp = { id: 1, docente: mockDocente, franjaHoraria: mockFranja, disponible: true } as unknown as Disponibilidad;

describe('HorariosServicio', () => {
  let servicio: HorariosServicio;
  let horarioRepo: { findOne: jest.Mock; findAndCount: jest.Mock; create: jest.Mock; save: jest.Mock; remove: jest.Mock };
  let periodoRepo: { findOne: jest.Mock };
  let grupoRepo: { find: jest.Mock };
  let docenteRepo: { find: jest.Mock };
  let aulaRepo: { find: jest.Mock };
  let franjaRepo: { find: jest.Mock };
  let dispRepo: { find: jest.Mock };
  let geminiServicio: { sugerirConfiguracion: jest.Mock };

  beforeEach(async () => {
    horarioRepo = { findOne: jest.fn(), findAndCount: jest.fn(), create: jest.fn(), save: jest.fn(), remove: jest.fn() };
    periodoRepo = { findOne: jest.fn() };
    grupoRepo = { find: jest.fn() };
    docenteRepo = { find: jest.fn() };
    aulaRepo = { find: jest.fn() };
    franjaRepo = { find: jest.fn() };
    dispRepo = { find: jest.fn() };
    geminiServicio = { sugerirConfiguracion: jest.fn().mockResolvedValue(CONFIG_DEFAULT) };

    const modulo: TestingModule = await Test.createTestingModule({
      providers: [
        HorariosServicio,
        { provide: getRepositoryToken(Horario), useValue: horarioRepo },
        { provide: getRepositoryToken(PeriodoAcademico), useValue: periodoRepo },
        { provide: getRepositoryToken(Grupo), useValue: grupoRepo },
        { provide: getRepositoryToken(Docente), useValue: docenteRepo },
        { provide: getRepositoryToken(Aula), useValue: aulaRepo },
        { provide: getRepositoryToken(FranjaHoraria), useValue: franjaRepo },
        { provide: getRepositoryToken(Disponibilidad), useValue: dispRepo },
        { provide: GeminiServicio, useValue: geminiServicio },
      ],
    }).compile();

    servicio = modulo.get(HorariosServicio);
  });

  describe('generar', () => {
    it('lanza NotFoundException si el periodo no existe', async () => {
      periodoRepo.findOne.mockResolvedValue(null);
      await expect(servicio.generar({ periodoId: 99 })).rejects.toThrow(NotFoundException);
    });

    it('lanza BadRequestException si no hay grupos', async () => {
      periodoRepo.findOne.mockResolvedValue(mockPeriodo);
      grupoRepo.find.mockResolvedValue([]);
      docenteRepo.find.mockResolvedValue([mockDocente]);
      aulaRepo.find.mockResolvedValue([mockAula]);
      franjaRepo.find.mockResolvedValue([mockFranja]);
      dispRepo.find.mockResolvedValue([mockDisp]);
      await expect(servicio.generar({ periodoId: 1 })).rejects.toThrow(BadRequestException);
    });

    it('genera y guarda el horario correctamente', async () => {
      periodoRepo.findOne.mockResolvedValue(mockPeriodo);
      grupoRepo.find.mockResolvedValue([mockGrupo]);
      docenteRepo.find.mockResolvedValue([mockDocente]);
      aulaRepo.find.mockResolvedValue([mockAula]);
      franjaRepo.find.mockResolvedValue([mockFranja, { ...mockFranja, id: 2 }, { ...mockFranja, id: 3 }]);
      dispRepo.find.mockResolvedValue([mockDisp]);

      const horarioGuardado = {
        id: 1, periodo: mockPeriodo, asignaciones: [], fitness: 0, generaciones: 5, tiempoMs: 100, metadatos: null, creadoEn: new Date(),
      } as unknown as Horario;
      horarioRepo.create.mockReturnValue(horarioGuardado);
      horarioRepo.save.mockResolvedValue(horarioGuardado);

      const resultado = await servicio.generar({ periodoId: 1, configuracion: { tamPoblacion: 5, generaciones: 5, iteracionesTabu: 5 } });
      expect(horarioRepo.save).toHaveBeenCalled();
      expect(resultado.periodoId).toBe(1);
    });
  });

  describe('buscarPorId', () => {
    it('lanza NotFoundException si no existe', async () => {
      horarioRepo.findOne.mockResolvedValue(null);
      await expect(servicio.buscarPorId(99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('eliminar', () => {
    it('elimina correctamente', async () => {
      const h = { id: 1, periodo: mockPeriodo, asignaciones: [], fitness: 0, generaciones: 5, tiempoMs: 100, metadatos: null, creadoEn: new Date() } as unknown as Horario;
      horarioRepo.findOne.mockResolvedValue(h);
      horarioRepo.remove.mockResolvedValue(undefined);
      await expect(servicio.eliminar(1)).resolves.not.toThrow();
    });
  });
});
