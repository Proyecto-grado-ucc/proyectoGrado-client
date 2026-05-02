import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('resultado_kdd')
export class ResultadoKdd {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'periodo_id' })
  periodoId: number;

  @Column({ name: 'docente_id' })
  docenteId: number;

  @Column({ name: 'puntuacion_global', type: 'float' })
  puntuacionGlobal: number;

  @Column({ name: 'total_evaluaciones', type: 'int' })
  totalEvaluaciones: number;

  @Column({ name: 'detalle_dimensiones', type: 'jsonb' })
  detalleDimensiones: Record<string, number>;

  @CreateDateColumn({ name: 'creado_en', type: 'timestamptz' })
  creadoEn: Date;
}
