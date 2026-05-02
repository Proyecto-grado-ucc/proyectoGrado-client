import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Dimension } from '../entidades/dimension.entidad';
import { Pregunta } from '../entidades/pregunta.entidad';
import { ActualizarPreguntaDto } from './dto/actualizar-pregunta.dto';
import { CrearPreguntaDto } from './dto/crear-pregunta.dto';
import { RespuestaPaginadaPreguntaDto, RespuestaPreguntaDto } from './dto/respuesta-pregunta.dto';

@Injectable()
export class PreguntasServicio {
  constructor(
    @InjectRepository(Pregunta) private readonly preguntaRepo: Repository<Pregunta>,
    @InjectRepository(Dimension) private readonly dimensionRepo: Repository<Dimension>,
  ) {}

  async crear(dto: CrearPreguntaDto): Promise<RespuestaPreguntaDto> {
    const dimension = await this.dimensionRepo.findOne({ where: { id: dto.dimensionId } });
    if (!dimension) throw new NotFoundException(`Dimensión ${dto.dimensionId} no encontrada`);
    const p = this.preguntaRepo.create({ texto: dto.texto, tipo: dto.tipo, ordenIdx: dto.ordenIdx ?? 0, dimension });
    return this.mapear(await this.preguntaRepo.save(p));
  }

  async listar(page: number, size: number): Promise<RespuestaPaginadaPreguntaDto> {
    const [items, total] = await this.preguntaRepo.findAndCount({ order: { ordenIdx: 'ASC' }, skip: (page - 1) * size, take: size });
    return { items: items.map((p) => this.mapear(p)), total, page, size };
  }

  async buscarPorId(id: number): Promise<RespuestaPreguntaDto> {
    const p = await this.preguntaRepo.findOne({ where: { id } });
    if (!p) throw new NotFoundException(`Pregunta ${id} no encontrada`);
    return this.mapear(p);
  }

  async actualizar(id: number, dto: ActualizarPreguntaDto): Promise<RespuestaPreguntaDto> {
    const p = await this.preguntaRepo.findOne({ where: { id } });
    if (!p) throw new NotFoundException(`Pregunta ${id} no encontrada`);
    if (dto.dimensionId !== undefined) {
      const dimension = await this.dimensionRepo.findOne({ where: { id: dto.dimensionId } });
      if (!dimension) throw new NotFoundException(`Dimensión ${dto.dimensionId} no encontrada`);
      p.dimension = dimension;
    }
    if (dto.texto !== undefined) p.texto = dto.texto;
    if (dto.tipo !== undefined) p.tipo = dto.tipo;
    if (dto.ordenIdx !== undefined) p.ordenIdx = dto.ordenIdx;
    return this.mapear(await this.preguntaRepo.save(p));
  }

  async eliminar(id: number): Promise<void> {
    const p = await this.preguntaRepo.findOne({ where: { id } });
    if (!p) throw new NotFoundException(`Pregunta ${id} no encontrada`);
    await this.preguntaRepo.remove(p);
  }

  private mapear(p: Pregunta): RespuestaPreguntaDto {
    return { id: p.id, texto: p.texto, tipo: p.tipo, ordenIdx: p.ordenIdx, dimensionId: p.dimension.id, dimensionNombre: p.dimension.nombre };
  }
}
