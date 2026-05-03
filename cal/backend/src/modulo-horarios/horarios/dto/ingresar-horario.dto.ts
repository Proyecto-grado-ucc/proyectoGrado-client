import { IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class IngresarHorarioDto {
  @ApiProperty({ example: 'CAL-A4K2-8X1P', description: 'Codigo de acceso del horario proporcionado por el administrador' })
  @IsString()
  @Length(4, 20)
  codigo: string;
}
