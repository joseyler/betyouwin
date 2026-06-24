import { Apuesta } from './apuesta.entity';
import { Equipo } from './equipo.entity';
import { Partido } from './partido.entity';
import { Transaccion } from './transaccion.entity';
import { Usuario } from './usuario.entity';

export const entities = [Equipo, Usuario, Partido, Apuesta, Transaccion];

export { Apuesta, Equipo, Partido, Transaccion, Usuario };
