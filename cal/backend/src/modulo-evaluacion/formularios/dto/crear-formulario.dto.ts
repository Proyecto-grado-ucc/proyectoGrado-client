import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CrearFormularioDto {
  @ApiProperty({ example: 'Evaluación Docente 2024-I' })
  @IsString() @IsNotEmpty() @MaxLength(200)
  titulo: string;

  @ApiProperty({ example: 'Formulario de evaluación del desempeño docente', required: false })
  @IsString() @IsOptional()
  descripcion?: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  periodoId: number;

  @ApiProperty({ default: true, required: false })
  @IsBoolean() @IsOptional()
  activo?: boolean;
}
