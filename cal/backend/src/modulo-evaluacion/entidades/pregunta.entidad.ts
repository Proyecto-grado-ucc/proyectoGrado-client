import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Dimension } from './dimension.entidad';

export enum TipoPregunta {
  Abierta = 'ABIERTA',
  Escala = 'ESCALA',
  OpcionMultiple = 'OPCION_MULTIPLE',
}

@Entity('pregunta')
export class Pregunta {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  texto: string;

  @Column({ type: 'enum', enum: TipoPregunta, default: TipoPregunta.Escala })
  tipo: TipoPregunta;

  @Column({ type: 'int', name: 'orden_idx', default: 0 })
  ordenIdx: number;

  @ManyToOne(() => Dimension, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'dimension_id' })
  dimension: Dimension;
}
