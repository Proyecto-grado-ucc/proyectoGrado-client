import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PeriodoAcademico } from '../../compartido/entidades/periodo-academico.entidad';
import { Formulario } from '../entidades/formulario.entidad';
import { ActualizarFormularioDto } from './dto/actualizar-formulario.dto';
import { CrearFormularioDto } from './dto/crear-formulario.dto';
import { RespuestaFormularioDto, RespuestaPaginadaFormularioDto } from './dto/respuesta-formulario.dto';

@Injectable()
export class FormulariosServicio {
  constructor(
    @InjectRepository(Formulario) private readonly formularioRepo: Repository<Formulario>,
    @InjectRepository(PeriodoAcademico) private readonly periodoRepo: Repository<PeriodoAcademico>,
  ) {}

  async crear(dto: CrearFormularioDto): Promise<RespuestaFormularioDto> {
    const periodo = await this.periodoRepo.findOne({ where: { id: dto.periodoId } });
    if (!periodo) throw new NotFoundException(`Periodo ${dto.periodoId} no encontrado`);
    const f = this.formularioRepo.create({ titulo: dto.titulo, descripcion: dto.descripcion ?? null, periodo, activo: dto.activo ?? true });
    return this.mapear(await this.formularioRepo.save(f));
  }

  async listar(page: number, size: number): Promise<RespuestaPaginadaFormularioDto> {
    const [items, total] = await this.formularioRepo.findAndCount({ order: { id: 'DESC' }, skip: (page - 1) * size, take: size });
    return { items: items.map((f) => this.mapear(f)), total, page, size };
  }

  async buscarPorId(id: number): Promise<RespuestaFormularioDto> {
    const f = await this.formularioRepo.findOne({ where: { id } });
    if (!f) throw new NotFoundException(`Formulario ${id} no encontrado`);
    return this.mapear(f);
  }

  async actualizar(id: number, dto: ActualizarFormularioDto): Promise<RespuestaFormularioDto> {
    const f = await this.formularioRepo.findOne({ where: { id } });
    if (!f) throw new NotFoundException(`Formulario ${id} no encontrado`);
    if (dto.periodoId !== undefined) {
      const periodo = await this.periodoRepo.findOne({ where: { id: dto.periodoId } });
      if (!periodo) throw new NotFoundException(`Periodo ${dto.periodoId} no encontrado`);
      f.periodo = periodo;
    }
    if (dto.titulo !== undefined) f.titulo = dto.titulo;
    if (dto.descripcion !== undefined) f.descripcion = dto.descripcion ?? null;
    if (dto.activo !== undefined) f.activo = dto.activo;
    return this.mapear(await this.formularioRepo.save(f));
  }

  async eliminar(id: number): Promise<void> {
    const f = await this.formularioRepo.findOne({ where: { id } });
    if (!f) throw new NotFoundException(`Formulario ${id} no encontrado`);
    await this.formularioRepo.remove(f);
  }

  private mapear(f: Formulario): RespuestaFormularioDto {
    return { id: f.id, titulo: f.titulo, descripcion: f.descripcion, periodoId: f.periodo.id, periodoNombre: f.periodo.nombre, activo: f.activo };
  }
}
