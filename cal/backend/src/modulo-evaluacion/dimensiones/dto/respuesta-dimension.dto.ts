import { ApiProperty } from '@nestjs/swagger';

export class RespuestaDimensionDto {
  @ApiProperty() id: number;
  @ApiProperty() nombre: string;
  @ApiProperty({ nullable: true }) descripcion: string | null;
  @ApiProperty() peso: number;
  @ApiProperty() formularioId: number;
  @ApiProperty() formularioTitulo: string;
}

export class RespuestaPaginadaDimensionDto {
  @ApiProperty({ type: [RespuestaDimensionDto] }) items: RespuestaDimensionDto[];
  @ApiProperty() total: number;
  @ApiProperty() page: number;
  @ApiProperty() size: number;
}
