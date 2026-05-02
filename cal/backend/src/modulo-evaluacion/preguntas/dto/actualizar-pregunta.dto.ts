import { PartialType } from '@nestjs/swagger';
import { CrearPreguntaDto } from './crear-pregunta.dto';
export class ActualizarPreguntaDto extends PartialType(CrearPreguntaDto) {}
