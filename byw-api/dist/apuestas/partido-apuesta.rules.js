"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.partidoIniciado = partidoIniciado;
exports.eliminatoriaSinEquipos = eliminatoriaSinEquipos;
exports.validarCamposPorTipo = validarCamposPorTipo;
const common_1 = require("@nestjs/common");
const enums_1 = require("../common/enums");
function partidoIniciado(partido) {
    return (partido.estado !== enums_1.EstadoPartido.PROGRAMADO ||
        partido.fechaHora.getTime() <= Date.now());
}
function eliminatoriaSinEquipos(partido) {
    return (partido.fase !== enums_1.FasePartido.GRUPOS &&
        (!partido.equipoLocalId || !partido.equipoVisitanteId));
}
function validarCamposPorTipo(partido, campos) {
    const { tipo, equipoElegidoId, golesLocalApostados, golesVisitanteApostados, } = campos;
    if (tipo === enums_1.TipoApuesta.GANADOR) {
        if (!equipoElegidoId) {
            throw new common_1.BadRequestException('ganador requiere equipo_elegido_id');
        }
        if (equipoElegidoId !== partido.equipoLocalId &&
            equipoElegidoId !== partido.equipoVisitanteId) {
            throw new common_1.BadRequestException('equipo_elegido_id debe pertenecer al partido');
        }
        if (golesLocalApostados != null || golesVisitanteApostados != null) {
            throw new common_1.BadRequestException('ganador no admite goles apostados');
        }
        return;
    }
    if (tipo === enums_1.TipoApuesta.EMPATE) {
        if (equipoElegidoId != null) {
            throw new common_1.BadRequestException('empate no admite equipo_elegido_id');
        }
        if (golesLocalApostados != null || golesVisitanteApostados != null) {
            throw new common_1.BadRequestException('empate no admite goles apostados');
        }
        return;
    }
    if (tipo === enums_1.TipoApuesta.RESULTADO_EXACTO) {
        if (equipoElegidoId != null) {
            throw new common_1.BadRequestException('resultado_exacto no admite equipo_elegido_id');
        }
        if (golesLocalApostados == null || golesVisitanteApostados == null) {
            throw new common_1.BadRequestException('resultado_exacto requiere goles apostados');
        }
    }
}
//# sourceMappingURL=partido-apuesta.rules.js.map