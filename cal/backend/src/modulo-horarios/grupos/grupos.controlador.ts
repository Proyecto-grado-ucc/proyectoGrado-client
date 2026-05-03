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
import { ActualizarGrupoDto } from './dto/actualizar-grupo.dto';
import { CrearGrupoDto } from './dto/crear-grupo.dto';
import { RespuestaGrupoDto, RespuestaPaginadaGrupoDto } from './dto/respuesta-grupo.dto';
import { GruposServicio } from './grupos.servicio';

@ApiTags('grupos')
@ApiBearerAuth()
@UseGuards(JwtGuardia, RolesGuardia)
@Controller('grupos')
export class GruposControlador {
  constructor(private readonly gruposServicio: GruposServicio) {}

  @Roles(RolNombre.Admin)
  @Post()
  @Auditar('GRUPO')
  @ApiOperation({ summary: 'Crear grupo' })
  @ApiResponse({ status: 201, type: RespuestaGrupoDto })
  crear(@Body() dto: CrearGrupoDto): Promise<RespuestaGrupoDto> {
    return this.gruposServicio.crear(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar grupos paginado' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'size', required: false, example: 20 })
  @ApiResponse({ status: 200, type: RespuestaPaginadaGrupoDto })
  listar(
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('size', new ParseIntPipe({ optional: true })) size = 20,
  ): Promise<RespuestaPaginadaGrupoDto> {
    return this.gruposServicio.listar(page, size);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener grupo por ID' })
  @ApiResponse({ status: 200, type: RespuestaGrupoDto })
  buscarPorId(@Param('id', ParseIntPipe) id: number): Promise<RespuestaGrupoDto> {
    return this.gruposServicio.buscarPorId(id);
  }

  @Roles(RolNombre.Admin)
  @Patch(':id')
  @Auditar('GRUPO')
  @ApiOperation({ summary: 'Actualizar grupo' })
  @ApiResponse({ status: 200, type: RespuestaGrupoDto })
  actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ActualizarGrupoDto,
  ): Promise<RespuestaGrupoDto> {
    return this.gruposServicio.actualizar(id, dto);
  }

  @Roles(RolNombre.Admin)
  @Delete(':id')
  @Auditar('GRUPO')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar grupo' })
  @ApiResponse({ status: 204 })
  eliminar(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.gruposServicio.eliminar(id);
  }
}
