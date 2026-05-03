import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { PeriodoAcademico } from '../../compartido/entidades/periodo-academico.entidad';
import { Asignacion } from '../motor/tipos';

@Entity('horario')
export class Horario {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => PeriodoAcademico, { eager: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'periodo_id' })
  periodo: PeriodoAcademico;

  @Column({ type: 'jsonb' })
  asignaciones: Asignacion[];

  @Column({ type: 'float' })
  fitness: number;

  @Column({ type: 'int' })
  generaciones: number;

  @Column({ type: 'int', name: 'tiempo_ms' })
  tiempoMs: number;

  @Column({ type: 'jsonb', nullable: true })
  metadatos: Record<string, unknown> | null;

  @CreateDateColumn({ name: 'creado_en', type: 'timestamptz' })
  creadoEn: Date;
}
