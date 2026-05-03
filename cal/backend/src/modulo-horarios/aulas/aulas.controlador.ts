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
import { AulasServicio } from './aulas.servicio';
import { ActualizarAulaDto } from './dto/actualizar-aula.dto';
import { CrearAulaDto } from './dto/crear-aula.dto';
import { RespuestaAulaDto, RespuestaPaginadaAulaDto } from './dto/respuesta-aula.dto';

@ApiTags('aulas')
@ApiBearerAuth()
@UseGuards(JwtGuardia, RolesGuardia)
@Controller('aulas')
export class AulasControlador {
  constructor(private readonly aulasServicio: AulasServicio) {}

  @Roles(RolNombre.Admin)
  @Post()
  @Auditar('AULA')
  @ApiOperation({ summary: 'Crear aula' })
  @ApiResponse({ status: 201, type: RespuestaAulaDto })
  crear(@Body() dto: CrearAulaDto): Promise<RespuestaAulaDto> {
    return this.aulasServicio.crear(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar aulas paginado' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'size', required: false, example: 20 })
  @ApiResponse({ status: 200, type: RespuestaPaginadaAulaDto })
  listar(
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('size', new ParseIntPipe({ optional: true })) size = 20,
  ): Promise<RespuestaPaginadaAulaDto> {
    return this.aulasServicio.listar(page, size);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener aula por ID' })
  @ApiResponse({ status: 200, type: RespuestaAulaDto })
  buscarPorId(@Param('id', ParseIntPipe) id: number): Promise<RespuestaAulaDto> {
    return this.aulasServicio.buscarPorId(id);
  }

  @Roles(RolNombre.Admin)
  @Patch(':id')
  @Auditar('AULA')
  @ApiOperation({ summary: 'Actualizar aula' })
  @ApiResponse({ status: 200, type: RespuestaAulaDto })
  actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ActualizarAulaDto,
  ): Promise<RespuestaAulaDto> {
    return this.aulasServicio.actualizar(id, dto);
  }

  @Roles(RolNombre.Admin)
  @Delete(':id')
  @Auditar('AULA')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar aula' })
  @ApiResponse({ status: 204 })
  eliminar(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.aulasServicio.eliminar(id);
  }
}
