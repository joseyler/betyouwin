"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LiquidacionModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const apuesta_entity_1 = require("../entities/apuesta.entity");
const partido_entity_1 = require("../entities/partido.entity");
const liquidacion_service_1 = require("./liquidacion.service");
let LiquidacionModule = class LiquidacionModule {
};
exports.LiquidacionModule = LiquidacionModule;
exports.LiquidacionModule = LiquidacionModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([partido_entity_1.Partido, apuesta_entity_1.Apuesta])],
        providers: [liquidacion_service_1.LiquidacionService],
        exports: [liquidacion_service_1.LiquidacionService],
    })
], LiquidacionModule);
//# sourceMappingURL=liquidacion.module.js.map