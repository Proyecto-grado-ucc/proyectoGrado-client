import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtGuardia } from '../../seguridad/auth/guardias/jwt.guardia';
import { RolesGuardia } from '../../seguridad/auth/guardias/roles.guardia';
import { Auditar } from '../../seguridad/decoradores/auditar.decorador';
import { Roles } from '../../seguridad/decoradores/roles.decorador';
import { RolNombre } from '../../seguridad/entidades/rol.entidad';
import { UsuarioAutenticado } from '../../seguridad/auth/estrategias/jwt.estrategia';
import { UsuarioActual } from '../../seguridad/decoradores/usuario-actual.decorador';
import { EvaluacionesServicio } from './evaluaciones.servicio';
import { ActualizarEvaluacionDto } from './dto/actualizar-evaluacion.dto';
import { CrearEvaluacionDto } from './dto/crear-evaluacion.dto';
import { RespuestaEvaluacionDto, RespuestaPaginadaEvaluacionDto } from './dto/respuesta-evaluacion.dto';

@ApiTags('evaluaciones')
@ApiBearerAuth()
@UseGuards(JwtGuardia, RolesGuardia)
@Controller('evaluaciones')
export class EvaluacionesControlador {
  constructor(private readonly evaluacionesServicio: EvaluacionesServicio) {}

  // ─── ADMIN ────────────────────────────────────────────────────────────────

  @Post()
  @Roles(RolNombre.Admin)
  @Auditar('EVALUACION')
  @ApiOperation({ summary: 'Crear evaluación docente' })
  @ApiResponse({ status: 201, type: RespuestaEvaluacionDto })
  crear(@Body() dto: CrearEvaluacionDto): Promise<RespuestaEvaluacionDto> {
    return this.evaluacionesServicio.crear(dto);
  }

  @Get()
  @Roles(RolNombre.Admin)
  @ApiOperation({ summary: 'Listar evaluaciones paginado (solo Admin)' })
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
  @Roles(RolNombre.Admin)
  @ApiResponse({ status: 200, type: RespuestaEvaluacionDto })
  buscarPorId(@Param('id', ParseIntPipe) id: number): Promise<RespuestaEvaluacionDto> {
    return this.evaluacionesServicio.buscarPorId(id);
  }

  @Delete(':id')
  @Roles(RolNombre.Admin)
  @Auditar('EVALUACION')
  @HttpCode(HttpStatus.NO_CONTENT)
  eliminar(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.evaluacionesServicio.eliminar(id);
  }

  // ─── ADMIN + ESTUDIANTE ───────────────────────────────────────────────────

  @Patch(':id')
  @Roles(RolNombre.Admin, RolNombre.Estudiante)
  @Auditar('EVALUACION')
  @ApiOperation({ summary: 'Actualizar estado de evaluación (Admin o Estudiante que la completó)' })
  @ApiResponse({ status: 200, type: RespuestaEvaluacionDto })
  actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ActualizarEvaluacionDto,
  ): Promise<RespuestaEvaluacionDto> {
    return this.evaluacionesServicio.actualizar(id, dto);
  }

  // ─── ESTUDIANTE ───────────────────────────────────────────────────────────

  @Get('estudiante/mis-evaluaciones')
  @Roles(RolNombre.Estudiante)
  @ApiOperation({ summary: 'Evaluaciones de los docentes del horario del estudiante autenticado' })
  @ApiResponse({ status: 200, type: [RespuestaEvaluacionDto] })
  misEvaluaciones(
    @UsuarioActual() usuario: UsuarioAutenticado,
  ): Promise<RespuestaEvaluacionDto[]> {
    return this.evaluacionesServicio.misEvaluaciones(usuario.id);
  }
}
