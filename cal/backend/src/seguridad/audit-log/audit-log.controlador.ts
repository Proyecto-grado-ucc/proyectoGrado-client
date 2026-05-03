import { Controller, Get, Query, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtGuardia } from '../auth/guardias/jwt.guardia';
import { RolesGuardia } from '../auth/guardias/roles.guardia';
import { Roles } from '../decoradores/roles.decorador';
import { RolNombre } from '../entidades/rol.entidad';
import { AuditLogServicio } from './audit-log.servicio';
import { RespuestaPaginadaAuditLogDto } from './dto/respuesta-audit-log.dto';

@ApiTags('audit-log')
@ApiBearerAuth()
@UseGuards(JwtGuardia, RolesGuardia)
@Controller('audit-log')
export class AuditLogControlador {
  constructor(private readonly auditLogServicio: AuditLogServicio) {}

  @Get()
  @ApiOperation({ summary: 'Listar audit log paginado y filtrable' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'size', required: false, example: 20 })
  @ApiQuery({ name: 'entidad', required: false, example: 'USUARIO' })
  @ApiQuery({ name: 'fecha_desde', required: false })
  @ApiQuery({ name: 'fecha_hasta', required: false })
  @ApiResponse({ status: 200, type: RespuestaPaginadaAuditLogDto })
  listar(
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('size', new ParseIntPipe({ optional: true })) size = 20,
    @Query('entidad') entidad?: string,
    @Query('fecha_desde') fechaDesde?: string,
    @Query('fecha_hasta') fechaHasta?: string,
  ): Promise<RespuestaPaginadaAuditLogDto> {
    return this.auditLogServicio.listar(page, size, { entidad, fechaDesde, fechaHasta });
  }
}
