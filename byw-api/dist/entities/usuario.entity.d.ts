import { Apuesta } from './apuesta.entity';
import { Transaccion } from './transaccion.entity';
export declare class Usuario {
    id: string;
    email: string;
    nombreCompleto: string;
    dni: string;
    direccion: string;
    telefono: string;
    passwordHash: string;
    fechaCreacion: Date;
    fechaActualizacion: Date;
    apuestas: Apuesta[];
    transacciones: Transaccion[];
}
