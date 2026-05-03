import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
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
import { CursosServicio } from './cursos.servicio';
import { ActualizarCursoDto } from './dto/actualizar-curso.dto';
import { CrearCursoDto } from './dto/crear-curso.dto';
import { RespuestaCursoDto, RespuestaPaginadaCursoDto } from './dto/respuesta-curso.dto';

@ApiTags('cursos')
@ApiBearerAuth()
@UseGuards(JwtGuardia, RolesGuardia)
@Controller('cursos')
export class CursosControlador {
  constructor(private readonly cursosServicio: CursosServicio) {}

  @Roles(RolNombre.Admin)
  @Post()
  @Auditar('CURSO')
  @ApiOperation({ summary: 'Crear curso' })
  @ApiResponse({ status: 201, type: RespuestaCursoDto })
  crear(@Body() dto: CrearCursoDto): Promise<RespuestaCursoDto> {
    return this.cursosServicio.crear(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar cursos paginado' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'size', required: false, example: 20 })
  @ApiResponse({ status: 200, type: RespuestaPaginadaCursoDto })
  listar(
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('size', new ParseIntPipe({ optional: true })) size = 20,
  ): Promise<RespuestaPaginadaCursoDto> {
    return this.cursosServicio.listar(page, size);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener curso por ID' })
  @ApiResponse({ status: 200, type: RespuestaCursoDto })
  buscarPorId(@Param('id', ParseIntPipe) id: number): Promise<RespuestaCursoDto> {
    return this.cursosServicio.buscarPorId(id);
  }

  @Roles(RolNombre.Admin)
  @Patch(':id')
  @Auditar('CURSO')
  @ApiOperation({ summary: 'Actualizar curso' })
  @ApiResponse({ status: 200, type: RespuestaCursoDto })
  actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ActualizarCursoDto,
  ): Promise<RespuestaCursoDto> {
    return this.cursosServicio.actualizar(id, dto);
  }

  @Roles(RolNombre.Admin)
  @Delete(':id')
  @Auditar('CURSO')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar curso' })
  @ApiResponse({ status: 204 })
  eliminar(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.cursosServicio.eliminar(id);
  }
}
