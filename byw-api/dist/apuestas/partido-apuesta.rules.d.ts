import { TipoApuesta } from '../common/enums';
import { Partido } from '../entities/partido.entity';
export declare function partidoIniciado(partido: Partido): boolean;
export declare function eliminatoriaSinEquipos(partido: Partido): boolean;
export interface CamposApuesta {
    tipo: TipoApuesta;
    equipoElegidoId?: string | null;
    golesLocalApostados?: number | null;
    golesVisitanteApostados?: number | null;
}
export declare function validarCamposPorTipo(partido: Partido, campos: CamposApuesta): void;
