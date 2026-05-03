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
import { ActualizarFranjaDto } from './dto/actualizar-franja.dto';
import { CrearFranjaDto } from './dto/crear-franja.dto';
import { RespuestaFranjaDto, RespuestaPaginadaFranjaDto } from './dto/respuesta-franja.dto';
import { FranjasServicio } from './franjas.servicio';

@ApiTags('franjas-horarias')
@ApiBearerAuth()
@UseGuards(JwtGuardia, RolesGuardia)
@Controller('franjas-horarias')
export class FranjasControlador {
  constructor(private readonly franjasServicio: FranjasServicio) {}

  @Roles(RolNombre.Admin)
  @Post()
  @Auditar('FRANJA_HORARIA')
  @ApiOperation({ summary: 'Crear franja horaria' })
  @ApiResponse({ status: 201, type: RespuestaFranjaDto })
  crear(@Body() dto: CrearFranjaDto): Promise<RespuestaFranjaDto> {
    return this.franjasServicio.crear(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar franjas horarias paginado' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'size', required: false, example: 20 })
  @ApiResponse({ status: 200, type: RespuestaPaginadaFranjaDto })
  listar(
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('size', new ParseIntPipe({ optional: true })) size = 20,
  ): Promise<RespuestaPaginadaFranjaDto> {
    return this.franjasServicio.listar(page, size);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener franja horaria por ID' })
  @ApiResponse({ status: 200, type: RespuestaFranjaDto })
  buscarPorId(@Param('id', ParseIntPipe) id: number): Promise<RespuestaFranjaDto> {
    return this.franjasServicio.buscarPorId(id);
  }

  @Roles(RolNombre.Admin)
  @Patch(':id')
  @Auditar('FRANJA_HORARIA')
  @ApiOperation({ summary: 'Actualizar franja horaria' })
  @ApiResponse({ status: 200, type: RespuestaFranjaDto })
  actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ActualizarFranjaDto,
  ): Promise<RespuestaFranjaDto> {
    return this.franjasServicio.actualizar(id, dto);
  }

  @Roles(RolNombre.Admin)
  @Delete(':id')
  @Auditar('FRANJA_HORARIA')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar franja horaria' })
  @ApiResponse({ status: 204 })
  eliminar(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.franjasServicio.eliminar(id);
  }
}
