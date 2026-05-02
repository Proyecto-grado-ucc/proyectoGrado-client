import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PeriodoAcademico } from '../../compartido/entidades/periodo-academico.entidad';
import { Docente } from '../../compartido/entidades/docente.entidad';
import { AlgoritmoGenetico } from '../motor/algoritmo-genetico';
import { BusquedaTabu } from '../motor/busqueda-tabu';
import { GeminiServicio } from '../motor/gemini.servicio';
import { CONFIG_DEFAULT, EntradaMotor } from '../motor/tipos';
import { Aula } from '../entidades/aula.entidad';
import { Disponibilidad } from '../entidades/disponibilidad.entidad';
import { FranjaHoraria } from '../entidades/franja-horaria.entidad';
import { Grupo } from '../entidades/grupo.entidad';
import { Horario } from '../entidades/horario.entidad';
import { GenerarHorarioDto } from './dto/generar-horario.dto';
import { RespuestaHorarioDto, RespuestaPaginadaHorarioDto } from './dto/respuesta-horario.dto';

@Injectable()
export class HorariosServicio {
  private readonly logger = new Logger(HorariosServicio.name);

  constructor(
    @InjectRepository(Horario) private readonly horarioRepo: Repository<Horario>,
    @InjectRepository(PeriodoAcademico) private readonly periodoRepo: Repository<PeriodoAcademico>,
    @InjectRepository(Grupo) private readonly grupoRepo: Repository<Grupo>,
    @InjectRepository(Docente) private readonly docenteRepo: Repository<Docente>,
    @InjectRepository(Aula) private readonly aulaRepo: Repository<Aula>,
    @InjectRepository(FranjaHoraria) private readonly franjaRepo: Repository<FranjaHoraria>,
    @InjectRepository(Disponibilidad) private readonly dispRepo: Repository<Disponibilidad>,
    private readonly geminiServicio: GeminiServicio,
  ) {}

  async generar(dto: GenerarHorarioDto): Promise<RespuestaHorarioDto> {
    const periodo = await this.periodoRepo.findOne({ where: { id: dto.periodoId } });
    if (!periodo) throw new NotFoundException(`Periodo ${dto.periodoId} no encontrado`);

    const entrada = await this.cargarEntrada();
    if (!entrada.grupos.length) throw new BadRequestException('No hay grupos registrados para generar horario');
    if (!entrada.docentes.length) throw new BadRequestException('No hay docentes registrados');
    if (!entrada.aulas.length) throw new BadRequestException('No hay aulas registradas');
    if (!entrada.franjas.length) throw new BadRequestException('No hay franjas horarias registradas');

    const configBase = await this.geminiServicio.sugerirConfiguracion(entrada);
    const config = { ...configBase, ...(dto.configuracion ?? {}) };

    const inicio = Date.now();
    const ag = new AlgoritmoGenetico(entrada, config);
    const { mejor: mejorAg, generaciones } = ag.evolucionar();

    const tabu = new BusquedaTabu(entrada, config);
    const mejorFinal = tabu.refinar(mejorAg);
    const tiempoMs = Date.now() - inicio;

    this.logger.log(`Horario generado: fitness=${mejorFinal.fitness}, tiempo=${tiempoMs}ms`);

    const horario = this.horarioRepo.create({
      periodo,
      asignaciones: mejorFinal.genes,
      fitness: mejorFinal.fitness,
      generaciones,
      tiempoMs,
      metadatos: { fitnessAg: mejorAg.fitness, config },
    });

    return this.mapear(await this.horarioRepo.save(horario));
  }

  async listar(page: number, size: number): Promise<RespuestaPaginadaHorarioDto> {
    const [items, total] = await this.horarioRepo.findAndCount({
      order: { creadoEn: 'DESC' },
      skip: (page - 1) * size,
      take: size,
    });
    return { items: items.map((h) => this.mapear(h)), total, page, size };
  }

  async buscarPorId(id: number): Promise<RespuestaHorarioDto> {
    const h = await this.horarioRepo.findOne({ where: { id } });
    if (!h) throw new NotFoundException(`Horario ${id} no encontrado`);
    return this.mapear(h);
  }

  async eliminar(id: number): Promise<void> {
    const h = await this.horarioRepo.findOne({ where: { id } });
    if (!h) throw new NotFoundException(`Horario ${id} no encontrado`);
    await this.horarioRepo.remove(h);
  }

  private async cargarEntrada(): Promise<EntradaMotor> {
    const [grupos, docentes, aulas, franjas, disponibilidades] = await Promise.all([
      this.grupoRepo.find(),
      this.docenteRepo.find(),
      this.aulaRepo.find({ where: { activa: true } }),
      this.franjaRepo.find(),
      this.dispRepo.find({ where: { disponible: true } }),
    ]);

    const dispPorDocente = new Map<number, number[]>();
    for (const d of disponibilidades) {
      const arr = dispPorDocente.get(d.docente.id) ?? [];
      arr.push(d.franjaHoraria.id);
      dispPorDocente.set(d.docente.id, arr);
    }

    return {
      grupos: grupos.map((g) => ({ id: g.id, cupoMax: g.cupoMax, sesiones: g.curso.intensidadHoraria })),
      docentes: docentes.map((d) => ({
        id: d.id,
        cargaMaximaHoras: d.cargaMaximaHoras,
        franjasDisponibles: dispPorDocente.get(d.id) ?? [],
      })),
      aulas: aulas.map((a) => ({ id: a.id, capacidad: a.capacidad })),
      franjas: franjas.map((f) => ({ id: f.id })),
    };
  }

  private mapear(h: Horario): RespuestaHorarioDto {
    return {
      id: h.id,
      periodoId: h.periodo.id,
      periodoNombre: h.periodo.nombre,
      asignaciones: h.asignaciones,
      fitness: h.fitness,
      generaciones: h.generaciones,
      tiempoMs: h.tiempoMs,
      creadoEn: h.creadoEn,
    };
  }
}
