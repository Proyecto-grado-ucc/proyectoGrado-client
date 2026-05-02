import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtGuardia } from '../../seguridad/auth/guardias/jwt.guardia';
import { RolesGuardia } from '../../seguridad/auth/guardias/roles.guardia';
import { Auditar } from '../../seguridad/decoradores/auditar.decorador';
import { Roles } from '../../seguridad/decoradores/roles.decorador';
import { RolNombre } from '../../seguridad/entidades/rol.entidad';
import { ActualizarFormularioDto } from './dto/actualizar-formulario.dto';
import { CrearFormularioDto } from './dto/crear-formulario.dto';
import { RespuestaFormularioDto, RespuestaPaginadaFormularioDto } from './dto/respuesta-formulario.dto';
import { FormulariosServicio } from './formularios.servicio';

@ApiTags('formularios')
@ApiBearerAuth()
@UseGuards(JwtGuardia, RolesGuardia)
@Roles(RolNombre.Admin)
@Controller('formularios')
export class FormulariosControlador {
  constructor(private readonly formulariosServicio: FormulariosServicio) {}

  @Post()
  @Auditar('FORMULARIO')
  @ApiOperation({ summary: 'Crear formulario de evaluación' })
  @ApiResponse({ status: 201, type: RespuestaFormularioDto })
  crear(@Body() dto: CrearFormularioDto): Promise<RespuestaFormularioDto> {
    return this.formulariosServicio.crear(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar formularios paginado' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'size', required: false, example: 20 })
  @ApiResponse({ status: 200, type: RespuestaPaginadaFormularioDto })
  listar(
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('size', new ParseIntPipe({ optional: true })) size = 20,
  ): Promise<RespuestaPaginadaFormularioDto> {
    return this.formulariosServicio.listar(page, size);
  }

  @Get(':id')
  @ApiResponse({ status: 200, type: RespuestaFormularioDto })
  buscarPorId(@Param('id', ParseIntPipe) id: number): Promise<RespuestaFormularioDto> {
    return this.formulariosServicio.buscarPorId(id);
  }

  @Patch(':id')
  @Auditar('FORMULARIO')
  @ApiResponse({ status: 200, type: RespuestaFormularioDto })
  actualizar(@Param('id', ParseIntPipe) id: number, @Body() dto: ActualizarFormularioDto): Promise<RespuestaFormularioDto> {
    return this.formulariosServicio.actualizar(id, dto);
  }

  @Delete(':id')
  @Auditar('FORMULARIO')
  @HttpCode(HttpStatus.NO_CONTENT)
  eliminar(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.formulariosServicio.eliminar(id);
  }
}
