import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtGuardia } from '../../seguridad/auth/guardias/jwt.guardia';
import { RolesGuardia } from '../../seguridad/auth/guardias/roles.guardia';
import { Auditar } from '../../seguridad/decoradores/auditar.decorador';
import { Roles } from '../../seguridad/decoradores/roles.decorador';
import { RolNombre } from '../../seguridad/entidades/rol.entidad';
import { ActualizarRespuestaDto } from './dto/actualizar-respuesta.dto';
import { CrearRespuestaDto } from './dto/crear-respuesta.dto';
import { DetalleRespuestaDto, RespuestaPaginadaRespuestaDto } from './dto/respuesta-respuesta.dto';
import { RespuestasServicio } from './respuestas.servicio';

@ApiTags('respuestas')
@ApiBearerAuth()
@UseGuards(JwtGuardia, RolesGuardia)
@Roles(RolNombre.Admin)
@Controller('respuestas')
export class RespuestasControlador {
  constructor(private readonly respuestasServicio: RespuestasServicio) {}

  @Post()
  @Auditar('RESPUESTA')
  @ApiResponse({ status: 201, type: DetalleRespuestaDto })
  crear(@Body() dto: CrearRespuestaDto): Promise<DetalleRespuestaDto> {
    return this.respuestasServicio.crear(dto);
  }

  @Get('por-evaluacion/:evaluacionId')
  @ApiOperation({ summary: 'Listar respuestas de una evaluación' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'size', required: false, example: 50 })
  @ApiResponse({ status: 200, type: RespuestaPaginadaRespuestaDto })
  listarPorEvaluacion(
    @Param('evaluacionId', ParseIntPipe) evaluacionId: number,
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('size', new ParseIntPipe({ optional: true })) size = 50,
  ): Promise<RespuestaPaginadaRespuestaDto> {
    return this.respuestasServicio.listarPorEvaluacion(evaluacionId, page, size);
  }

  @Get(':id')
  @ApiResponse({ status: 200, type: DetalleRespuestaDto })
  buscarPorId(@Param('id', ParseIntPipe) id: number): Promise<DetalleRespuestaDto> {
    return this.respuestasServicio.buscarPorId(id);
  }

  @Patch(':id')
  @Auditar('RESPUESTA')
  @ApiResponse({ status: 200, type: DetalleRespuestaDto })
  actualizar(@Param('id', ParseIntPipe) id: number, @Body() dto: ActualizarRespuestaDto): Promise<DetalleRespuestaDto> {
    return this.respuestasServicio.actualizar(id, dto);
  }

  @Delete(':id')
  @Auditar('RESPUESTA')
  @HttpCode(HttpStatus.NO_CONTENT)
  eliminar(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.respuestasServicio.eliminar(id);
  }
}
