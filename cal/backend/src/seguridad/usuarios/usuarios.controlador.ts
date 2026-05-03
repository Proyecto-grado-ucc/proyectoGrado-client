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
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtGuardia } from '../auth/guardias/jwt.guardia';
import { RolesGuardia } from '../auth/guardias/roles.guardia';
import { Auditar } from '../decoradores/auditar.decorador';
import { Roles } from '../decoradores/roles.decorador';
import { RolNombre } from '../entidades/rol.entidad';
import { ActualizarUsuarioDto } from './dto/actualizar-usuario.dto';
import { CrearUsuarioDto } from './dto/crear-usuario.dto';
import { RespuestaPaginadaUsuarioDto, RespuestaUsuarioDto } from './dto/respuesta-usuario.dto';
import { UsuariosServicio } from './usuarios.servicio';

@ApiTags('usuarios')
@ApiBearerAuth()
@UseGuards(JwtGuardia, RolesGuardia)
@Controller('usuarios')
export class UsuariosControlador {
  constructor(private readonly usuariosServicio: UsuariosServicio) {}

  @Roles(RolNombre.Admin)
  @Post()
  @Auditar('USUARIO')
  @ApiOperation({ summary: 'Crear usuario' })
  @ApiResponse({ status: 201, type: RespuestaUsuarioDto })
  crear(@Body() dto: CrearUsuarioDto): Promise<RespuestaUsuarioDto> {
    return this.usuariosServicio.crear(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar usuarios paginado' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'size', required: false, example: 20 })
  @ApiResponse({ status: 200, type: RespuestaPaginadaUsuarioDto })
  listar(
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('size', new ParseIntPipe({ optional: true })) size = 20,
  ): Promise<RespuestaPaginadaUsuarioDto> {
    return this.usuariosServicio.listar(page, size);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener usuario por ID' })
  @ApiResponse({ status: 200, type: RespuestaUsuarioDto })
  buscarPorId(@Param('id', ParseIntPipe) id: number): Promise<RespuestaUsuarioDto> {
    return this.usuariosServicio.buscarPorId(id);
  }

  @Roles(RolNombre.Admin)
  @Patch(':id')
  @Auditar('USUARIO')
  @ApiOperation({ summary: 'Actualizar usuario' })
  @ApiResponse({ status: 200, type: RespuestaUsuarioDto })
  actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ActualizarUsuarioDto,
  ): Promise<RespuestaUsuarioDto> {
    return this.usuariosServicio.actualizar(id, dto);
  }

  @Roles(RolNombre.Admin)
  @Delete(':id')
  @Auditar('USUARIO')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar usuario' })
  @ApiResponse({ status: 204 })
  eliminar(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.usuariosServicio.eliminar(id);
  }
}
