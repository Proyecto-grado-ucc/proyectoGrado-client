import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Evaluacion } from '../entidades/evaluacion.entidad';
import { Pregunta } from '../entidades/pregunta.entidad';
import { Respuesta } from '../entidades/respuesta.entidad';
import { ActualizarRespuestaDto } from './dto/actualizar-respuesta.dto';
import { CrearRespuestaDto } from './dto/crear-respuesta.dto';
import { DetalleRespuestaDto, RespuestaPaginadaRespuestaDto } from './dto/respuesta-respuesta.dto';

@Injectable()
export class RespuestasServicio {
  constructor(
    @InjectRepository(Respuesta) private readonly respuestaRepo: Repository<Respuesta>,
    @InjectRepository(Evaluacion) private readonly evaluacionRepo: Repository<Evaluacion>,
    @InjectRepository(Pregunta) private readonly preguntaRepo: Repository<Pregunta>,
  ) {}

  async crear(dto: CrearRespuestaDto): Promise<DetalleRespuestaDto> {
    const evaluacion = await this.evaluacionRepo.findOne({ where: { id: dto.evaluacionId } });
    if (!evaluacion) throw new NotFoundException(`Evaluación ${dto.evaluacionId} no encontrada`);
    const pregunta = await this.preguntaRepo.findOne({ where: { id: dto.preguntaId } });
    if (!pregunta) throw new NotFoundException(`Pregunta ${dto.preguntaId} no encontrada`);
    const r = this.respuestaRepo.create({ evaluacion, pregunta, valorNumerico: dto.valorNumerico ?? null, valorTexto: dto.valorTexto ?? null });
    return this.mapear(await this.respuestaRepo.save(r));
  }

  async listarPorEvaluacion(evaluacionId: number, page: number, size: number): Promise<RespuestaPaginadaRespuestaDto> {
    const evaluacion = await this.evaluacionRepo.findOne({ where: { id: evaluacionId } });
    if (!evaluacion) throw new NotFoundException(`Evaluación ${evaluacionId} no encontrada`);
    const [items, total] = await this.respuestaRepo.findAndCount({
      where: { evaluacion: { id: evaluacionId } },
      skip: (page - 1) * size,
      take: size,
    });
    return { items: items.map((r) => this.mapear(r)), total, page, size };
  }

  async buscarPorId(id: number): Promise<DetalleRespuestaDto> {
    const r = await this.respuestaRepo.findOne({ where: { id } });
    if (!r) throw new NotFoundException(`Respuesta ${id} no encontrada`);
    return this.mapear(r);
  }

  async actualizar(id: number, dto: ActualizarRespuestaDto): Promise<DetalleRespuestaDto> {
    const r = await this.respuestaRepo.findOne({ where: { id } });
    if (!r) throw new NotFoundException(`Respuesta ${id} no encontrada`);
    if (dto.valorNumerico !== undefined) r.valorNumerico = dto.valorNumerico ?? null;
    if (dto.valorTexto !== undefined) r.valorTexto = dto.valorTexto ?? null;
    return this.mapear(await this.respuestaRepo.save(r));
  }

  async eliminar(id: number): Promise<void> {
    const r = await this.respuestaRepo.findOne({ where: { id } });
    if (!r) throw new NotFoundException(`Respuesta ${id} no encontrada`);
    await this.respuestaRepo.remove(r);
  }

  private mapear(r: Respuesta): DetalleRespuestaDto {
    return {
      id: r.id,
      evaluacionId: (r.evaluacion as Evaluacion).id,
      preguntaId: r.pregunta.id,
      preguntaTexto: r.pregunta.texto,
      preguntaTipo: r.pregunta.tipo,
      valorNumerico: r.valorNumerico,
      valorTexto: r.valorTexto,
    };
  }
}
