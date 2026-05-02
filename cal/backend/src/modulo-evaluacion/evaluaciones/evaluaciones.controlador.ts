import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtGuardia } from '../../seguridad/auth/guardias/jwt.guardia';
import { RolesGuardia } from '../../seguridad/auth/guardias/roles.guardia';
import { Auditar } from '../../seguridad/decoradores/auditar.decorador';
import { Roles } from '../../seguridad/decoradores/roles.decorador';
import { RolNombre } from '../../seguridad/entidades/rol.entidad';
import { EvaluacionesServicio } from './evaluaciones.servicio';
import { ActualizarEvaluacionDto } from './dto/actualizar-evaluacion.dto';
import { CrearEvaluacionDto } from './dto/crear-evaluacion.dto';
import { RespuestaEvaluacionDto, RespuestaPaginadaEvaluacionDto } from './dto/respuesta-evaluacion.dto';

@ApiTags('evaluaciones')
@ApiBearerAuth()
@UseGuards(JwtGuardia, RolesGuardia)
@Roles(RolNombre.Admin)
@Controller('evaluaciones')
export class EvaluacionesControlador {
  constructor(private readonly evaluacionesServicio: EvaluacionesServicio) {}

  @Post()
  @Auditar('EVALUACION')
  @ApiOperation({ summary: 'Crear evaluación docente' })
  @ApiResponse({ status: 201, type: RespuestaEvaluacionDto })
  crear(@Body() dto: CrearEvaluacionDto): Promise<RespuestaEvaluacionDto> {
    return this.evaluacionesServicio.crear(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar evaluaciones paginado' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'size', required: false, example: 20 })
  @ApiResponse({ status: 200, type: RespuestaPaginadaEvaluacionDto })
  listar(
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('size', new ParseIntPipe({ optional: true })) size = 20,
  ): Promise<RespuestaPaginadaEvaluacionDto> {
    return this.evaluacionesServicio.listar(page, size);
  }

  @Get(':id')
  @ApiResponse({ status: 200, type: RespuestaEvaluacionDto })
  buscarPorId(@Param('id', ParseIntPipe) id: number): Promise<RespuestaEvaluacionDto> {
    return this.evaluacionesServicio.buscarPorId(id);
  }

  @Patch(':id')
  @Auditar('EVALUACION')
  @ApiResponse({ status: 200, type: RespuestaEvaluacionDto })
  actualizar(@Param('id', ParseIntPipe) id: number, @Body() dto: ActualizarEvaluacionDto): Promise<RespuestaEvaluacionDto> {
    return this.evaluacionesServicio.actualizar(id, dto);
  }

  @Delete(':id')
  @Auditar('EVALUACION')
  @HttpCode(HttpStatus.NO_CONTENT)
  eliminar(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.evaluacionesServicio.eliminar(id);
  }
}
