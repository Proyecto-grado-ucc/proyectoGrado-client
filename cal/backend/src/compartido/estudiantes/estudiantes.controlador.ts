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
import { ActualizarEstudianteDto } from './dto/actualizar-estudiante.dto';
import { CrearEstudianteDto } from './dto/crear-estudiante.dto';
import { RespuestaEstudianteDto, RespuestaPaginadaEstudianteDto } from './dto/respuesta-estudiante.dto';
import { EstudiantesServicio } from './estudiantes.servicio';

@ApiTags('estudiantes')
@ApiBearerAuth()
@UseGuards(JwtGuardia, RolesGuardia)
@Controller('estudiantes')
export class EstudiantesControlador {
  constructor(private readonly estudiantesServicio: EstudiantesServicio) {}

  @Roles(RolNombre.Admin)
  @Post()
  @Auditar('ESTUDIANTE')
  @ApiOperation({ summary: 'Crear estudiante' })
  @ApiResponse({ status: 201, type: RespuestaEstudianteDto })
  crear(@Body() dto: CrearEstudianteDto): Promise<RespuestaEstudianteDto> {
    return this.estudiantesServicio.crear(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar estudiantes paginado' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'size', required: false, example: 20 })
  @ApiResponse({ status: 200, type: RespuestaPaginadaEstudianteDto })
  listar(
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('size', new ParseIntPipe({ optional: true })) size = 20,
  ): Promise<RespuestaPaginadaEstudianteDto> {
    return this.estudiantesServicio.listar(page, size);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener estudiante por ID' })
  @ApiResponse({ status: 200, type: RespuestaEstudianteDto })
  buscarPorId(@Param('id', ParseIntPipe) id: number): Promise<RespuestaEstudianteDto> {
    return this.estudiantesServicio.buscarPorId(id);
  }

  @Roles(RolNombre.Admin)
  @Patch(':id')
  @Auditar('ESTUDIANTE')
  @ApiOperation({ summary: 'Actualizar estudiante' })
  @ApiResponse({ status: 200, type: RespuestaEstudianteDto })
  actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ActualizarEstudianteDto,
  ): Promise<RespuestaEstudianteDto> {
    return this.estudiantesServicio.actualizar(id, dto);
  }

  @Roles(RolNombre.Admin)
  @Delete(':id')
  @Auditar('ESTUDIANTE')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar estudiante' })
  @ApiResponse({ status: 204 })
  eliminar(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.estudiantesServicio.eliminar(id);
  }
}
