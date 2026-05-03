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
import { GenerarHorarioDto } from './dto/generar-horario.dto';
import { RespuestaHorarioDto, RespuestaPaginadaHorarioDto } from './dto/respuesta-horario.dto';
import { HorariosServicio } from './horarios.servicio';

@ApiTags('horarios')
@ApiBearerAuth()
@UseGuards(JwtGuardia, RolesGuardia)
@Controller('horarios')
export class HorariosControlador {
  constructor(private readonly horariosServicio: HorariosServicio) { }

  @Roles(RolNombre.Admin)
  @Post('generar')
  @Auditar('HORARIO')
  @ApiOperation({ summary: 'Generar horario con AG + Búsqueda Tabú + Gemini' })
  @ApiResponse({ status: 201, type: RespuestaHorarioDto })
  generar(@Body() dto: GenerarHorarioDto): Promise<RespuestaHorarioDto> {
    return this.horariosServicio.generar(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar horarios generados paginado' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'size', required: false, example: 20 })
  @ApiQuery({ name: 'archivado', required: false, type: Boolean })
  @ApiResponse({ status: 200, type: RespuestaPaginadaHorarioDto })
  listar(
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('size', new ParseIntPipe({ optional: true })) size = 20,
    @Query('archivado') archivado?: string,
  ): Promise<RespuestaPaginadaHorarioDto> {
    const isArchivado = archivado === 'true' ? true : archivado === 'false' ? false : undefined;
    return this.horariosServicio.listar(page, size, isArchivado);
  }

  @Roles(RolNombre.Admin)
  @Delete('historial')
  @Auditar('HORARIO')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar todos los horarios archivados' })
  @ApiResponse({ status: 204 })
  borrarHistorial(): Promise<void> {
    return this.horariosServicio.borrarHistorial();
  }

  @Roles(RolNombre.Admin)
  @Post('archivar-todos')
  @Auditar('HORARIO')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Archivar todos los horarios activos' })
  @ApiResponse({ status: 200 })
  archivarTodos(): Promise<void> {
    return this.horariosServicio.archivarTodos();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener horario por ID' })
  @ApiResponse({ status: 200, type: RespuestaHorarioDto })
  buscarPorId(@Param('id', ParseIntPipe) id: number): Promise<RespuestaHorarioDto> {
    return this.horariosServicio.buscarPorId(id);
  }

  @Roles(RolNombre.Admin)
  @Delete(':id')
  @Auditar('HORARIO')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar horario' })
  @ApiResponse({ status: 204 })
  eliminar(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.horariosServicio.eliminar(id);
  }
}
