import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Pregunta } from './pregunta.entidad';
import { Evaluacion } from './evaluacion.entidad';

@Entity('respuesta')
export class Respuesta {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Evaluacion, { eager: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'evaluacion_id' })
  evaluacion: Evaluacion;

  @ManyToOne(() => Pregunta, { eager: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'pregunta_id' })
  pregunta: Pregunta;

  @Column({ type: 'float', name: 'valor_numerico', nullable: true })
  valorNumerico: number | null;

  @Column({ type: 'text', name: 'valor_texto', nullable: true })
  valorTexto: string | null;
}
