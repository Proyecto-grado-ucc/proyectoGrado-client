import { ApiProperty } from '@nestjs/swagger';
import { TipoPregunta } from '../../entidades/pregunta.entidad';

export class DetalleRespuestaDto {
  @ApiProperty() id: number;
  @ApiProperty() evaluacionId: number;
  @ApiProperty() preguntaId: number;
  @ApiProperty() preguntaTexto: string;
  @ApiProperty({ enum: TipoPregunta }) preguntaTipo: TipoPregunta;
  @ApiProperty({ nullable: true }) valorNumerico: number | null;
  @ApiProperty({ nullable: true }) valorTexto: string | null;
}

export class RespuestaPaginadaRespuestaDto {
  @ApiProperty({ type: [DetalleRespuestaDto] }) items: DetalleRespuestaDto[];
  @ApiProperty() total: number;
  @ApiProperty() page: number;
  @ApiProperty() size: number;
}
