import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Dimension } from '../entidades/dimension.entidad';
import { Formulario } from '../entidades/formulario.entidad';
import { ActualizarDimensionDto } from './dto/actualizar-dimension.dto';
import { CrearDimensionDto } from './dto/crear-dimension.dto';
import { RespuestaDimensionDto, RespuestaPaginadaDimensionDto } from './dto/respuesta-dimension.dto';

@Injectable()
export class DimensionesServicio {
  constructor(
    @InjectRepository(Dimension) private readonly dimensionRepo: Repository<Dimension>,
    @InjectRepository(Formulario) private readonly formularioRepo: Repository<Formulario>,
  ) {}

  async crear(dto: CrearDimensionDto): Promise<RespuestaDimensionDto> {
    const formulario = await this.formularioRepo.findOne({ where: { id: dto.formularioId } });
    if (!formulario) throw new NotFoundException(`Formulario ${dto.formularioId} no encontrado`);
    const d = this.dimensionRepo.create({ nombre: dto.nombre, descripcion: dto.descripcion ?? null, peso: dto.peso ?? 1.0, formulario });
    return this.mapear(await this.dimensionRepo.save(d));
  }

  async listar(page: number, size: number): Promise<RespuestaPaginadaDimensionDto> {
    const [items, total] = await this.dimensionRepo.findAndCount({ order: { id: 'ASC' }, skip: (page - 1) * size, take: size });
    return { items: items.map((d) => this.mapear(d)), total, page, size };
  }

  async buscarPorId(id: number): Promise<RespuestaDimensionDto> {
    const d = await this.dimensionRepo.findOne({ where: { id } });
    if (!d) throw new NotFoundException(`Dimensión ${id} no encontrada`);
    return this.mapear(d);
  }

  async actualizar(id: number, dto: ActualizarDimensionDto): Promise<RespuestaDimensionDto> {
    const d = await this.dimensionRepo.findOne({ where: { id } });
    if (!d) throw new NotFoundException(`Dimensión ${id} no encontrada`);
    if (dto.formularioId !== undefined) {
      const formulario = await this.formularioRepo.findOne({ where: { id: dto.formularioId } });
      if (!formulario) throw new NotFoundException(`Formulario ${dto.formularioId} no encontrado`);
      d.formulario = formulario;
    }
    if (dto.nombre !== undefined) d.nombre = dto.nombre;
    if (dto.descripcion !== undefined) d.descripcion = dto.descripcion ?? null;
    if (dto.peso !== undefined) d.peso = dto.peso;
    return this.mapear(await this.dimensionRepo.save(d));
  }

  async eliminar(id: number): Promise<void> {
    const d = await this.dimensionRepo.findOne({ where: { id } });
    if (!d) throw new NotFoundException(`Dimensión ${id} no encontrada`);
    await this.dimensionRepo.remove(d);
  }

  private mapear(d: Dimension): RespuestaDimensionDto {
    return { id: d.id, nombre: d.nombre, descripcion: d.descripcion, peso: d.peso, formularioId: d.formulario.id, formularioTitulo: d.formulario.titulo };
  }
}
