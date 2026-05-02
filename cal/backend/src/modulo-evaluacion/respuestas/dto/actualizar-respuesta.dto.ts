import { PartialType } from '@nestjs/swagger';
import { CrearRespuestaDto } from './crear-respuesta.dto';
export class ActualizarRespuestaDto extends PartialType(CrearRespuestaDto) {}
