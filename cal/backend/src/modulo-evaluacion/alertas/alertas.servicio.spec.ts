import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Alerta, NivelAlerta, TipoAlerta } from '../entidades/alerta.entidad';
import { AlertasServicio } from './alertas.servicio';

const mockAlerta = (): Alerta =>
  ({
    id: 1, docenteId: 1, periodoId: 1,
    tipo: TipoAlerta.BAJO_RENDIMIENTO,
    nivel: NivelAlerta.CRITICO,
    mensaje: 'Puntuación baja',
    leida: false,
    creadoEn: new Date(),
  }) as unknown as Alerta;

describe('AlertasServicio', () => {
  let servicio: AlertasServicio;
  let repo: { find: jest.Mock; findOne: jest.Mock; save: jest.Mock; remove: jest.Mock };

  beforeEach(async () => {
    repo = {
      find: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
    };

    const modulo: TestingModule = await Test.createTestingModule({
      providers: [
        AlertasServicio,
        { provide: getRepositoryToken(Alerta), useValue: repo },
      ],
    }).compile();

    servicio = modulo.get(AlertasServicio);
  });

  describe('listar', () => {
    it('devuelve alertas sin filtro de período', async () => {
      repo.find.mockResolvedValue([mockAlerta()]);
      const res = await servicio.listar();
      expect(res).toHaveLength(1);
    });

    it('filtra por periodoId cuando se proporciona', async () => {
      repo.find.mockResolvedValue([mockAlerta()]);
      await servicio.listar(1);
      expect(repo.find).toHaveBeenCalledWith(expect.objectContaining({ where: { periodoId: 1 } }));
    });
  });

  describe('marcarLeida', () => {
    it('marca la alerta como leída', async () => {
      const a = mockAlerta();
      repo.findOne.mockResolvedValue(a);
      repo.save.mockResolvedValue({ ...a, leida: true });

      const res = await servicio.marcarLeida(1);
      expect(res.leida).toBe(true);
    });

    it('lanza NotFoundException si no existe', async () => {
      repo.findOne.mockResolvedValue(null);
      await expect(servicio.marcarLeida(99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('eliminar', () => {
    it('elimina la alerta correctamente', async () => {
      repo.findOne.mockResolvedValue(mockAlerta());
      repo.remove.mockResolvedValue(undefined);
      await expect(servicio.eliminar(1)).resolves.not.toThrow();
    });

    it('lanza NotFoundException si no existe', async () => {
      repo.findOne.mockResolvedValue(null);
      await expect(servicio.eliminar(99)).rejects.toThrow(NotFoundException);
    });
  });
});
