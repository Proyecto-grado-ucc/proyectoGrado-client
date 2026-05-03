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
import { ActualizarNivelDto } from './dto/actualizar-nivel.dto';
import { CrearNivelDto } from './dto/crear-nivel.dto';
import { RespuestaNivelDto, RespuestaPaginadaNivelDto } from './dto/respuesta-nivel.dto';
import { NivelesServicio } from './niveles.servicio';

@ApiTags('niveles')
@ApiBearerAuth()
@UseGuards(JwtGuardia, RolesGuardia)
@Controller('niveles')
export class NivelesControlador {
  constructor(private readonly nivelesServicio: NivelesServicio) {}

  @Roles(RolNombre.Admin)
  @Post()
  @Auditar('NIVEL_IDIOMA')
  @ApiOperation({ summary: 'Crear nivel de idioma' })
  @ApiResponse({ status: 201, type: RespuestaNivelDto })
  crear(@Body() dto: CrearNivelDto): Promise<RespuestaNivelDto> {
    return this.nivelesServicio.crear(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar niveles paginado' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'size', required: false, example: 20 })
  @ApiResponse({ status: 200, type: RespuestaPaginadaNivelDto })
  listar(
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('size', new ParseIntPipe({ optional: true })) size = 20,
  ): Promise<RespuestaPaginadaNivelDto> {
    return this.nivelesServicio.listar(page, size);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener nivel por ID' })
  @ApiResponse({ status: 200, type: RespuestaNivelDto })
  buscarPorId(@Param('id', ParseIntPipe) id: number): Promise<RespuestaNivelDto> {
    return this.nivelesServicio.buscarPorId(id);
  }

  @Roles(RolNombre.Admin)
  @Patch(':id')
  @Auditar('NIVEL_IDIOMA')
  @ApiOperation({ summary: 'Actualizar nivel' })
  @ApiResponse({ status: 200, type: RespuestaNivelDto })
  actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ActualizarNivelDto,
  ): Promise<RespuestaNivelDto> {
    return this.nivelesServicio.actualizar(id, dto);
  }

  @Roles(RolNombre.Admin)
  @Delete(':id')
  @Auditar('NIVEL_IDIOMA')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar nivel' })
  @ApiResponse({ status: 204 })
  eliminar(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.nivelesServicio.eliminar(id);
  }
}
