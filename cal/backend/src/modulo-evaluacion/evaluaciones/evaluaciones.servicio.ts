import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Docente } from '../../compartido/entidades/docente.entidad';
import { Evaluacion } from '../entidades/evaluacion.entidad';
import { Formulario } from '../entidades/formulario.entidad';
import { ActualizarEvaluacionDto } from './dto/actualizar-evaluacion.dto';
import { CrearEvaluacionDto } from './dto/crear-evaluacion.dto';
import { RespuestaEvaluacionDto, RespuestaPaginadaEvaluacionDto } from './dto/respuesta-evaluacion.dto';

@Injectable()
export class EvaluacionesServicio {
  constructor(
    @InjectRepository(Evaluacion) private readonly evaluacionRepo: Repository<Evaluacion>,
    @InjectRepository(Formulario) private readonly formularioRepo: Repository<Formulario>,
    @InjectRepository(Docente) private readonly docenteRepo: Repository<Docente>,
  ) {}

  async crear(dto: CrearEvaluacionDto): Promise<RespuestaEvaluacionDto> {
    const formulario = await this.formularioRepo.findOne({ where: { id: dto.formularioId } });
    if (!formulario) throw new NotFoundException(`Formulario ${dto.formularioId} no encontrado`);
    const docenteEvaluado = await this.docenteRepo.findOne({ where: { id: dto.docenteEvaluadoId } });
    if (!docenteEvaluado) throw new NotFoundException(`Docente ${dto.docenteEvaluadoId} no encontrado`);
    const e = this.evaluacionRepo.create({ formulario, docenteEvaluado, evaluadorId: dto.evaluadorId ?? null });
    return this.mapear(await this.evaluacionRepo.save(e));
  }

  async listar(page: number, size: number): Promise<RespuestaPaginadaEvaluacionDto> {
    const [items, total] = await this.evaluacionRepo.findAndCount({ order: { creadoEn: 'DESC' }, skip: (page - 1) * size, take: size });
    return { items: items.map((e) => this.mapear(e)), total, page, size };
  }

  async buscarPorId(id: number): Promise<RespuestaEvaluacionDto> {
    const e = await this.evaluacionRepo.findOne({ where: { id } });
    if (!e) throw new NotFoundException(`Evaluación ${id} no encontrada`);
    return this.mapear(e);
  }

  async actualizar(id: number, dto: ActualizarEvaluacionDto): Promise<RespuestaEvaluacionDto> {
    const e = await this.evaluacionRepo.findOne({ where: { id } });
    if (!e) throw new NotFoundException(`Evaluación ${id} no encontrada`);
    if (dto.estado !== undefined) e.estado = dto.estado;
    return this.mapear(await this.evaluacionRepo.save(e));
  }

  async eliminar(id: number): Promise<void> {
    const e = await this.evaluacionRepo.findOne({ where: { id } });
    if (!e) throw new NotFoundException(`Evaluación ${id} no encontrada`);
    await this.evaluacionRepo.remove(e);
  }

  private mapear(e: Evaluacion): RespuestaEvaluacionDto {
    return {
      id: e.id,
      formularioId: e.formulario.id,
      formularioTitulo: e.formulario.titulo,
      docenteEvaluadoId: e.docenteEvaluado.id,
      docenteEvaluadoNombre: e.docenteEvaluado.usuario.nombre,
      evaluadorId: e.evaluadorId,
      estado: e.estado,
      creadoEn: e.creadoEn,
    };
  }
}
