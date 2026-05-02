import { ApiProperty } from '@nestjs/swagger';

export class RespuestaEjecucionKddDto {
  @ApiProperty() resultados: number;
  @ApiProperty() alertas: number;
}

export class RespuestaResultadoKddDto {
  @ApiProperty() id: number;
  @ApiProperty() periodoId: number;
  @ApiProperty() docenteId: number;
  @ApiProperty() puntuacionGlobal: number;
  @ApiProperty() totalEvaluaciones: number;
  @ApiProperty() detalleDimensiones: Record<string, number>;
  @ApiProperty() creadoEn: Date;
}
