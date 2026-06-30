"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PartidosModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const equipo_entity_1 = require("../entities/equipo.entity");
const partido_entity_1 = require("../entities/partido.entity");
const liquidacion_module_1 = require("../liquidacion/liquidacion.module");
const partido_liquidacion_listener_1 = require("./partido-liquidacion.listener");
const partidos_controller_1 = require("./partidos.controller");
const partidos_service_1 = require("./partidos.service");
let PartidosModule = class PartidosModule {
};
exports.PartidosModule = PartidosModule;
exports.PartidosModule = PartidosModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([partido_entity_1.Partido, equipo_entity_1.Equipo]), liquidacion_module_1.LiquidacionModule],
        controllers: [partidos_controller_1.PartidosController],
        providers: [partidos_service_1.PartidosService, partido_liquidacion_listener_1.PartidoLiquidacionListener],
        exports: [partidos_service_1.PartidosService],
    })
], PartidosModule);
//# sourceMappingURL=partidos.module.js.map