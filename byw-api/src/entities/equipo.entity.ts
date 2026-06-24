import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Apuesta } from './apuesta.entity';
import { Partido } from './partido.entity';

@Entity('equipos')
export class Equipo {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: string;

  @Column({ type: 'varchar', length: 100 })
  nombre: string;

  @Column({ name: 'codigo_pais', type: 'char', length: 3 })
  codigoPais: string;

  @Column({ type: 'char', length: 1 })
  grupo: string;

  @CreateDateColumn({ name: 'fecha_creacion', type: 'datetime' })
  fechaCreacion: Date;

  @OneToMany(() => Partido, (partido) => partido.equipoLocal)
  partidosComoLocal: Partido[];

  @OneToMany(() => Partido, (partido) => partido.equipoVisitante)
  partidosComoVisitante: Partido[];

  @OneToMany(() => Apuesta, (apuesta) => apuesta.equipoElegido)
  apuestasElegidas: Apuesta[];
}
