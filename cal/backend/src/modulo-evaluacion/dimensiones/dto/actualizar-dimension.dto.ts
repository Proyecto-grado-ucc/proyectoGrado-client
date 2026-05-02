import { PartialType } from '@nestjs/swagger';
import { CrearDimensionDto } from './crear-dimension.dto';
export class ActualizarDimensionDto extends PartialType(CrearDimensionDto) {}
