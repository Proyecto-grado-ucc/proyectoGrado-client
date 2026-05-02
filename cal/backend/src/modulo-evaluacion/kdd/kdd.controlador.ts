import { Body, Controller, Get, Post, Query, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtGuardia } from '../../seguridad/auth/guardias/jwt.guardia';
import { RolesGuardia } from '../../seguridad/auth/guardias/roles.guardia';
import { Auditar } from '../../seguridad/decoradores/auditar.decorador';
import { Roles } from '../../seguridad/decoradores/roles.decorador';
import { RolNombre } from '../../seguridad/entidades/rol.entidad';
import { EjecutarKddDto } from './dto/ejecutar-kdd.dto';
import { RespuestaEjecucionKddDto, RespuestaResultadoKddDto } from './dto/respuesta-kdd.dto';
import { KddPipelineServicio } from './kdd-pipeline.servicio';

@ApiTags('kdd')
@ApiBearerAuth()
@UseGuards(JwtGuardia, RolesGuardia)
@Roles(RolNombre.Admin)
@Controller('kdd')
export class KddControlador {
  constructor(private readonly kddServicio: KddPipelineServicio) {}

  @Post('ejecutar')
  @Auditar('KDD')
  @ApiOperation({ summary: 'Ejecutar pipeline KDD para un período académico' })
  @ApiResponse({ status: 201, type: RespuestaEjecucionKddDto })
  ejecutar(@Body() dto: EjecutarKddDto): Promise<RespuestaEjecucionKddDto> {
    return this.kddServicio.ejecutar(dto.periodoId);
  }

  @Get('resultados')
  @ApiOperation({ summary: 'Listar resultados KDD por período' })
  @ApiQuery({ name: 'periodoId', required: true, type: Number })
  @ApiResponse({ status: 200, type: [RespuestaResultadoKddDto] })
  listarResultados(
    @Query('periodoId', ParseIntPipe) periodoId: number,
  ): Promise<RespuestaResultadoKddDto[]> {
    return this.kddServicio.listarResultados(periodoId);
  }
}
