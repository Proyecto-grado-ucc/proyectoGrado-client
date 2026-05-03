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
import { ActualizarPeriodoDto } from './dto/actualizar-periodo.dto';
import { CrearPeriodoDto } from './dto/crear-periodo.dto';
import { RespuestaPaginadaPeriodoDto, RespuestaPeriodoDto } from './dto/respuesta-periodo.dto';
import { PeriodosServicio } from './periodos.servicio';

@ApiTags('periodos')
@ApiBearerAuth()
@UseGuards(JwtGuardia, RolesGuardia)
@Controller('periodos')
export class PeriodosControlador {
  constructor(private readonly periodosServicio: PeriodosServicio) {}

  @Roles(RolNombre.Admin)
  @Post()
  @Auditar('PERIODO_ACADEMICO')
  @ApiOperation({ summary: 'Crear periodo académico' })
  @ApiResponse({ status: 201, type: RespuestaPeriodoDto })
  crear(@Body() dto: CrearPeriodoDto): Promise<RespuestaPeriodoDto> {
    return this.periodosServicio.crear(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar periodos paginado' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'size', required: false, example: 20 })
  @ApiResponse({ status: 200, type: RespuestaPaginadaPeriodoDto })
  listar(
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('size', new ParseIntPipe({ optional: true })) size = 20,
  ): Promise<RespuestaPaginadaPeriodoDto> {
    return this.periodosServicio.listar(page, size);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener periodo por ID' })
  @ApiResponse({ status: 200, type: RespuestaPeriodoDto })
  buscarPorId(@Param('id', ParseIntPipe) id: number): Promise<RespuestaPeriodoDto> {
    return this.periodosServicio.buscarPorId(id);
  }

  @Roles(RolNombre.Admin)
  @Patch(':id')
  @Auditar('PERIODO_ACADEMICO')
  @ApiOperation({ summary: 'Actualizar periodo' })
  @ApiResponse({ status: 200, type: RespuestaPeriodoDto })
  actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ActualizarPeriodoDto,
  ): Promise<RespuestaPeriodoDto> {
    return this.periodosServicio.actualizar(id, dto);
  }

  @Roles(RolNombre.Admin)
  @Delete(':id')
  @Auditar('PERIODO_ACADEMICO')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar periodo' })
  @ApiResponse({ status: 204 })
  eliminar(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.periodosServicio.eliminar(id);
  }
}
