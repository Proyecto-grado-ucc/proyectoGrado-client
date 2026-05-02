import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CONFIG_DEFAULT, ConfiguracionMotor, EntradaMotor } from './tipos';

@Injectable()
export class GeminiServicio {
  private readonly logger = new Logger(GeminiServicio.name);

  constructor(private readonly config: ConfigService) {}

  async sugerirConfiguracion(entrada: EntradaMotor): Promise<ConfiguracionMotor> {
    const apiKey = this.config.get<string>('GEMINI_API_KEY');
    if (!apiKey) {
      this.logger.warn('GEMINI_API_KEY no configurada — usando parámetros por defecto');
      return CONFIG_DEFAULT;
    }

    try {
      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

      const prompt = `Eres un experto en optimización combinatoria.
Dado un problema de generación de horarios académicos con:
- ${entrada.grupos.length} grupos (sesiones totales: ${entrada.grupos.reduce((s, g) => s + g.sesiones, 0)})
- ${entrada.docentes.length} docentes disponibles
- ${entrada.aulas.length} aulas
- ${entrada.franjas.length} franjas horarias

Sugiere parámetros óptimos para un algoritmo genético + búsqueda tabú.
Responde ÚNICAMENTE con un JSON válido con esta estructura exacta:
{"tamPoblacion":50,"generaciones":100,"tasaMutacion":0.1,"tasaCruce":0.8,"iteracionesTabu":50,"tamListaTabu":20}`;

      const resultado = await model.generateContent(prompt);
      const texto = resultado.response.text().trim();
      const jsonMatch = texto.match(/\{[^}]+\}/);
      if (!jsonMatch) throw new Error('Respuesta de Gemini sin JSON válido');

      const sugerido = JSON.parse(jsonMatch[0]) as Partial<ConfiguracionMotor>;
      return { ...CONFIG_DEFAULT, ...sugerido };
    } catch (err) {
      this.logger.error('Error al consultar Gemini, usando config por defecto', err);
      return CONFIG_DEFAULT;
    }
  }
}
