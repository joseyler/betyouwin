"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Usuario = exports.Transaccion = exports.Partido = exports.Equipo = exports.Apuesta = exports.entities = void 0;
const apuesta_entity_1 = require("./apuesta.entity");
Object.defineProperty(exports, "Apuesta", { enumerable: true, get: function () { return apuesta_entity_1.Apuesta; } });
const equipo_entity_1 = require("./equipo.entity");
Object.defineProperty(exports, "Equipo", { enumerable: true, get: function () { return equipo_entity_1.Equipo; } });
const partido_entity_1 = require("./partido.entity");
Object.defineProperty(exports, "Partido", { enumerable: true, get: function () { return partido_entity_1.Partido; } });
const transaccion_entity_1 = require("./transaccion.entity");
Object.defineProperty(exports, "Transaccion", { enumerable: true, get: function () { return transaccion_entity_1.Transaccion; } });
const usuario_entity_1 = require("./usuario.entity");
Object.defineProperty(exports, "Usuario", { enumerable: true, get: function () { return usuario_entity_1.Usuario; } });
exports.entities = [equipo_entity_1.Equipo, usuario_entity_1.Usuario, partido_entity_1.Partido, apuesta_entity_1.Apuesta, transaccion_entity_1.Transaccion];
//# sourceMappingURL=index.js.map