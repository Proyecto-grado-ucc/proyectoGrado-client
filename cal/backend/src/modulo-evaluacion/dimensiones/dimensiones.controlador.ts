import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtGuardia } from '../../seguridad/auth/guardias/jwt.guardia';
import { RolesGuardia } from '../../seguridad/auth/guardias/roles.guardia';
import { Auditar } from '../../seguridad/decoradores/auditar.decorador';
import { Roles } from '../../seguridad/decoradores/roles.decorador';
import { RolNombre } from '../../seguridad/entidades/rol.entidad';
import { DimensionesServicio } from './dimensiones.servicio';
import { ActualizarDimensionDto } from './dto/actualizar-dimension.dto';
import { CrearDimensionDto } from './dto/crear-dimension.dto';
import { RespuestaDimensionDto, RespuestaPaginadaDimensionDto } from './dto/respuesta-dimension.dto';

@ApiTags('dimensiones')
@ApiBearerAuth()
@UseGuards(JwtGuardia, RolesGuardia)
@Roles(RolNombre.Admin)
@Controller('dimensiones')
export class DimensionesControlador {
  constructor(private readonly dimensionesServicio: DimensionesServicio) {}

  @Post()
  @Auditar('DIMENSION')
  @ApiResponse({ status: 201, type: RespuestaDimensionDto })
  crear(@Body() dto: CrearDimensionDto): Promise<RespuestaDimensionDto> {
    return this.dimensionesServicio.crear(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar dimensiones paginado' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'size', required: false, example: 20 })
  @ApiResponse({ status: 200, type: RespuestaPaginadaDimensionDto })
  listar(
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('size', new ParseIntPipe({ optional: true })) size = 20,
  ): Promise<RespuestaPaginadaDimensionDto> {
    return this.dimensionesServicio.listar(page, size);
  }

  @Get(':id')
  @ApiResponse({ status: 200, type: RespuestaDimensionDto })
  buscarPorId(@Param('id', ParseIntPipe) id: number): Promise<RespuestaDimensionDto> {
    return this.dimensionesServicio.buscarPorId(id);
  }

  @Patch(':id')
  @Auditar('DIMENSION')
  @ApiResponse({ status: 200, type: RespuestaDimensionDto })
  actualizar(@Param('id', ParseIntPipe) id: number, @Body() dto: ActualizarDimensionDto): Promise<RespuestaDimensionDto> {
    return this.dimensionesServicio.actualizar(id, dto);
  }

  @Delete(':id')
  @Auditar('DIMENSION')
  @HttpCode(HttpStatus.NO_CONTENT)
  eliminar(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.dimensionesServicio.eliminar(id);
  }
}
