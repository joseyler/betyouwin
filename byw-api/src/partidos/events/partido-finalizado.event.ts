export const PARTIDO_FINALIZADO_EVENT = 'partido.finalizado';

export class PartidoFinalizadoEvent {
  constructor(public readonly partidoId: string) {}
}
