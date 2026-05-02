import { PartialType } from '@nestjs/swagger';
import { CrearFormularioDto } from './crear-formulario.dto';
export class ActualizarFormularioDto extends PartialType(CrearFormularioDto) {}
