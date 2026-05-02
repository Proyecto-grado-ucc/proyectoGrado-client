import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Formulario } from './formulario.entidad';

@Entity('dimension')
export class Dimension {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 200 })
  nombre: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string | null;

  @Column({ type: 'float', default: 1.0 })
  peso: number;

  @ManyToOne(() => Formulario, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'formulario_id' })
  formulario: Formulario;

  @OneToMany('Pregunta', 'dimension')
  preguntas: unknown[];
}
