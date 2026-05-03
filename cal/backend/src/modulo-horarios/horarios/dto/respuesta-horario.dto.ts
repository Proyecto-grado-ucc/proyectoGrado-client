import { ApiProperty } from '@nestjs/swagger';

class AsignacionDto {
  @ApiProperty() grupoId: number;
  @ApiProperty() docenteId: number;
  @ApiProperty() aulaId: number;
  @ApiProperty() franjaId: number;
}

export class RespuestaHorarioDto {
  @ApiProperty() id: number;
  @ApiProperty() periodoId: number;
  @ApiProperty() periodoNombre: string;
  @ApiProperty({ type: [AsignacionDto] }) asignaciones: AsignacionDto[];
  @ApiProperty() fitness: number;
  @ApiProperty() generaciones: number;
  @ApiProperty() tiempoMs: number;
  @ApiProperty() creadoEn: Date;
}

export class RespuestaPaginadaHorarioDto {
  @ApiProperty({ type: [RespuestaHorarioDto] }) items: RespuestaHorarioDto[];
  @ApiProperty() total: number;
  @ApiProperty() page: number;
  @ApiProperty() size: number;
}
