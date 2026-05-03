import { ApiProperty } from '@nestjs/swagger';
import { Jornada } from '../../entidades/grupo.entidad';

export class RespuestaGrupoDto {
  @ApiProperty() id: number;
  @ApiProperty() codigo: string;
  @ApiProperty() cursoId: number;
  @ApiProperty() cursoNombre: string;
  @ApiProperty() cupoMax: number;
  @ApiProperty({ enum: Jornada }) jornada: Jornada;
  @ApiProperty() codigoAcceso: string;
}

export class RespuestaPaginadaGrupoDto {
  @ApiProperty({ type: [RespuestaGrupoDto] }) items: RespuestaGrupoDto[];
  @ApiProperty() total: number;
  @ApiProperty() page: number;
  @ApiProperty() size: number;
}
