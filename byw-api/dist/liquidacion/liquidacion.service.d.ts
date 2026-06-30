import { DataSource, Repository } from 'typeorm';
import { Apuesta } from '../entities/apuesta.entity';
import { Partido } from '../entities/partido.entity';
export declare class LiquidacionService {
    private readonly partidosRepository;
    private readonly apuestasRepository;
    private readonly dataSource;
    constructor(partidosRepository: Repository<Partido>, apuestasRepository: Repository<Apuesta>, dataSource: DataSource);
    liquidarPartidoFinalizado(partidoId: string): Promise<void>;
    cancelarApuestasPartido(partidoId: string): Promise<void>;
    private liquidarApuesta;
}
