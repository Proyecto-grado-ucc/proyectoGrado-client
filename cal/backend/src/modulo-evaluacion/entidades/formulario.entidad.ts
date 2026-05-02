import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { PeriodoAcademico } from '../../compartido/entidades/periodo-academico.entidad';

@Entity('formulario')
export class Formulario {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 200 })
  titulo: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string | null;

  @ManyToOne(() => PeriodoAcademico, { eager: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'periodo_id' })
  periodo: PeriodoAcademico;

  @Column({ type: 'boolean', default: true })
  activo: boolean;

  @OneToMany('Dimension', 'formulario')
  dimensiones: unknown[];
}
