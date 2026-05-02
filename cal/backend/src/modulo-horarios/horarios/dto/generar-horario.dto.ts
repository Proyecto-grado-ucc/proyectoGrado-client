import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNumber, IsObject, IsOptional, Max, Min } from 'class-validator';

export class ConfiguracionMotorDto {
  @ApiProperty({ example: 50, required: false })
  @IsInt() @Min(10) @Max(500) @IsOptional()
  tamPoblacion?: number;

  @ApiProperty({ example: 100, required: false })
  @IsInt() @Min(10) @Max(1000) @IsOptional()
  generaciones?: number;

  @ApiProperty({ example: 0.1, required: false })
  @IsNumber() @Min(0) @Max(1) @IsOptional()
  tasaMutacion?: number;

  @ApiProperty({ example: 0.8, required: false })
  @IsNumber() @Min(0) @Max(1) @IsOptional()
  tasaCruce?: number;

  @ApiProperty({ example: 50, required: false })
  @IsInt() @Min(0) @Max(500) @IsOptional()
  iteracionesTabu?: number;

  @ApiProperty({ example: 20, required: false })
  @IsInt() @Min(5) @Max(100) @IsOptional()
  tamListaTabu?: number;
}

export class GenerarHorarioDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  periodoId: number;

  @ApiProperty({ type: ConfiguracionMotorDto, required: false })
  @IsObject()
  @IsOptional()
  configuracion?: ConfiguracionMotorDto;
}
