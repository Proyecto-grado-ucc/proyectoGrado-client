import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNumber, IsOptional, IsString } from 'class-validator';

export class CrearRespuestaDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  evaluacionId: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  preguntaId: number;

  @ApiProperty({ example: 4.5, required: false, nullable: true })
  @IsNumber() @IsOptional()
  valorNumerico?: number | null;

  @ApiProperty({ example: 'Excelente docente', required: false, nullable: true })
  @IsString() @IsOptional()
  valorTexto?: string | null;
}
