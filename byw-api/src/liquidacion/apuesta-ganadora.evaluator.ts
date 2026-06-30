import { TipoApuesta } from '../common/enums';
import { Apuesta } from '../entities/apuesta.entity';
import { Partido } from '../entities/partido.entity';

export function apuestaGanadora(apuesta: Apuesta, partido: Partido): boolean {
  const golesLocal = partido.golesLocal;
  const golesVisitante = partido.golesVisitante;

  if (golesLocal === null || golesVisitante === null) {
    return false;
  }

  if (apuesta.tipo === TipoApuesta.GANADOR) {
    if (golesLocal === golesVisitante) {
      return false;
    }

    const equipoGanadorId =
      golesLocal > golesVisitante
        ? partido.equipoLocalId
        : partido.equipoVisitanteId;

    return apuesta.equipoElegidoId === equipoGanadorId;
  }

  if (apuesta.tipo === TipoApuesta.EMPATE) {
    return golesLocal === golesVisitante;
  }

  return (
    apuesta.golesLocalApostados === golesLocal &&
    apuesta.golesVisitanteApostados === golesVisitante
  );
}
