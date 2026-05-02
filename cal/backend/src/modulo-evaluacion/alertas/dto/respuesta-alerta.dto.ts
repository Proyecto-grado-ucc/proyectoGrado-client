import { ApiProperty } from '@nestjs/swagger';
import { NivelAlerta, TipoAlerta } from '../../entidades/alerta.entidad';

export class RespuestaAlertaDto {
  @ApiProperty() id: number;
  @ApiProperty() docenteId: number;
  @ApiProperty() periodoId: number;
  @ApiProperty({ enum: TipoAlerta }) tipo: TipoAlerta;
  @ApiProperty({ enum: NivelAlerta }) nivel: NivelAlerta;
  @ApiProperty() mensaje: string;
  @ApiProperty() leida: boolean;
  @ApiProperty() creadoEn: Date;
}
