import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { CONFIG_DEFAULT, EntradaMotor } from './tipos';
import { GeminiServicio } from './gemini.servicio';

const entradaMock: EntradaMotor = {
  grupos: [{ id: 1, cupoMax: 20, sesiones: 2 }],
  docentes: [{ id: 1, cargaMaximaHoras: 40, franjasDisponibles: [1, 2] }],
  aulas: [{ id: 1, capacidad: 30 }],
  franjas: [{ id: 1 }, { id: 2 }],
};

describe('GeminiServicio', () => {
  let servicio: GeminiServicio;
  let configService: { get: jest.Mock };

  beforeEach(async () => {
    configService = { get: jest.fn() };

    const modulo: TestingModule = await Test.createTestingModule({
      providers: [
        GeminiServicio,
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    servicio = modulo.get(GeminiServicio);
  });

  it('devuelve CONFIG_DEFAULT cuando no hay GEMINI_API_KEY', async () => {
    configService.get.mockReturnValue(undefined);
    const config = await servicio.sugerirConfiguracion(entradaMock);
    expect(config).toEqual(CONFIG_DEFAULT);
  });

  it('devuelve CONFIG_DEFAULT cuando Gemini falla', async () => {
    configService.get.mockReturnValue('api-key-invalida');
    jest.mock('@google/generative-ai', () => ({
      GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
        getGenerativeModel: jest.fn().mockReturnValue({
          generateContent: jest.fn().mockRejectedValue(new Error('API error')),
        }),
      })),
    }));

    const config = await servicio.sugerirConfiguracion(entradaMock);
    expect(config.tamPoblacion).toBeGreaterThan(0);
    expect(config.generaciones).toBeGreaterThan(0);
  });
});
