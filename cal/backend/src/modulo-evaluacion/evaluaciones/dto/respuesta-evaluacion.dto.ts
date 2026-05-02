import { ApiProperty } from '@nestjs/swagger';
import { EstadoEvaluacion } from '../../entidades/evaluacion.entidad';

export class RespuestaEvaluacionDto {
  @ApiProperty() id: number;
  @ApiProperty() formularioId: number;
  @ApiProperty() formularioTitulo: string;
  @ApiProperty() docenteEvaluadoId: number;
  @ApiProperty() docenteEvaluadoNombre: string;
  @ApiProperty({ nullable: true }) evaluadorId: number | null;
  @ApiProperty({ enum: EstadoEvaluacion }) estado: EstadoEvaluacion;
  @ApiProperty() creadoEn: Date;
}

export class RespuestaPaginadaEvaluacionDto {
  @ApiProperty({ type: [RespuestaEvaluacionDto] }) items: RespuestaEvaluacionDto[];
  @ApiProperty() total: number;
  @ApiProperty() page: number;
  @ApiProperty() size: number;
}
