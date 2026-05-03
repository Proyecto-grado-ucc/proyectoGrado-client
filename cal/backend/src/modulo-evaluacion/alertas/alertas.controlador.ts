import { Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Patch, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtGuardia } from '../../seguridad/auth/guardias/jwt.guardia';
import { RolesGuardia } from '../../seguridad/auth/guardias/roles.guardia';
import { Roles } from '../../seguridad/decoradores/roles.decorador';
import { RolNombre } from '../../seguridad/entidades/rol.entidad';
import { AlertasServicio } from './alertas.servicio';
import { RespuestaAlertaDto } from './dto/respuesta-alerta.dto';

@ApiTags('alertas')
@ApiBearerAuth()
@UseGuards(JwtGuardia, RolesGuardia)
@Controller('alertas')
export class AlertasControlador {
  constructor(private readonly alertasServicio: AlertasServicio) {}

  @Get()
  @ApiOperation({ summary: 'Listar alertas, opcionalmente filtradas por período' })
  @ApiQuery({ name: 'periodoId', required: false, type: Number })
  @ApiResponse({ status: 200, type: [RespuestaAlertaDto] })
  listar(
    @Query('periodoId') periodoIdStr?: string,
    @Query('page') pageStr?: string,
    @Query('size') sizeStr?: string,
  ): Promise<RespuestaAlertaDto[]> {
    const periodoId = periodoIdStr ? parseInt(periodoIdStr, 10) : undefined;
    return this.alertasServicio.listar(periodoId);
  }

  @Roles(RolNombre.Admin)
  @Patch(':id/leer')
  @ApiOperation({ summary: 'Marcar alerta como leída' })
  @ApiResponse({ status: 200, type: RespuestaAlertaDto })
  marcarLeida(@Param('id', ParseIntPipe) id: number): Promise<RespuestaAlertaDto> {
    return this.alertasServicio.marcarLeida(id);
  }

  @Roles(RolNombre.Admin)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar alerta' })
  eliminar(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.alertasServicio.eliminar(id);
  }
}
