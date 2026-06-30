import { TipoApuesta } from '../../common/enums';
export declare class CrearApuestaDto {
    partidoId: string;
    tipo: TipoApuesta;
    equipoElegidoId?: string;
    golesLocalApostados?: number;
    golesVisitanteApostados?: number;
    montoPesos: number;
}
