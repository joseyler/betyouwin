"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var PartidoLiquidacionListener_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PartidoLiquidacionListener = void 0;
const common_1 = require("@nestjs/common");
const event_emitter_1 = require("@nestjs/event-emitter");
const liquidacion_service_1 = require("../liquidacion/liquidacion.service");
const partido_cancelado_event_1 = require("./events/partido-cancelado.event");
const partido_finalizado_event_1 = require("./events/partido-finalizado.event");
let PartidoLiquidacionListener = PartidoLiquidacionListener_1 = class PartidoLiquidacionListener {
    liquidacionService;
    logger = new common_1.Logger(PartidoLiquidacionListener_1.name);
    constructor(liquidacionService) {
        this.liquidacionService = liquidacionService;
    }
    async handlePartidoFinalizado(event) {
        await this.liquidacionService.liquidarPartidoFinalizado(event.partidoId);
        this.logger.log(`Liquidacion completada para partido ${event.partidoId}`);
    }
    async handlePartidoCancelado(event) {
        await this.liquidacionService.cancelarApuestasPartido(event.partidoId);
        this.logger.log(`Apuestas canceladas para partido ${event.partidoId}`);
    }
};
exports.PartidoLiquidacionListener = PartidoLiquidacionListener;
__decorate([
    (0, event_emitter_1.OnEvent)(partido_finalizado_event_1.PARTIDO_FINALIZADO_EVENT),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [partido_finalizado_event_1.PartidoFinalizadoEvent]),
    __metadata("design:returntype", Promise)
], PartidoLiquidacionListener.prototype, "handlePartidoFinalizado", null);
__decorate([
    (0, event_emitter_1.OnEvent)(partido_cancelado_event_1.PARTIDO_CANCELADO_EVENT),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [partido_cancelado_event_1.PartidoCanceladoEvent]),
    __metadata("design:returntype", Promise)
], PartidoLiquidacionListener.prototype, "handlePartidoCancelado", null);
exports.PartidoLiquidacionListener = PartidoLiquidacionListener = PartidoLiquidacionListener_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [liquidacion_service_1.LiquidacionService])
], PartidoLiquidacionListener);
//# sourceMappingURL=partido-liquidacion.listener.js.map