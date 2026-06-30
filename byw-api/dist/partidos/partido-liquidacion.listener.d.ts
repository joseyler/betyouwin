import { LiquidacionService } from '../liquidacion/liquidacion.service';
import { PartidoCanceladoEvent } from './events/partido-cancelado.event';
import { PartidoFinalizadoEvent } from './events/partido-finalizado.event';
export declare class PartidoLiquidacionListener {
    private readonly liquidacionService;
    private readonly logger;
    constructor(liquidacionService: LiquidacionService);
    handlePartidoFinalizado(event: PartidoFinalizadoEvent): Promise<void>;
    handlePartidoCancelado(event: PartidoCanceladoEvent): Promise<void>;
}
