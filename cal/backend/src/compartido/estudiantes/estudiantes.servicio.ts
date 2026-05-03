import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from '../../seguridad/entidades/usuario.entidad';
import { Grupo } from '../../modulo-horarios/entidades/grupo.entidad';
import { Estudiante } from '../entidades/estudiante.entidad';
import { ActualizarEstudianteDto } from './dto/actualizar-estudiante.dto';
import { CrearEstudianteDto } from './dto/crear-estudiante.dto';
import { RespuestaEstudianteDto, RespuestaPaginadaEstudianteDto } from './dto/respuesta-estudiante.dto';

@Injectable()
export class EstudiantesServicio {
  constructor(
    @InjectRepository(Estudiante)
    private readonly estudianteRepo: Repository<Estudiante>,
    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,
    @InjectRepository(Grupo)
    private readonly grupoRepo: Repository<Grupo>,
  ) {}

  async crear(dto: CrearEstudianteDto): Promise<RespuestaEstudianteDto> {
    const usuario = await this.usuarioRepo.findOne({ where: { id: dto.usuarioId } });
    if (!usuario) throw new NotFoundException(`Usuario ${dto.usuarioId} no encontrado`);

    const estudiante = this.estudianteRepo.create({
      usuario,
      grupoId: dto.grupoId ?? null,
    });
    return this.mapear(await this.estudianteRepo.save(estudiante));
  }

  async matricular(usuarioId: number, codigoAcceso: string): Promise<{ mensaje: string }> {
    if (!codigoAcceso) throw new NotFoundException('Código de acceso no proporcionado');
    const grupo = await this.grupoRepo.findOne({ where: { codigoAcceso } });
    if (!grupo) throw new NotFoundException('Código de clase inválido o grupo no encontrado');

    const estudiante = await this.estudianteRepo.findOne({ where: { usuario: { id: usuarioId } } });
    if (!estudiante) throw new NotFoundException('Estudiante no encontrado para este usuario');

    estudiante.grupoId = grupo.id;
    await this.estudianteRepo.save(estudiante);
    return { mensaje: 'Matriculado exitosamente' };
  }

  async listar(page: number, size: number): Promise<RespuestaPaginadaEstudianteDto> {
    const [items, total] = await this.estudianteRepo.findAndCount({
      skip: (page - 1) * size,
      take: size,
    });
    return { items: items.map((e) => this.mapear(e)), total, page, size };
  }

  async buscarPorId(id: number): Promise<RespuestaEstudianteDto> {
    const e = await this.estudianteRepo.findOne({ where: { id } });
    if (!e) throw new NotFoundException(`Estudiante ${id} no encontrado`);
    return this.mapear(e);
  }

  async actualizar(id: number, dto: ActualizarEstudianteDto): Promise<RespuestaEstudianteDto> {
    const e = await this.estudianteRepo.findOne({ where: { id } });
    if (!e) throw new NotFoundException(`Estudiante ${id} no encontrado`);

    if (dto.usuarioId !== undefined) {
      const usuario = await this.usuarioRepo.findOne({ where: { id: dto.usuarioId } });
      if (!usuario) throw new NotFoundException(`Usuario ${dto.usuarioId} no encontrado`);
      e.usuario = usuario;
    }
    if (dto.grupoId !== undefined) e.grupoId = dto.grupoId ?? null;

    return this.mapear(await this.estudianteRepo.save(e));
  }

  async eliminar(id: number): Promise<void> {
    const e = await this.estudianteRepo.findOne({ where: { id } });
    if (!e) throw new NotFoundException(`Estudiante ${id} no encontrado`);
    await this.estudianteRepo.remove(e);
  }

  private mapear(e: Estudiante): RespuestaEstudianteDto {
    return {
      id: e.id,
      usuarioId: e.usuario.id,
      usuarioNombre: e.usuario.nombre,
      usuarioEmail: e.usuario.email,
      grupoId: e.grupoId,
    };
  }
}
