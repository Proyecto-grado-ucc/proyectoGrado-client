import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional } from 'class-validator';

export class CrearEvaluacionDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  formularioId: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  docenteEvaluadoId: number;

  @ApiProperty({ example: 2, required: false, nullable: true, description: 'null = anónima' })
  @IsInt() @IsOptional()
  evaluadorId?: number | null;
}
