import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { EstadoPartido, FasePartido } from '../common/enums';
import { Apuesta } from './apuesta.entity';
import { Equipo } from './equipo.entity';

@Entity('partidos')
export class Partido {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: string;

  @Column({ name: 'numero_oficial', type: 'int', unsigned: true, unique: true })
  numeroOficial: number;

  @Column({
    name: 'equipo_local_id',
    type: 'bigint',
    unsigned: true,
    nullable: true,
  })
  equipoLocalId: string | null;

  @Column({
    name: 'equipo_visitante_id',
    type: 'bigint',
    unsigned: true,
    nullable: true,
  })
  equipoVisitanteId: string | null;

  @Column({ type: 'varchar', length: 200, nullable: true })
  descripcion: string | null;

  @Column({ name: 'fecha_hora', type: 'datetime' })
  fechaHora: Date;

  @Column({
    name: 'goles_local',
    type: 'tinyint',
    unsigned: true,
    nullable: true,
  })
  golesLocal: number | null;

  @Column({
    name: 'goles_visitante',
    type: 'tinyint',
    unsigned: true,
    nullable: true,
  })
  golesVisitante: number | null;

  @Column({ type: 'enum', enum: FasePartido })
  fase: FasePartido;

  @Column({ type: 'char', length: 1, nullable: true })
  grupo: string | null;

  @Column({
    type: 'enum',
    enum: EstadoPartido,
    default: EstadoPartido.PROGRAMADO,
  })
  estado: EstadoPartido;

  @CreateDateColumn({ name: 'fecha_creacion', type: 'datetime' })
  fechaCreacion: Date;

  @ManyToOne(() => Equipo, (equipo) => equipo.partidosComoLocal, {
    nullable: true,
  })
  @JoinColumn({ name: 'equipo_local_id' })
  equipoLocal: Equipo | null;

  @ManyToOne(() => Equipo, (equipo) => equipo.partidosComoVisitante, {
    nullable: true,
  })
  @JoinColumn({ name: 'equipo_visitante_id' })
  equipoVisitante: Equipo | null;

  @OneToMany(() => Apuesta, (apuesta) => apuesta.partido)
  apuestas: Apuesta[];
}
