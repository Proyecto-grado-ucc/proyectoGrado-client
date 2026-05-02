import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtGuardia } from '../../seguridad/auth/guardias/jwt.guardia';
import { RolesGuardia } from '../../seguridad/auth/guardias/roles.guardia';
import { Auditar } from '../../seguridad/decoradores/auditar.decorador';
import { Roles } from '../../seguridad/decoradores/roles.decorador';
import { RolNombre } from '../../seguridad/entidades/rol.entidad';
import { ActualizarPreguntaDto } from './dto/actualizar-pregunta.dto';
import { CrearPreguntaDto } from './dto/crear-pregunta.dto';
import { RespuestaPaginadaPreguntaDto, RespuestaPreguntaDto } from './dto/respuesta-pregunta.dto';
import { PreguntasServicio } from './preguntas.servicio';

@ApiTags('preguntas')
@ApiBearerAuth()
@UseGuards(JwtGuardia, RolesGuardia)
@Roles(RolNombre.Admin)
@Controller('preguntas')
export class PreguntasControlador {
  constructor(private readonly preguntasServicio: PreguntasServicio) {}

  @Post()
  @Auditar('PREGUNTA')
  @ApiResponse({ status: 201, type: RespuestaPreguntaDto })
  crear(@Body() dto: CrearPreguntaDto): Promise<RespuestaPreguntaDto> {
    return this.preguntasServicio.crear(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar preguntas paginado' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'size', required: false, example: 20 })
  @ApiResponse({ status: 200, type: RespuestaPaginadaPreguntaDto })
  listar(
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('size', new ParseIntPipe({ optional: true })) size = 20,
  ): Promise<RespuestaPaginadaPreguntaDto> {
    return this.preguntasServicio.listar(page, size);
  }

  @Get(':id')
  @ApiResponse({ status: 200, type: RespuestaPreguntaDto })
  buscarPorId(@Param('id', ParseIntPipe) id: number): Promise<RespuestaPreguntaDto> {
    return this.preguntasServicio.buscarPorId(id);
  }

  @Patch(':id')
  @Auditar('PREGUNTA')
  @ApiResponse({ status: 200, type: RespuestaPreguntaDto })
  actualizar(@Param('id', ParseIntPipe) id: number, @Body() dto: ActualizarPreguntaDto): Promise<RespuestaPreguntaDto> {
    return this.preguntasServicio.actualizar(id, dto);
  }

  @Delete(':id')
  @Auditar('PREGUNTA')
  @HttpCode(HttpStatus.NO_CONTENT)
  eliminar(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.preguntasServicio.eliminar(id);
  }
}
