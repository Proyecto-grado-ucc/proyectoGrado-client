import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Rol } from './rol.entidad';

@Entity('usuario')
export class Usuario {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 200 })
  nombre: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255, name: 'password_hash', select: false })
  passwordHash: string;

  @ManyToOne(() => Rol, { eager: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'rol_id' })
  rol: Rol;

  @Column({ type: 'boolean', default: true })
  activo: boolean;

  @CreateDateColumn({ name: 'fecha_creacion', type: 'timestamptz' })
  fechaCreacion: Date;

  // Recuperacion de contrasena
  @Column({ type: 'varchar', length: 255, name: 'reset_token', nullable: true, select: false })
  resetToken: string | null;

  @Column({ type: 'timestamptz', name: 'reset_token_expiry', nullable: true, select: false })
  resetTokenExpiry: Date | null;

  @OneToMany('Sesion', 'usuario')
  sesiones: unknown[];
}
