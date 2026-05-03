import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Curso } from '../entidades/curso.entidad';
import { Grupo } from '../entidades/grupo.entidad';
import { ActualizarGrupoDto } from './dto/actualizar-grupo.dto';
import { CrearGrupoDto } from './dto/crear-grupo.dto';
import { RespuestaGrupoDto, RespuestaPaginadaGrupoDto } from './dto/respuesta-grupo.dto';

@Injectable()
export class GruposServicio {
  constructor(
    @InjectRepository(Grupo)
    private readonly grupoRepo: Repository<Grupo>,
    @InjectRepository(Curso)
    private readonly cursoRepo: Repository<Curso>,
  ) {}

  async crear(dto: CrearGrupoDto): Promise<RespuestaGrupoDto> {
    const curso = await this.cursoRepo.findOne({ where: { id: dto.cursoId } });
    if (!curso) throw new NotFoundException(`Curso ${dto.cursoId} no encontrado`);

    const codigoAcceso = Math.random().toString(36).substring(2, 8).toUpperCase();
    const grupo = this.grupoRepo.create({ codigo: dto.codigo, curso, cupoMax: dto.cupoMax, jornada: dto.jornada, codigoAcceso });
    return this.mapear(await this.grupoRepo.save(grupo));
  }

  async listar(page: number, size: number): Promise<RespuestaPaginadaGrupoDto> {
    const [items, total] = await this.grupoRepo.findAndCount({
      order: { codigo: 'ASC' },
      skip: (page - 1) * size,
      take: size,
    });
    return { items: items.map((g) => this.mapear(g)), total, page, size };
  }

  async buscarPorId(id: number): Promise<RespuestaGrupoDto> {
    const g = await this.grupoRepo.findOne({ where: { id } });
    if (!g) throw new NotFoundException(`Grupo ${id} no encontrado`);
    return this.mapear(g);
  }

  async actualizar(id: number, dto: ActualizarGrupoDto): Promise<RespuestaGrupoDto> {
    const g = await this.grupoRepo.findOne({ where: { id } });
    if (!g) throw new NotFoundException(`Grupo ${id} no encontrado`);

    if (dto.cursoId !== undefined) {
      const curso = await this.cursoRepo.findOne({ where: { id: dto.cursoId } });
      if (!curso) throw new NotFoundException(`Curso ${dto.cursoId} no encontrado`);
      g.curso = curso;
    }
    if (dto.codigo !== undefined) g.codigo = dto.codigo;
    if (dto.cupoMax !== undefined) g.cupoMax = dto.cupoMax;
    if (dto.jornada !== undefined) g.jornada = dto.jornada;

    return this.mapear(await this.grupoRepo.save(g));
  }

  async eliminar(id: number): Promise<void> {
    const g = await this.grupoRepo.findOne({ where: { id } });
    if (!g) throw new NotFoundException(`Grupo ${id} no encontrado`);
    await this.grupoRepo.remove(g);
  }

  private mapear(g: Grupo): RespuestaGrupoDto {
    return {
      id: g.id,
      codigo: g.codigo,
      cursoId: g.curso.id,
      cursoNombre: g.curso.nombre,
      cupoMax: g.cupoMax,
      jornada: g.jornada,
      codigoAcceso: g.codigoAcceso,
    };
  }
}
