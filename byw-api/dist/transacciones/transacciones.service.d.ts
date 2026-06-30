import { Repository } from 'typeorm';
import { Transaccion } from '../entities/transaccion.entity';
export declare class TransaccionesService {
    private readonly transaccionesRepository;
    constructor(transaccionesRepository: Repository<Transaccion>);
    calcularSaldo(usuarioId: string): Promise<number>;
    registrarIngreso(usuarioId: string, montoPesos: number, descripcion?: string): Promise<Transaccion>;
    registrarRetiro(usuarioId: string, montoPesos: number, descripcion?: string): Promise<Transaccion>;
    registrarApuesta(usuarioId: string, apuestaId: string, montoPesos: number): Promise<Transaccion>;
    actualizarMontoApuesta(apuestaId: string, montoPesos: number): Promise<void>;
    eliminarTransaccionesApuesta(apuestaId: string): Promise<void>;
}
