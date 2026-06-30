import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { LiquidacionService } from '../liquidacion/liquidacion.service';
import {
  PARTIDO_CANCELADO_EVENT,
  PartidoCanceladoEvent,
} from './events/partido-cancelado.event';
import {
  PARTIDO_FINALIZADO_EVENT,
  PartidoFinalizadoEvent,
} from './events/partido-finalizado.event';

@Injectable()
export class PartidoLiquidacionListener {
  private readonly logger = new Logger(PartidoLiquidacionListener.name);

  constructor(private readonly liquidacionService: LiquidacionService) {}

  @OnEvent(PARTIDO_FINALIZADO_EVENT)
  async handlePartidoFinalizado(event: PartidoFinalizadoEvent): Promise<void> {
    await this.liquidacionService.liquidarPartidoFinalizado(event.partidoId);
    this.logger.log(`Liquidacion completada para partido ${event.partidoId}`);
  }

  @OnEvent(PARTIDO_CANCELADO_EVENT)
  async handlePartidoCancelado(event: PartidoCanceladoEvent): Promise<void> {
    await this.liquidacionService.cancelarApuestasPartido(event.partidoId);
    this.logger.log(`Apuestas canceladas para partido ${event.partidoId}`);
  }
}
