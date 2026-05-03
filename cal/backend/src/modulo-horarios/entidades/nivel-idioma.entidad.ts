import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

export enum CodigoNivel {
  A1 = 'A1',
  A2 = 'A2',
  B1 = 'B1',
  B2 = 'B2',
  C1 = 'C1',
}

@Entity('nivel_idioma')
export class NivelIdioma {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: CodigoNivel, unique: true })
  codigo: CodigoNivel;

  @Column({ type: 'varchar', length: 100 })
  nombre: string;

  @OneToMany('Curso', 'nivel')
  cursos: unknown[];
}
