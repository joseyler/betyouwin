import { TipoTransaccion } from '../common/enums';
import { Apuesta } from './apuesta.entity';
import { Usuario } from './usuario.entity';
export declare class Transaccion {
    id: string;
    usuarioId: string;
    apuestaId: string | null;
    tipo: TipoTransaccion;
    montoPesos: string;
    descripcion: string | null;
    fechaCreacion: Date;
    usuario: Usuario;
    apuesta: Apuesta | null;
}
