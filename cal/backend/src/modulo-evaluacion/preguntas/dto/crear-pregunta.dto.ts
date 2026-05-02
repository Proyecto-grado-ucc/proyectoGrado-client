import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';
import { TipoPregunta } from '../../entidades/pregunta.entidad';

export class CrearPreguntaDto {
  @ApiProperty({ example: '¿Cómo evalúa la metodología del docente?' })
  @IsString() @IsNotEmpty()
  texto: string;

  @ApiProperty({ enum: TipoPregunta, default: TipoPregunta.Escala })
  @IsIn(Object.values(TipoPregunta))
  tipo: TipoPregunta;

  @ApiProperty({ example: 0, default: 0, required: false })
  @IsInt() @Min(0) @IsOptional()
  ordenIdx?: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  dimensionId: number;
}
