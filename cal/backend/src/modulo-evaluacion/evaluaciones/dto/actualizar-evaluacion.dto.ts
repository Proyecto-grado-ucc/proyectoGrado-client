import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';
import { EstadoEvaluacion } from '../../entidades/evaluacion.entidad';

export class ActualizarEvaluacionDto {
  @ApiProperty({ enum: EstadoEvaluacion, required: false })
  @IsIn(Object.values(EstadoEvaluacion)) @IsOptional()
  estado?: EstadoEvaluacion;
}
