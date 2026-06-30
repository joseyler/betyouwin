import { ActualizarPartidoDto } from './dto/actualizar-partido.dto';
import { ListarPartidosQueryDto } from './dto/listar-partidos-query.dto';
import { PartidosService } from './partidos.service';
export declare class PartidosController {
    private readonly partidosService;
    constructor(partidosService: PartidosService);
    listar(query: ListarPartidosQueryDto): Promise<import("./partidos.service").PartidoResponse[]>;
    actualizar(id: string, dto: ActualizarPartidoDto): Promise<import("./partidos.service").PartidoResponse>;
}
