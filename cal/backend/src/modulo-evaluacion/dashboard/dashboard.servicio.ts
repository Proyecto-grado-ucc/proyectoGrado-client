import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Docente } from '../../compartido/entidades/docente.entidad';
import { Alerta, NivelAlerta } from '../entidades/alerta.entidad';
import { EstadoEvaluacion, Evaluacion } from '../entidades/evaluacion.entidad';
import { ResultadoKdd } from '../entidades/resultado-kdd.entidad';
import { RespuestaDashboardDto } from './dto/respuesta-dashboard.dto';

@Injectable()
export class DashboardServicio {
  constructor(
    @InjectRepository(Docente) private readonly docenteRepo: Repository<Docente>,
    @InjectRepository(Evaluacion) private readonly evalRepo: Repository<Evaluacion>,
    @InjectRepository(ResultadoKdd) private readonly resultadoRepo: Repository<ResultadoKdd>,
    @InjectRepository(Alerta) private readonly alertaRepo: Repository<Alerta>,
  ) {}

  async resumen(periodoId: number): Promise<RespuestaDashboardDto> {
    const [totalDocentes, totalEvaluaciones, resultados, alertasCriticas, alertasAdvertencia] =
      await Promise.all([
        this.docenteRepo.count(),
        this.evalRepo
          .createQueryBuilder('ev')
          .innerJoin('ev.formulario', 'fm')
          .innerJoin('fm.periodo', 'per')
          .where('per.id = :periodoId', { periodoId })
          .andWhere('ev.estado = :estado', { estado: EstadoEvaluacion.Completada })
          .getCount(),
        this.resultadoRepo.find({ where: { periodoId } }),
        this.alertaRepo.count({ where: { periodoId, nivel: NivelAlerta.CRITICO } }),
        this.alertaRepo.count({ where: { periodoId, nivel: NivelAlerta.ADVERTENCIA } }),
      ]);

    const promedioGlobal =
      resultados.length > 0
        ? Math.round(
            (resultados.reduce((s, r) => s + r.puntuacionGlobal, 0) / resultados.length) * 100,
          ) / 100
        : 0;

    const rangos = ['1.0-2.0', '2.0-3.0', '3.0-4.0', '4.0-5.0'];
    const distribucionPuntuaciones = rangos.map(rango => {
      const [min, max] = rango.split('-').map(Number);
      return {
        rango,
        cantidad: resultados.filter(r => r.puntuacionGlobal >= min && r.puntuacionGlobal < max)
          .length,
      };
    });

    return {
      totalDocentes,
      totalEvaluaciones,
      promedioGlobal,
      alertasCriticas,
      alertasAdvertencia,
      distribucionPuntuaciones,
    };
  }
}
