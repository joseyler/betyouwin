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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LiquidacionService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const enums_1 = require("../common/enums");
const apuesta_entity_1 = require("../entities/apuesta.entity");
const partido_entity_1 = require("../entities/partido.entity");
const transaccion_entity_1 = require("../entities/transaccion.entity");
const apuesta_ganadora_evaluator_1 = require("./apuesta-ganadora.evaluator");
const liquidacion_constants_1 = require("./liquidacion.constants");
let LiquidacionService = class LiquidacionService {
    partidosRepository;
    apuestasRepository;
    dataSource;
    constructor(partidosRepository, apuestasRepository, dataSource) {
        this.partidosRepository = partidosRepository;
        this.apuestasRepository = apuestasRepository;
        this.dataSource = dataSource;
    }
    async liquidarPartidoFinalizado(partidoId) {
        const partido = await this.partidosRepository.findOne({
            where: { id: partidoId },
        });
        if (!partido || partido.estado !== enums_1.EstadoPartido.FINALIZADO) {
            return;
        }
        if (partido.golesLocal === null || partido.golesVisitante === null) {
            return;
        }
        const apuestasPendientes = await this.apuestasRepository.find({
            where: { partidoId, estado: enums_1.EstadoApuesta.PENDIENTE },
        });
        for (const apuesta of apuestasPendientes) {
            await this.liquidarApuesta(apuesta.id, partido);
        }
    }
    async cancelarApuestasPartido(partidoId) {
        const partido = await this.partidosRepository.findOne({
            where: { id: partidoId },
        });
        if (!partido || partido.estado !== enums_1.EstadoPartido.CANCELADO) {
            return;
        }
        await this.apuestasRepository.update({ partidoId, estado: enums_1.EstadoApuesta.PENDIENTE }, { estado: enums_1.EstadoApuesta.CANCELADA });
    }
    async liquidarApuesta(apuestaId, partido) {
        await this.dataSource.transaction(async (manager) => {
            const apuesta = await manager.findOne(apuesta_entity_1.Apuesta, {
                where: { id: apuestaId, estado: enums_1.EstadoApuesta.PENDIENTE },
            });
            if (!apuesta) {
                return;
            }
            if ((0, apuesta_ganadora_evaluator_1.apuestaGanadora)(apuesta, partido)) {
                const coeficiente = liquidacion_constants_1.COEFICIENTE_PREMIO[apuesta.tipo];
                const premio = Number(apuesta.montoPesos) * coeficiente;
                apuesta.estado = enums_1.EstadoApuesta.GANADA;
                apuesta.premioPesos = premio.toFixed(2);
                await manager.save(apuesta);
                await manager.save(manager.create(transaccion_entity_1.Transaccion, {
                    usuarioId: apuesta.usuarioId,
                    apuestaId: apuesta.id,
                    tipo: enums_1.TipoTransaccion.GANANCIA,
                    montoPesos: premio.toFixed(2),
                    descripcion: null,
                }));
                return;
            }
            apuesta.estado = enums_1.EstadoApuesta.PERDIDA;
            await manager.save(apuesta);
        });
    }
};
exports.LiquidacionService = LiquidacionService;
exports.LiquidacionService = LiquidacionService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(partido_entity_1.Partido)),
    __param(1, (0, typeorm_1.InjectRepository)(apuesta_entity_1.Apuesta)),
    __param(2, (0, typeorm_1.InjectDataSource)()),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource])
], LiquidacionService);
//# sourceMappingURL=liquidacion.service.js.map