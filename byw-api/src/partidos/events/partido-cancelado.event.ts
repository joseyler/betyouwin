export const PARTIDO_CANCELADO_EVENT = 'partido.cancelado';

export class PartidoCanceladoEvent {
  constructor(public readonly partidoId: string) {}
}
