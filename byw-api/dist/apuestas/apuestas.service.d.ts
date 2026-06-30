import { DataSource, Repository } from 'typeorm';
import { EstadoApuesta, TipoApuesta } from '../common/enums';
import { Apuesta } from '../entities/apuesta.entity';
import { Partido } from '../entities/partido.entity';
import { TransaccionesService } from '../transacciones/transacciones.service';
import { ActualizarApuestaDto } from './dto/actualizar-apuesta.dto';
import { CrearApuestaDto } from './dto/crear-apuesta.dto';
export interface ApuestaResponse {
    id: string;
    partidoId: string;
    tipo: TipoApuesta;
    equipoElegidoId: string | null;
    golesLocalApostados: number | null;
    golesVisitanteApostados: number | null;
    montoPesos: string;
    premioPesos: string | null;
    estado: EstadoApuesta;
    fechaCreacion: Date;
}
export declare class ApuestasService {
    private readonly apuestasRepository;
    private readonly partidosRepository;
    private readonly transaccionesService;
    private readonly dataSource;
    constructor(apuestasRepository: Repository<Apuesta>, partidosRepository: Repository<Partido>, transaccionesService: TransaccionesService, dataSource: DataSource);
    listarPorUsuario(usuarioId: string): Promise<ApuestaResponse[]>;
    crear(usuarioId: string, dto: CrearApuestaDto): Promise<ApuestaResponse>;
    actualizar(usuarioId: string, apuestaId: string, dto: ActualizarApuestaDto): Promise<ApuestaResponse>;
    eliminar(usuarioId: string, apuestaId: string): Promise<void>;
    private validarPartidoParaApostar;
    private validarApuestaModificable;
    private obtenerPartido;
    private obtenerApuestaDeUsuario;
    private toResponse;
}
