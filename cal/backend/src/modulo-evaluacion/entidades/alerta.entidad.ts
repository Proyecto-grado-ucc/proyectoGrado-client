import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum TipoAlerta {
  BAJO_RENDIMIENTO = 'BAJO_RENDIMIENTO',
  MEJORA_NOTABLE = 'MEJORA_NOTABLE',
  SIN_EVALUACIONES = 'SIN_EVALUACIONES',
}

export enum NivelAlerta {
  INFO = 'INFO',
  ADVERTENCIA = 'ADVERTENCIA',
  CRITICO = 'CRITICO',
}

@Entity('alerta')
export class Alerta {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'docente_id' })
  docenteId: number;

  @Column({ name: 'periodo_id' })
  periodoId: number;

  @Column({ type: 'enum', enum: TipoAlerta })
  tipo: TipoAlerta;

  @Column({ type: 'enum', enum: NivelAlerta })
  nivel: NivelAlerta;

  @Column({ type: 'text' })
  mensaje: string;

  @Column({ default: false })
  leida: boolean;

  @CreateDateColumn({ name: 'creado_en', type: 'timestamptz' })
  creadoEn: Date;
}
