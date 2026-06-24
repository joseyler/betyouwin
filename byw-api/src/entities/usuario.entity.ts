import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Apuesta } from './apuesta.entity';
import { Transaccion } from './transaccion.entity';

@Entity('usuarios')
export class Usuario {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ name: 'nombre_completo', type: 'varchar', length: 200 })
  nombreCompleto: string;

  @Column({ type: 'varchar', length: 20, unique: true })
  dni: string;

  @Column({ type: 'varchar', length: 300 })
  direccion: string;

  @Column({ type: 'varchar', length: 30 })
  telefono: string;

  @Column({ name: 'password_hash', type: 'varchar', length: 255 })
  passwordHash: string;

  @CreateDateColumn({ name: 'fecha_creacion', type: 'datetime' })
  fechaCreacion: Date;

  @UpdateDateColumn({ name: 'fecha_actualizacion', type: 'datetime' })
  fechaActualizacion: Date;

  @OneToMany(() => Apuesta, (apuesta) => apuesta.usuario)
  apuestas: Apuesta[];

  @OneToMany(() => Transaccion, (transaccion) => transaccion.usuario)
  transacciones: Transaccion[];
}
