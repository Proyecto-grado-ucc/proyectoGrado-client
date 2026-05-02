import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Docente } from '../../compartido/entidades/docente.entidad';
import { Alerta, NivelAlerta, TipoAlerta } from '../entidades/alerta.entidad';
import { Dimension } from '../entidades/dimension.entidad';
import { EstadoEvaluacion, Evaluacion } from '../entidades/evaluacion.entidad';
import { Pregunta } from '../entidades/pregunta.entidad';
import { ResultadoKdd } from '../entidades/resultado-kdd.entidad';
import { Respuesta } from '../entidades/respuesta.entidad';
import { RespuestaEjecucionKddDto, RespuestaResultadoKddDto } from './dto/respuesta-kdd.dto';

const UMBRAL_CRITICO = 3.0;
const UMBRAL_ADVERTENCIA = 3.5;

interface DimAccum {
  nombre: string;
  peso: number;
  valores: number[];
}

@Injectable()
export class KddPipelineServicio {
  constructor(
    @InjectRepository(Evaluacion) private readonly evalRepo: Repository<Evaluacion>,
    @InjectRepository(Respuesta) private readonly respRepo: Repository<Respuesta>,
    @InjectRepository(ResultadoKdd) private readonly resultadoRepo: Repository<ResultadoKdd>,
    @InjectRepository(Alerta) private readonly alertaRepo: Repository<Alerta>,
    @InjectRepository(Docente) private readonly docenteRepo: Repository<Docente>,
  ) {}

  async ejecutar(periodoId: number): Promise<RespuestaEjecucionKddDto> {
    // Stage 1 — Selección: evaluaciones completadas para el período
    const evaluaciones = await this.evalRepo
      .createQueryBuilder('ev')
      .innerJoin('ev.formulario', 'fm')
      .innerJoin('fm.periodo', 'per')
      .leftJoinAndSelect('ev.docenteEvaluado', 'doc')
      .where('per.id = :periodoId', { periodoId })
      .andWhere('ev.estado = :estado', { estado: EstadoEvaluacion.Completada })
      .getMany();

    if (!evaluaciones.length) {
      await this.resultadoRepo.delete({ periodoId });
      await this.alertaRepo.delete({ periodoId });
      return { resultados: 0, alertas: 0 };
    }

    // Stage 2 — Preprocesamiento: mapear evaluaciones a docenteId
    const evalIds = evaluaciones.map(e => e.id);
    const evalToDocente = new Map<number, number>(
      evaluaciones.map(e => [e.id, (e.docenteEvaluado as Docente).id]),
    );

    // Cargar respuestas numéricas con sus preguntas y dimensiones
    const respNumericas = await this.respRepo
      .createQueryBuilder('r')
      .innerJoinAndSelect('r.evaluacion', 'ev')
      .innerJoinAndSelect('r.pregunta', 'preg')
      .innerJoinAndSelect('preg.dimension', 'dim')
      .where('ev.id IN (:...evalIds)', { evalIds })
      .andWhere('r.valor_numerico IS NOT NULL')
      .getMany();

    // Stage 3 — Transformación: acumular valores por (docenteId, dimensionId)
    const docenteData = new Map<number, { dims: Map<number, DimAccum>; evalCount: number }>();

    for (const ev of evaluaciones) {
      const docId = (ev.docenteEvaluado as Docente).id;
      if (!docenteData.has(docId)) docenteData.set(docId, { dims: new Map(), evalCount: 0 });
      docenteData.get(docId)!.evalCount++;
    }

    for (const r of respNumericas) {
      const evalId = (r.evaluacion as Evaluacion).id;
      const docenteId = evalToDocente.get(evalId);
      if (docenteId === undefined) continue;

      const dim = (r.pregunta as Pregunta).dimension as Dimension;
      const data = docenteData.get(docenteId)!;

      if (!data.dims.has(dim.id)) {
        data.dims.set(dim.id, { nombre: dim.nombre, peso: dim.peso ?? 1.0, valores: [] });
      }
      data.dims.get(dim.id)!.valores.push(r.valorNumerico!);
    }

    // Stage 4 — Minería: calcular puntuación global ponderada por docente
    const resultadosParaGuardar: ResultadoKdd[] = [];

    for (const [docenteId, data] of docenteData) {
      if (data.dims.size === 0) continue;

      const detalle: Record<string, number> = {};
      let numerador = 0;
      let denominador = 0;

      for (const dimAccum of data.dims.values()) {
        const prom = dimAccum.valores.reduce((a, b) => a + b, 0) / dimAccum.valores.length;
        detalle[dimAccum.nombre] = Math.round(prom * 100) / 100;
        numerador += prom * dimAccum.peso;
        denominador += dimAccum.peso;
      }

      if (denominador === 0) continue;

      resultadosParaGuardar.push(
        this.resultadoRepo.create({
          periodoId,
          docenteId,
          puntuacionGlobal: Math.round((numerador / denominador) * 100) / 100,
          totalEvaluaciones: data.evalCount,
          detalleDimensiones: detalle,
        }),
      );
    }

    await this.resultadoRepo.delete({ periodoId });
    const savedResultados = await this.resultadoRepo.save(resultadosParaGuardar);

    // Stage 5 — Interpretación: generar alertas
    await this.alertaRepo.delete({ periodoId });
    const alertas: Alerta[] = [];

    const docentes = await this.docenteRepo.find();
    const docentesConResultado = new Set(savedResultados.map(r => r.docenteId));

    for (const docente of docentes) {
      if (!docentesConResultado.has(docente.id)) {
        const nombre = docente.usuario?.nombre ?? `ID ${docente.id}`;
        alertas.push(
          this.alertaRepo.create({
            docenteId: docente.id,
            periodoId,
            tipo: TipoAlerta.SIN_EVALUACIONES,
            nivel: NivelAlerta.INFO,
            mensaje: `El docente ${nombre} no tiene evaluaciones completadas en este período.`,
            leida: false,
          }),
        );
      }
    }

    for (const resultado of savedResultados) {
      if (resultado.puntuacionGlobal < UMBRAL_CRITICO) {
        alertas.push(
          this.alertaRepo.create({
            docenteId: resultado.docenteId,
            periodoId,
            tipo: TipoAlerta.BAJO_RENDIMIENTO,
            nivel: NivelAlerta.CRITICO,
            mensaje: `Puntuación global ${resultado.puntuacionGlobal.toFixed(2)} por debajo del umbral crítico (${UMBRAL_CRITICO}).`,
            leida: false,
          }),
        );
      } else if (resultado.puntuacionGlobal < UMBRAL_ADVERTENCIA) {
        alertas.push(
          this.alertaRepo.create({
            docenteId: resultado.docenteId,
            periodoId,
            tipo: TipoAlerta.BAJO_RENDIMIENTO,
            nivel: NivelAlerta.ADVERTENCIA,
            mensaje: `Puntuación global ${resultado.puntuacionGlobal.toFixed(2)} por debajo del umbral de advertencia (${UMBRAL_ADVERTENCIA}).`,
            leida: false,
          }),
        );
      }
    }

    await this.alertaRepo.save(alertas);

    return { resultados: savedResultados.length, alertas: alertas.length };
  }

  async listarResultados(periodoId: number): Promise<RespuestaResultadoKddDto[]> {
    const resultados = await this.resultadoRepo.find({ where: { periodoId } });
    return resultados.map(r => ({
      id: r.id,
      periodoId: r.periodoId,
      docenteId: r.docenteId,
      puntuacionGlobal: r.puntuacionGlobal,
      totalEvaluaciones: r.totalEvaluaciones,
      detalleDimensiones: r.detalleDimensiones,
      creadoEn: r.creadoEn,
    }));
  }
}
