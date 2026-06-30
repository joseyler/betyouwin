import { EstadoPartido } from '../../common/enums';
export declare class ActualizarPartidoDto {
    equipoLocalId?: string | null;
    equipoVisitanteId?: string | null;
    golesLocal?: number | null;
    golesVisitante?: number | null;
    estado?: EstadoPartido;
}
