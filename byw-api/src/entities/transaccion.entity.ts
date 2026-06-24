import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TipoTransaccion } from '../common/enums';
import { Apuesta } from './apuesta.entity';
import { Usuario } from './usuario.entity';

@Entity('transacciones')
export class Transaccion {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: string;

  @Column({ name: 'usuario_id', type: 'bigint', unsigned: true })
  usuarioId: string;

  @Column({
    name: 'apuesta_id',
    type: 'bigint',
    unsigned: true,
    nullable: true,
  })
  apuestaId: string | null;

  @Column({ type: 'enum', enum: TipoTransaccion })
  tipo: TipoTransaccion;

  @Column({ name: 'monto_pesos', type: 'decimal', precision: 15, scale: 2 })
  montoPesos: string;

  @Column({ type: 'varchar', length: 300, nullable: true })
  descripcion: string | null;

  @CreateDateColumn({ name: 'fecha_creacion', type: 'datetime' })
  fechaCreacion: Date;

  @ManyToOne(() => Usuario, (usuario) => usuario.transacciones)
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;

  @ManyToOne(() => Apuesta, (apuesta) => apuesta.transacciones, {
    nullable: true,
  })
  @JoinColumn({ name: 'apuesta_id' })
  apuesta: Apuesta | null;
}
