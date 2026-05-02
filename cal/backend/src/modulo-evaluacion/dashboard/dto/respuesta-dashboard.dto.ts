import { ApiProperty } from '@nestjs/swagger';

export class DistribucionDto {
  @ApiProperty() rango: string;
  @ApiProperty() cantidad: number;
}

export class RespuestaDashboardDto {
  @ApiProperty() totalDocentes: number;
  @ApiProperty() totalEvaluaciones: number;
  @ApiProperty() promedioGlobal: number;
  @ApiProperty() alertasCriticas: number;
  @ApiProperty() alertasAdvertencia: number;
  @ApiProperty({ type: [DistribucionDto] }) distribucionPuntuaciones: DistribucionDto[];
}
