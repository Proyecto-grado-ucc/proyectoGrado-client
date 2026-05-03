import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PeriodoAcademico } from '../../compartido/entidades/periodo-academico.entidad';
import { Formulario } from '../entidades/formulario.entidad';
import { Dimension } from '../entidades/dimension.entidad';
import { Pregunta, TipoPregunta } from '../entidades/pregunta.entidad';
import { ActualizarFormularioDto } from './dto/actualizar-formulario.dto';
import { CrearFormularioDto } from './dto/crear-formulario.dto';
import { RespuestaFormularioDto, RespuestaPaginadaFormularioDto } from './dto/respuesta-formulario.dto';

@Injectable()
export class FormulariosServicio {
  constructor(
    @InjectRepository(Formulario) private readonly formularioRepo: Repository<Formulario>,
    @InjectRepository(PeriodoAcademico) private readonly periodoRepo: Repository<PeriodoAcademico>,
    @InjectRepository(Dimension) private readonly dimensionRepo: Repository<Dimension>,
    @InjectRepository(Pregunta) private readonly preguntaRepo: Repository<Pregunta>,
  ) {}

  async crear(dto: CrearFormularioDto): Promise<RespuestaFormularioDto> {
    const periodo = await this.periodoRepo.findOne({ where: { id: dto.periodoId } });
    if (!periodo) throw new NotFoundException(`Periodo ${dto.periodoId} no encontrado`);
    const f = this.formularioRepo.create({ titulo: dto.titulo, descripcion: dto.descripcion ?? null, periodo, activo: dto.activo ?? true });
    const formularioGuardado = await this.formularioRepo.save(f);

    if (dto.tipoEvaluacion === 'DESEMPENO') {
      await this.generarPreguntasDesempeno(formularioGuardado);
    }

    return this.mapear(formularioGuardado);
  }

  private async generarPreguntasDesempeno(formulario: Formulario) {
    // Dimension 1
    const d1 = await this.dimensionRepo.save(
      this.dimensionRepo.create({ nombre: 'Dominio de la Asignatura', peso: 1.0, formulario })
    );
    await this.preguntaRepo.save([
      this.preguntaRepo.create({ texto: 'Demuestra dominio y seguridad en los temas impartidos.', tipo: TipoPregunta.Escala, ordenIdx: 1, dimension: d1 }),
      this.preguntaRepo.create({ texto: 'Resuelve de forma clara las dudas planteadas en clase.', tipo: TipoPregunta.Escala, ordenIdx: 2, dimension: d1 }),
    ]);

    // Dimension 2
    const d2 = await this.dimensionRepo.save(
      this.dimensionRepo.create({ nombre: 'Pedagogía y Metodología', peso: 1.0, formulario })
    );
    await this.preguntaRepo.save([
      this.preguntaRepo.create({ texto: 'Utiliza recursos y materiales didácticos que facilitan el aprendizaje.', tipo: TipoPregunta.Escala, ordenIdx: 1, dimension: d2 }),
      this.preguntaRepo.create({ texto: 'Fomenta la participación activa de los estudiantes.', tipo: TipoPregunta.Escala, ordenIdx: 2, dimension: d2 }),
    ]);

    // Dimension 3
    const d3 = await this.dimensionRepo.save(
      this.dimensionRepo.create({ nombre: 'Puntualidad y Cumplimiento', peso: 1.0, formulario })
    );
    await this.preguntaRepo.save([
      this.preguntaRepo.create({ texto: 'Inicia y finaliza la clase en los horarios establecidos.', tipo: TipoPregunta.Escala, ordenIdx: 1, dimension: d3 }),
    ]);
  }

  async listar(page: number, size: number): Promise<RespuestaPaginadaFormularioDto> {
    const [items, total] = await this.formularioRepo.findAndCount({ order: { id: 'DESC' }, skip: (page - 1) * size, take: size });
    return { items: items.map((f) => this.mapear(f)), total, page, size };
  }

  async buscarPorId(id: number): Promise<RespuestaFormularioDto> {
    const f = await this.formularioRepo.findOne({
      where: { id },
      relations: ['dimensiones', 'dimensiones.preguntas'],
    });
    if (!f) throw new NotFoundException(`Formulario ${id} no encontrado`);
    
    // Sort dimensions and questions if they exist
    if (f.dimensiones && Array.isArray(f.dimensiones)) {
      f.dimensiones.sort((a: any, b: any) => a.id - b.id);
      f.dimensiones.forEach((d: any) => {
        if (d.preguntas && Array.isArray(d.preguntas)) {
          d.preguntas.sort((p1: any, p2: any) => p1.ordenIdx - p2.ordenIdx);
        }
      });
    }
    
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
    return { 
      id: f.id, 
      titulo: f.titulo, 
      descripcion: f.descripcion, 
      periodoId: f.periodo.id, 
      periodoNombre: f.periodo.nombre, 
      activo: f.activo,
      dimensiones: f.dimensiones as any[] 
    };
  }
}
