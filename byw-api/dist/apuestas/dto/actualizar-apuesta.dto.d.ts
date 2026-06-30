import { TipoApuesta } from '../../common/enums';
export declare class ActualizarApuestaDto {
    tipo?: TipoApuesta;
    equipoElegidoId?: string | null;
    golesLocalApostados?: number | null;
    golesVisitanteApostados?: number | null;
    montoPesos?: number;
}
