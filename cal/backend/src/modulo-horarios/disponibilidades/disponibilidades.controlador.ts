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
import { DisponibilidadesServicio } from './disponibilidades.servicio';
import { ActualizarDisponibilidadDto } from './dto/actualizar-disponibilidad.dto';
import { CrearDisponibilidadDto } from './dto/crear-disponibilidad.dto';
import { RespuestaDisponibilidadDto, RespuestaPaginadaDisponibilidadDto } from './dto/respuesta-disponibilidad.dto';

@ApiTags('disponibilidades')
@ApiBearerAuth()
@UseGuards(JwtGuardia, RolesGuardia)
@Controller('disponibilidades')
export class DisponibilidadesControlador {
  constructor(private readonly disponibilidadesServicio: DisponibilidadesServicio) {}

  @Roles(RolNombre.Admin)
  @Post()
  @Auditar('DISPONIBILIDAD')
  @ApiOperation({ summary: 'Registrar disponibilidad de docente' })
  @ApiResponse({ status: 201, type: RespuestaDisponibilidadDto })
  crear(@Body() dto: CrearDisponibilidadDto): Promise<RespuestaDisponibilidadDto> {
    return this.disponibilidadesServicio.crear(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar disponibilidades paginado' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'size', required: false, example: 20 })
  @ApiResponse({ status: 200, type: RespuestaPaginadaDisponibilidadDto })
  listar(
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('size', new ParseIntPipe({ optional: true })) size = 20,
  ): Promise<RespuestaPaginadaDisponibilidadDto> {
    return this.disponibilidadesServicio.listar(page, size);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener disponibilidad por ID' })
  @ApiResponse({ status: 200, type: RespuestaDisponibilidadDto })
  buscarPorId(@Param('id', ParseIntPipe) id: number): Promise<RespuestaDisponibilidadDto> {
    return this.disponibilidadesServicio.buscarPorId(id);
  }

  @Roles(RolNombre.Admin)
  @Patch(':id')
  @Auditar('DISPONIBILIDAD')
  @ApiOperation({ summary: 'Actualizar disponibilidad' })
  @ApiResponse({ status: 200, type: RespuestaDisponibilidadDto })
  actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ActualizarDisponibilidadDto,
  ): Promise<RespuestaDisponibilidadDto> {
    return this.disponibilidadesServicio.actualizar(id, dto);
  }

  @Roles(RolNombre.Admin)
  @Delete(':id')
  @Auditar('DISPONIBILIDAD')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar disponibilidad' })
  @ApiResponse({ status: 204 })
  eliminar(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.disponibilidadesServicio.eliminar(id);
  }
}
