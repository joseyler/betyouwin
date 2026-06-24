import { EstadoApuesta, TipoApuesta } from '../common/enums';
import { Equipo } from './equipo.entity';
import { Partido } from './partido.entity';
import { Transaccion } from './transaccion.entity';
import { Usuario } from './usuario.entity';
export declare class Apuesta {
    id: string;
    usuarioId: string;
    partidoId: string;
    tipo: TipoApuesta;
    equipoElegidoId: string | null;
    golesLocalApostados: number | null;
    golesVisitanteApostados: number | null;
    montoPesos: string;
    premioPesos: string | null;
    estado: EstadoApuesta;
    fechaCreacion: Date;
    usuario: Usuario;
    partido: Partido;
    equipoElegido: Equipo | null;
    transacciones: Transaccion[];
}
