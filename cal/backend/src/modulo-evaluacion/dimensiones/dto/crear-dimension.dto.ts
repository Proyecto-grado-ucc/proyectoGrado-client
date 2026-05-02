import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CrearDimensionDto {
  @ApiProperty({ example: 'Metodología' })
  @IsString() @IsNotEmpty() @MaxLength(200)
  nombre: string;

  @ApiProperty({ required: false })
  @IsString() @IsOptional()
  descripcion?: string;

  @ApiProperty({ example: 1.0, default: 1.0, required: false })
  @IsNumber() @Min(0) @IsOptional()
  peso?: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  formularioId: number;
}
