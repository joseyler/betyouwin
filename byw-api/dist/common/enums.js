"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TipoTransaccion = exports.EstadoApuesta = exports.TipoApuesta = exports.EstadoPartido = exports.FasePartido = void 0;
var FasePartido;
(function (FasePartido) {
    FasePartido["GRUPOS"] = "grupos";
    FasePartido["DIECISEISAVOS"] = "dieciseisavos";
    FasePartido["OCTAVOS"] = "octavos";
    FasePartido["CUARTOS"] = "cuartos";
    FasePartido["SEMIFINAL"] = "semifinal";
    FasePartido["TERCER_PUESTO"] = "tercer_puesto";
    FasePartido["FINAL"] = "final";
})(FasePartido || (exports.FasePartido = FasePartido = {}));
var EstadoPartido;
(function (EstadoPartido) {
    EstadoPartido["PROGRAMADO"] = "programado";
    EstadoPartido["EN_CURSO"] = "en_curso";
    EstadoPartido["FINALIZADO"] = "finalizado";
    EstadoPartido["CANCELADO"] = "cancelado";
})(EstadoPartido || (exports.EstadoPartido = EstadoPartido = {}));
var TipoApuesta;
(function (TipoApuesta) {
    TipoApuesta["GANADOR"] = "ganador";
    TipoApuesta["EMPATE"] = "empate";
    TipoApuesta["RESULTADO_EXACTO"] = "resultado_exacto";
})(TipoApuesta || (exports.TipoApuesta = TipoApuesta = {}));
var EstadoApuesta;
(function (EstadoApuesta) {
    EstadoApuesta["PENDIENTE"] = "pendiente";
    EstadoApuesta["GANADA"] = "ganada";
    EstadoApuesta["PERDIDA"] = "perdida";
    EstadoApuesta["CANCELADA"] = "cancelada";
})(EstadoApuesta || (exports.EstadoApuesta = EstadoApuesta = {}));
var TipoTransaccion;
(function (TipoTransaccion) {
    TipoTransaccion["INGRESO"] = "ingreso";
    TipoTransaccion["RETIRO"] = "retiro";
    TipoTransaccion["APUESTA"] = "apuesta";
    TipoTransaccion["GANANCIA"] = "ganancia";
})(TipoTransaccion || (exports.TipoTransaccion = TipoTransaccion = {}));
//# sourceMappingURL=enums.js.map