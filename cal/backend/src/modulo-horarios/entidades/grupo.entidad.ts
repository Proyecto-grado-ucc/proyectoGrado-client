import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Curso } from './curso.entidad';

export enum Jornada {
  Manana = 'MANANA',
  Tarde = 'TARDE',
  Noche = 'NOCHE',
}

@Entity('grupo')
export class Grupo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 20 })
  codigo: string;

  @ManyToOne(() => Curso, { eager: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'curso_id' })
  curso: Curso;

  @Column({ type: 'int', name: 'cupo_max' })
  cupoMax: number;

  @Column({ type: 'enum', enum: Jornada })
  jornada: Jornada;

  @Column({ type: 'varchar', length: 10, nullable: true })
  codigoAcceso: string;
}
