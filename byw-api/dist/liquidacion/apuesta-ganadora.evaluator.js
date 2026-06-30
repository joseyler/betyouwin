"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.apuestaGanadora = apuestaGanadora;
const enums_1 = require("../common/enums");
function apuestaGanadora(apuesta, partido) {
    const golesLocal = partido.golesLocal;
    const golesVisitante = partido.golesVisitante;
    if (golesLocal === null || golesVisitante === null) {
        return false;
    }
    if (apuesta.tipo === enums_1.TipoApuesta.GANADOR) {
        if (golesLocal === golesVisitante) {
            return false;
        }
        const equipoGanadorId = golesLocal > golesVisitante
            ? partido.equipoLocalId
            : partido.equipoVisitanteId;
        return apuesta.equipoElegidoId === equipoGanadorId;
    }
    if (apuesta.tipo === enums_1.TipoApuesta.EMPATE) {
        return golesLocal === golesVisitante;
    }
    return (apuesta.golesLocalApostados === golesLocal &&
        apuesta.golesVisitanteApostados === golesVisitante);
}
//# sourceMappingURL=apuesta-ganadora.evaluator.js.map