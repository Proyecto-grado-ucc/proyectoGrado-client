import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtGuardia } from '../../seguridad/auth/guardias/jwt.guardia';
import { RolesGuardia } from '../../seguridad/auth/guardias/roles.guardia';
import { Auditar } from '../../seguridad/decoradores/auditar.decorador';
import { Roles } from '../../seguridad/decoradores/roles.decorador';
import { RolNombre } from '../../seguridad/entidades/rol.entidad';
import { UsuarioAutenticado } from '../../seguridad/auth/estrategias/jwt.estrategia';
import { UsuarioActual } from '../../seguridad/decoradores/usuario-actual.decorador';
import { GenerarHorarioDto } from './dto/generar-horario.dto';
import { IngresarHorarioDto } from './dto/ingresar-horario.dto';
import { RespuestaHorarioDto, RespuestaPaginadaHorarioDto } from './dto/respuesta-horario.dto';
import { HorariosServicio } from './horarios.servicio';

@ApiTags('horarios')
@ApiBearerAuth()
@UseGuards(JwtGuardia, RolesGuardia)
@Controller('horarios')
export class HorariosControlador {
  constructor(private readonly horariosServicio: HorariosServicio) {}

  // ─── ADMIN ────────────────────────────────────────────────────────────────

  @Post('generar')
  @Roles(RolNombre.Admin)
  @Auditar('HORARIO')
  @ApiOperation({ summary: 'Generar horario con AG + Búsqueda Tabú + Gemini' })
  @ApiResponse({ status: 201, type: RespuestaHorarioDto })
  generar(@Body() dto: GenerarHorarioDto): Promise<RespuestaHorarioDto> {
    return this.horariosServicio.generar(dto);
  }

  @Get()
  @Roles(RolNombre.Admin, RolNombre.Docente)
  @ApiOperation({ summary: 'Listar horarios generados paginado' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'size', required: false, example: 20 })
  @ApiResponse({ status: 200, type: RespuestaPaginadaHorarioDto })
  listar(
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('size', new ParseIntPipe({ optional: true })) size = 20,
  ): Promise<RespuestaPaginadaHorarioDto> {
    return this.horariosServicio.listar(page, size);
  }

  @Get(':id')
  @Roles(RolNombre.Admin, RolNombre.Docente)
  @ApiOperation({ summary: 'Obtener horario por ID' })
  @ApiResponse({ status: 200, type: RespuestaHorarioDto })
  buscarPorId(@Param('id', ParseIntPipe) id: number): Promise<RespuestaHorarioDto> {
    return this.horariosServicio.buscarPorId(id);
  }

  @Delete(':id')
  @Roles(RolNombre.Admin)
  @Auditar('HORARIO')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar horario' })
  @ApiResponse({ status: 204 })
  eliminar(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.horariosServicio.eliminar(id);
  }

  // ─── ESTUDIANTE ───────────────────────────────────────────────────────────

  @Post('ingresar')
  @Roles(RolNombre.Estudiante)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Estudiante ingresa al horario con el codigo de acceso' })
  @ApiResponse({ status: 200, schema: { properties: { mensaje: { type: 'string' }, horario: { $ref: '#/components/schemas/RespuestaHorarioDto' } } } })
  @ApiResponse({ status: 400, description: 'Codigo invalido' })
  ingresar(
    @Body() dto: IngresarHorarioDto,
    @UsuarioActual() usuario: UsuarioAutenticado,
  ): Promise<{ mensaje: string; horario: RespuestaHorarioDto }> {
    return this.horariosServicio.ingresarConCodigo(dto, usuario.id);
  }

  @Get('estudiante/mi-horario')
  @Roles(RolNombre.Estudiante)
  @ApiOperation({ summary: 'Obtener el horario al que esta inscrito el estudiante autenticado' })
  @ApiResponse({ status: 200, type: RespuestaHorarioDto })
  miHorario(
    @UsuarioActual() usuario: UsuarioAutenticado,
  ): Promise<RespuestaHorarioDto | null> {
    return this.horariosServicio.obtenerMiHorario(usuario.id);
  }
}
