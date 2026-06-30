import { EventEmitter2 } from '@nestjs/event-emitter';
import { Repository } from 'typeorm';
import { EstadoPartido, FasePartido } from '../common/enums';
import { Equipo } from '../entities/equipo.entity';
import { Partido } from '../entities/partido.entity';
import { ActualizarPartidoDto } from './dto/actualizar-partido.dto';
import { ListarPartidosQueryDto } from './dto/listar-partidos-query.dto';
export interface EquipoResumen {
    id: string;
    nombre: string;
    codigoPais: string;
}
export interface PartidoResponse {
    id: string;
    numeroOficial: number;
    fechaHora: Date;
    fase: FasePartido;
    grupo: string | null;
    estado: EstadoPartido;
    descripcion: string | null;
    golesLocal: number | null;
    golesVisitante: number | null;
    equipoLocal: EquipoResumen | null;
    equipoVisitante: EquipoResumen | null;
}
export declare class PartidosService {
    private readonly partidosRepository;
    private readonly equiposRepository;
    private readonly eventEmitter;
    constructor(partidosRepository: Repository<Partido>, equiposRepository: Repository<Equipo>, eventEmitter: EventEmitter2);
    listar(filtros: ListarPartidosQueryDto): Promise<PartidoResponse[]>;
    actualizar(partidoId: string, dto: ActualizarPartidoDto): Promise<PartidoResponse>;
    private validarEquipo;
    private toResponse;
}
