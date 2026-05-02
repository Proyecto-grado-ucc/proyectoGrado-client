import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Docente } from '../compartido/entidades/docente.entidad';
import { PeriodoAcademico } from '../compartido/entidades/periodo-academico.entidad';
import { SeguridadModulo } from '../seguridad/seguridad.modulo';
import { AlertasControlador } from './alertas/alertas.controlador';
import { AlertasServicio } from './alertas/alertas.servicio';
import { DashboardControlador } from './dashboard/dashboard.controlador';
import { DashboardServicio } from './dashboard/dashboard.servicio';
import { DimensionesControlador } from './dimensiones/dimensiones.controlador';
import { DimensionesServicio } from './dimensiones/dimensiones.servicio';
import { Alerta } from './entidades/alerta.entidad';
import { Dimension } from './entidades/dimension.entidad';
import { Evaluacion } from './entidades/evaluacion.entidad';
import { Formulario } from './entidades/formulario.entidad';
import { Pregunta } from './entidades/pregunta.entidad';
import { ResultadoKdd } from './entidades/resultado-kdd.entidad';
import { Respuesta } from './entidades/respuesta.entidad';
import { EvaluacionesControlador } from './evaluaciones/evaluaciones.controlador';
import { EvaluacionesServicio } from './evaluaciones/evaluaciones.servicio';
import { FormulariosControlador } from './formularios/formularios.controlador';
import { FormulariosServicio } from './formularios/formularios.servicio';
import { KddControlador } from './kdd/kdd.controlador';
import { KddPipelineServicio } from './kdd/kdd-pipeline.servicio';
import { PreguntasControlador } from './preguntas/preguntas.controlador';
import { PreguntasServicio } from './preguntas/preguntas.servicio';
import { RespuestasControlador } from './respuestas/respuestas.controlador';
import { RespuestasServicio } from './respuestas/respuestas.servicio';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Formulario, Dimension, Pregunta, Evaluacion, Respuesta,
      ResultadoKdd, Alerta,
      PeriodoAcademico, Docente,
    ]),
    SeguridadModulo,
  ],
  providers: [
    FormulariosServicio, DimensionesServicio, PreguntasServicio,
    EvaluacionesServicio, RespuestasServicio,
    KddPipelineServicio, AlertasServicio, DashboardServicio,
  ],
  controllers: [
    FormulariosControlador, DimensionesControlador, PreguntasControlador,
    EvaluacionesControlador, RespuestasControlador,
    KddControlador, AlertasControlador, DashboardControlador,
  ],
  exports: [EvaluacionesServicio, RespuestasServicio, KddPipelineServicio, AlertasServicio],
})
export class ModuloEvaluacionModulo {}
