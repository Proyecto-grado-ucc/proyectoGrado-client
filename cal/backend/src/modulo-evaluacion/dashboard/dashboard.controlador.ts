import { Controller, Get, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtGuardia } from '../../seguridad/auth/guardias/jwt.guardia';
import { RolesGuardia } from '../../seguridad/auth/guardias/roles.guardia';
import { Roles } from '../../seguridad/decoradores/roles.decorador';
import { RolNombre } from '../../seguridad/entidades/rol.entidad';
import { DashboardServicio } from './dashboard.servicio';
import { RespuestaDashboardDto } from './dto/respuesta-dashboard.dto';

@ApiTags('dashboard')
@ApiBearerAuth()
@UseGuards(JwtGuardia, RolesGuardia)
@Roles(RolNombre.Admin)
@Controller('dashboard')
export class DashboardControlador {
  constructor(private readonly dashboardServicio: DashboardServicio) {}

  @Get('resumen')
  @ApiOperation({ summary: 'Resumen estadístico del período académico' })
  @ApiQuery({ name: 'periodoId', required: true, type: Number })
  @ApiResponse({ status: 200, type: RespuestaDashboardDto })
  resumen(@Query('periodoId', ParseIntPipe) periodoId: number): Promise<RespuestaDashboardDto> {
    return this.dashboardServicio.resumen(periodoId);
  }
}
