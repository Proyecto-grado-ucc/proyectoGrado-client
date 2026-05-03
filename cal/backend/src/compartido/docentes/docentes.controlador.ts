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
import { ActualizarDocenteDto } from './dto/actualizar-docente.dto';
import { CrearDocenteDto } from './dto/crear-docente.dto';
import { RespuestaDocenteDto, RespuestaPaginadaDocenteDto } from './dto/respuesta-docente.dto';
import { DocentesServicio } from './docentes.servicio';

@ApiTags('docentes')
@ApiBearerAuth()
@UseGuards(JwtGuardia, RolesGuardia)
@Controller('docentes')
export class DocentesControlador {
  constructor(private readonly docentesServicio: DocentesServicio) {}

  @Roles(RolNombre.Admin)
  @Post()
  @Auditar('DOCENTE')
  @ApiOperation({ summary: 'Crear docente' })
  @ApiResponse({ status: 201, type: RespuestaDocenteDto })
  crear(@Body() dto: CrearDocenteDto): Promise<RespuestaDocenteDto> {
    return this.docentesServicio.crear(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar docentes paginado' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'size', required: false, example: 20 })
  @ApiResponse({ status: 200, type: RespuestaPaginadaDocenteDto })
  listar(
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('size', new ParseIntPipe({ optional: true })) size = 20,
  ): Promise<RespuestaPaginadaDocenteDto> {
    return this.docentesServicio.listar(page, size);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener docente por ID' })
  @ApiResponse({ status: 200, type: RespuestaDocenteDto })
  buscarPorId(@Param('id', ParseIntPipe) id: number): Promise<RespuestaDocenteDto> {
    return this.docentesServicio.buscarPorId(id);
  }

  @Roles(RolNombre.Admin)
  @Patch(':id')
  @Auditar('DOCENTE')
  @ApiOperation({ summary: 'Actualizar docente' })
  @ApiResponse({ status: 200, type: RespuestaDocenteDto })
  actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ActualizarDocenteDto,
  ): Promise<RespuestaDocenteDto> {
    return this.docentesServicio.actualizar(id, dto);
  }

  @Roles(RolNombre.Admin)
  @Delete(':id')
  @Auditar('DOCENTE')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar docente' })
  @ApiResponse({ status: 204 })
  eliminar(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.docentesServicio.eliminar(id);
  }
}
