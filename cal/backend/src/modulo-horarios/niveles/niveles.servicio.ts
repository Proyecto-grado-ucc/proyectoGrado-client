import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NivelIdioma } from '../entidades/nivel-idioma.entidad';
import { ActualizarNivelDto } from './dto/actualizar-nivel.dto';
import { CrearNivelDto } from './dto/crear-nivel.dto';
import { RespuestaNivelDto, RespuestaPaginadaNivelDto } from './dto/respuesta-nivel.dto';

@Injectable()
export class NivelesServicio {
  constructor(
    @InjectRepository(NivelIdioma)
    private readonly nivelRepo: Repository<NivelIdioma>,
  ) {}

  async crear(dto: CrearNivelDto): Promise<RespuestaNivelDto> {

    const nivel = this.nivelRepo.create(dto);
    return this.mapear(await this.nivelRepo.save(nivel));
  }

  async listar(page: number, size: number): Promise<RespuestaPaginadaNivelDto> {
    const [items, total] = await this.nivelRepo.findAndCount({
      order: { codigo: 'ASC' },
      skip: (page - 1) * size,
      take: size,
    });
    return { items: items.map((n) => this.mapear(n)), total, page, size };
  }

  async buscarPorId(id: number): Promise<RespuestaNivelDto> {
    const n = await this.nivelRepo.findOne({ where: { id } });
    if (!n) throw new NotFoundException(`Nivel ${id} no encontrado`);
    return this.mapear(n);
  }

  async actualizar(id: number, dto: ActualizarNivelDto): Promise<RespuestaNivelDto> {
    const n = await this.nivelRepo.findOne({ where: { id } });
    if (!n) throw new NotFoundException(`Nivel ${id} no encontrado`);

    Object.assign(n, dto);
    return this.mapear(await this.nivelRepo.save(n));
  }

  async eliminar(id: number): Promise<void> {
    const n = await this.nivelRepo.findOne({ where: { id } });
    if (!n) throw new NotFoundException(`Nivel ${id} no encontrado`);
    await this.nivelRepo.remove(n);
  }

  private mapear(n: NivelIdioma): RespuestaNivelDto {
    return { id: n.id, codigo: n.codigo, nombre: n.nombre };
  }
}
