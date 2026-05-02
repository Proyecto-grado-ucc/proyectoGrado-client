import { Module, OnModuleInit } from '@nestjs/common';
import { InjectRepository, TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigModule } from '@nestjs/config';
import { Docente } from '../compartido/entidades/docente.entidad';
import { PeriodoAcademico } from '../compartido/entidades/periodo-academico.entidad';
import { SeguridadModulo } from '../seguridad/seguridad.modulo';
import { AulasControlador } from './aulas/aulas.controlador';
import { AulasServicio } from './aulas/aulas.servicio';
import { CursosControlador } from './cursos/cursos.controlador';
import { CursosServicio } from './cursos/cursos.servicio';
import { DisponibilidadesControlador } from './disponibilidades/disponibilidades.controlador';
import { DisponibilidadesServicio } from './disponibilidades/disponibilidades.servicio';
import { Aula } from './entidades/aula.entidad';
import { Curso } from './entidades/curso.entidad';
import { Disponibilidad } from './entidades/disponibilidad.entidad';
import { FranjaHoraria } from './entidades/franja-horaria.entidad';
import { Grupo } from './entidades/grupo.entidad';
import { Horario } from './entidades/horario.entidad';
import { CodigoNivel, NivelIdioma } from './entidades/nivel-idioma.entidad';
import { FranjasControlador } from './franjas/franjas.controlador';
import { FranjasServicio } from './franjas/franjas.servicio';
import { GruposControlador } from './grupos/grupos.controlador';
import { GruposServicio } from './grupos/grupos.servicio';
import { HorariosControlador } from './horarios/horarios.controlador';
import { HorariosServicio } from './horarios/horarios.servicio';
import { GeminiServicio } from './motor/gemini.servicio';
import { NivelesControlador } from './niveles/niveles.controlador';
import { NivelesServicio } from './niveles/niveles.servicio';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([
      Aula, NivelIdioma, Curso, Grupo, FranjaHoraria, Disponibilidad,
      Horario, Docente, PeriodoAcademico,
    ]),
    SeguridadModulo,
  ],
  providers: [
    AulasServicio, NivelesServicio, CursosServicio, GruposServicio,
    FranjasServicio, DisponibilidadesServicio,
    GeminiServicio, HorariosServicio,
  ],
  controllers: [
    AulasControlador, NivelesControlador, CursosControlador, GruposControlador,
    FranjasControlador, DisponibilidadesControlador, HorariosControlador,
  ],
  exports: [NivelesServicio, CursosServicio, GruposServicio, FranjasServicio, DisponibilidadesServicio, HorariosServicio],
})
export class ModuloHorariosModulo implements OnModuleInit {
  constructor(
    @InjectRepository(NivelIdioma)
    private readonly nivelRepo: Repository<NivelIdioma>,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.sembrarNiveles();
  }

  private async sembrarNiveles(): Promise<void> {
    const niveles = [
      { codigo: CodigoNivel.A1, nombre: 'Principiante' },
      { codigo: CodigoNivel.A2, nombre: 'Elemental' },
      { codigo: CodigoNivel.B1, nombre: 'Intermedio' },
      { codigo: CodigoNivel.B2, nombre: 'Intermedio Alto' },
      { codigo: CodigoNivel.C1, nombre: 'Avanzado' },
    ];
    for (const nivel of niveles) {
      const existe = await this.nivelRepo.findOne({ where: { codigo: nivel.codigo } });
      if (!existe) await this.nivelRepo.save(this.nivelRepo.create(nivel));
    }
  }
}
