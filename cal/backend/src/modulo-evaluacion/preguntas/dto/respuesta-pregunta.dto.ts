import { ApiProperty } from '@nestjs/swagger';
import { TipoPregunta } from '../../entidades/pregunta.entidad';

export class RespuestaPreguntaDto {
  @ApiProperty() id: number;
  @ApiProperty() texto: string;
  @ApiProperty({ enum: TipoPregunta }) tipo: TipoPregunta;
  @ApiProperty() ordenIdx: number;
  @ApiProperty() dimensionId: number;
  @ApiProperty() dimensionNombre: string;
}

export class RespuestaPaginadaPreguntaDto {
  @ApiProperty({ type: [RespuestaPreguntaDto] }) items: RespuestaPreguntaDto[];
  @ApiProperty() total: number;
  @ApiProperty() page: number;
  @ApiProperty() size: number;
}
