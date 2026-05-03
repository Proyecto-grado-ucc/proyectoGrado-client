import { ApiProperty } from '@nestjs/swagger';

export class RespuestaFormularioDto {
  @ApiProperty() id: number;
  @ApiProperty() titulo: string;
  @ApiProperty({ nullable: true }) descripcion: string | null;
  @ApiProperty() periodoId: number;
  @ApiProperty() periodoNombre: string;
  @ApiProperty() activo: boolean;
  @ApiProperty({ required: false }) dimensiones?: any[];
}

export class RespuestaPaginadaFormularioDto {
  @ApiProperty({ type: [RespuestaFormularioDto] }) items: RespuestaFormularioDto[];
  @ApiProperty() total: number;
  @ApiProperty() page: number;
  @ApiProperty() size: number;
}
