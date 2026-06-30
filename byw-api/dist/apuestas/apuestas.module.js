"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApuestasModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const apuesta_entity_1 = require("../entities/apuesta.entity");
const partido_entity_1 = require("../entities/partido.entity");
const transacciones_module_1 = require("../transacciones/transacciones.module");
const apuestas_controller_1 = require("./apuestas.controller");
const apuestas_service_1 = require("./apuestas.service");
let ApuestasModule = class ApuestasModule {
};
exports.ApuestasModule = ApuestasModule;
exports.ApuestasModule = ApuestasModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([apuesta_entity_1.Apuesta, partido_entity_1.Partido]), transacciones_module_1.TransaccionesModule],
        controllers: [apuestas_controller_1.ApuestasController],
        providers: [apuestas_service_1.ApuestasService],
        exports: [apuestas_service_1.ApuestasService],
    })
], ApuestasModule);
//# sourceMappingURL=apuestas.module.js.map