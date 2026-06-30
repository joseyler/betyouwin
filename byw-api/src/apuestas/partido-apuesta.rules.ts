import { BadRequestException } from '@nestjs/common';
import { EstadoPartido, FasePartido, TipoApuesta } from '../common/enums';
import { Partido } from '../entities/partido.entity';

export function partidoIniciado(partido: Partido): boolean {
  return (
    partido.estado !== EstadoPartido.PROGRAMADO ||
    partido.fechaHora.getTime() <= Date.now()
  );
}

export function eliminatoriaSinEquipos(partido: Partido): boolean {
  return (
    partido.fase !== FasePartido.GRUPOS &&
    (!partido.equipoLocalId || !partido.equipoVisitanteId)
  );
}

export interface CamposApuesta {
  tipo: TipoApuesta;
  equipoElegidoId?: string | null;
  golesLocalApostados?: number | null;
  golesVisitanteApostados?: number | null;
}

export function validarCamposPorTipo(
  partido: Partido,
  campos: CamposApuesta,
): void {
  const {
    tipo,
    equipoElegidoId,
    golesLocalApostados,
    golesVisitanteApostados,
  } = campos;

  if (tipo === TipoApuesta.GANADOR) {
    if (!equipoElegidoId) {
      throw new BadRequestException('ganador requiere equipo_elegido_id');
    }
    if (
      equipoElegidoId !== partido.equipoLocalId &&
      equipoElegidoId !== partido.equipoVisitanteId
    ) {
      throw new BadRequestException(
        'equipo_elegido_id debe pertenecer al partido',
      );
    }
    if (golesLocalApostados != null || golesVisitanteApostados != null) {
      throw new BadRequestException('ganador no admite goles apostados');
    }
    return;
  }

  if (tipo === TipoApuesta.EMPATE) {
    if (equipoElegidoId != null) {
      throw new BadRequestException('empate no admite equipo_elegido_id');
    }
    if (golesLocalApostados != null || golesVisitanteApostados != null) {
      throw new BadRequestException('empate no admite goles apostados');
    }
    return;
  }

  if (tipo === TipoApuesta.RESULTADO_EXACTO) {
    if (equipoElegidoId != null) {
      throw new BadRequestException(
        'resultado_exacto no admite equipo_elegido_id',
      );
    }
    if (golesLocalApostados == null || golesVisitanteApostados == null) {
      throw new BadRequestException(
        'resultado_exacto requiere goles apostados',
      );
    }
  }
}
