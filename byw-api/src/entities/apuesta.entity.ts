import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { EstadoApuesta, TipoApuesta } from '../common/enums';
import { Equipo } from './equipo.entity';
import { Partido } from './partido.entity';
import { Transaccion } from './transaccion.entity';
import { Usuario } from './usuario.entity';

@Entity('apuestas')
@Unique('uk_apuestas_usuario_partido', ['usuarioId', 'partidoId'])
export class Apuesta {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: string;

  @Column({ name: 'usuario_id', type: 'bigint', unsigned: true })
  usuarioId: string;

  @Column({ name: 'partido_id', type: 'bigint', unsigned: true })
  partidoId: string;

  @Column({ type: 'enum', enum: TipoApuesta })
  tipo: TipoApuesta;

  @Column({
    name: 'equipo_elegido_id',
    type: 'bigint',
    unsigned: true,
    nullable: true,
  })
  equipoElegidoId: string | null;

  @Column({
    name: 'goles_local_apostados',
    type: 'tinyint',
    unsigned: true,
    nullable: true,
  })
  golesLocalApostados: number | null;

  @Column({
    name: 'goles_visitante_apostados',
    type: 'tinyint',
    unsigned: true,
    nullable: true,
  })
  golesVisitanteApostados: number | null;

  @Column({ name: 'monto_pesos', type: 'decimal', precision: 15, scale: 2 })
  montoPesos: string;

  @Column({
    name: 'premio_pesos',
    type: 'decimal',
    precision: 15,
    scale: 2,
    nullable: true,
  })
  premioPesos: string | null;

  @Column({
    type: 'enum',
    enum: EstadoApuesta,
    default: EstadoApuesta.PENDIENTE,
  })
  estado: EstadoApuesta;

  @CreateDateColumn({ name: 'fecha_creacion', type: 'datetime' })
  fechaCreacion: Date;

  @ManyToOne(() => Usuario, (usuario) => usuario.apuestas)
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;

  @ManyToOne(() => Partido, (partido) => partido.apuestas)
  @JoinColumn({ name: 'partido_id' })
  partido: Partido;

  @ManyToOne(() => Equipo, (equipo) => equipo.apuestasElegidas, {
    nullable: true,
  })
  @JoinColumn({ name: 'equipo_elegido_id' })
  equipoElegido: Equipo | null;

  @OneToMany(() => Transaccion, (transaccion) => transaccion.apuesta)
  transacciones: Transaccion[];
}
