import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from '../seguridad/entidades/usuario.entidad';
import { SeguridadModulo } from '../seguridad/seguridad.modulo';
import { DocentesControlador } from './docentes/docentes.controlador';
import { DocentesServicio } from './docentes/docentes.servicio';
import { Docente } from './entidades/docente.entidad';
import { Estudiante } from './entidades/estudiante.entidad';
import { PeriodoAcademico } from './entidades/periodo-academico.entidad';
import { EstudiantesControlador } from './estudiantes/estudiantes.controlador';
import { EstudiantesServicio } from './estudiantes/estudiantes.servicio';
import { PeriodosControlador } from './periodos/periodos.controlador';
import { PeriodosServicio } from './periodos/periodos.servicio';
import { Grupo } from '../modulo-horarios/entidades/grupo.entidad';

@Module({
  imports: [
    TypeOrmModule.forFeature([Docente, Estudiante, PeriodoAcademico, Usuario, Grupo]),
    SeguridadModulo,
  ],
  providers: [PeriodosServicio, DocentesServicio, EstudiantesServicio],
  controllers: [PeriodosControlador, DocentesControlador, EstudiantesControlador],
  exports: [DocentesServicio, EstudiantesServicio],
})
export class CompartidoModulo {}
