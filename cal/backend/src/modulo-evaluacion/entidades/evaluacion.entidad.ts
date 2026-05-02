import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Docente } from '../../compartido/entidades/docente.entidad';
import { Formulario } from './formulario.entidad';

export enum EstadoEvaluacion {
  Pendiente = 'PENDIENTE',
  EnProgreso = 'EN_PROGRESO',
  Completada = 'COMPLETADA',
}

@Entity('evaluacion')
export class Evaluacion {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Formulario, { eager: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'formulario_id' })
  formulario: Formulario;

  @ManyToOne(() => Docente, { eager: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'docente_evaluado_id' })
  docenteEvaluado: Docente;

  @Column({ type: 'int', name: 'evaluador_id', nullable: true })
  evaluadorId: number | null;

  @Column({ type: 'enum', enum: EstadoEvaluacion, default: EstadoEvaluacion.Pendiente })
  estado: EstadoEvaluacion;

  @CreateDateColumn({ name: 'creado_en', type: 'timestamptz' })
  creadoEn: Date;

  @OneToMany('Respuesta', 'evaluacion')
  respuestas: unknown[];
}
