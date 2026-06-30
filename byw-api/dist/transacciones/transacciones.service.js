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
exports.TransaccionesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const enums_1 = require("../common/enums");
const transaccion_entity_1 = require("../entities/transaccion.entity");
let TransaccionesService = class TransaccionesService {
    transaccionesRepository;
    constructor(transaccionesRepository) {
        this.transaccionesRepository = transaccionesRepository;
    }
    async calcularSaldo(usuarioId) {
        const resultado = await this.transaccionesRepository
            .createQueryBuilder('t')
            .select(`COALESCE(SUM(
          CASE t.tipo
            WHEN :ingreso THEN t.monto_pesos
            WHEN :ganancia THEN t.monto_pesos
            WHEN :retiro THEN -t.monto_pesos
            WHEN :apuesta THEN -t.monto_pesos
            ELSE 0
          END
        ), 0)`, 'saldo')
            .where('t.usuario_id = :usuarioId', { usuarioId })
            .setParameters({
            ingreso: enums_1.TipoTransaccion.INGRESO,
            ganancia: enums_1.TipoTransaccion.GANANCIA,
            retiro: enums_1.TipoTransaccion.RETIRO,
            apuesta: enums_1.TipoTransaccion.APUESTA,
        })
            .getRawOne();
        return Number(resultado?.saldo ?? 0);
    }
    async registrarIngreso(usuarioId, montoPesos, descripcion) {
        const transaccion = this.transaccionesRepository.create({
            usuarioId,
            tipo: enums_1.TipoTransaccion.INGRESO,
            montoPesos: montoPesos.toFixed(2),
            descripcion: descripcion ?? null,
            apuestaId: null,
        });
        return this.transaccionesRepository.save(transaccion);
    }
    async registrarRetiro(usuarioId, montoPesos, descripcion) {
        const saldo = await this.calcularSaldo(usuarioId);
        if (montoPesos > saldo) {
            throw new common_1.BadRequestException('saldo insuficiente para retiro');
        }
        const transaccion = this.transaccionesRepository.create({
            usuarioId,
            tipo: enums_1.TipoTransaccion.RETIRO,
            montoPesos: montoPesos.toFixed(2),
            descripcion: descripcion ?? null,
            apuestaId: null,
        });
        return this.transaccionesRepository.save(transaccion);
    }
    async registrarApuesta(usuarioId, apuestaId, montoPesos) {
        const transaccion = this.transaccionesRepository.create({
            usuarioId,
            apuestaId,
            tipo: enums_1.TipoTransaccion.APUESTA,
            montoPesos: montoPesos.toFixed(2),
            descripcion: null,
        });
        return this.transaccionesRepository.save(transaccion);
    }
    async actualizarMontoApuesta(apuestaId, montoPesos) {
        const transaccion = await this.transaccionesRepository.findOne({
            where: { apuestaId, tipo: enums_1.TipoTransaccion.APUESTA },
        });
        if (!transaccion) {
            throw new common_1.BadRequestException('transaccion de apuesta no encontrada');
        }
        transaccion.montoPesos = montoPesos.toFixed(2);
        await this.transaccionesRepository.save(transaccion);
    }
    async eliminarTransaccionesApuesta(apuestaId) {
        await this.transaccionesRepository.delete({
            apuestaId,
            tipo: enums_1.TipoTransaccion.APUESTA,
        });
    }
};
exports.TransaccionesService = TransaccionesService;
exports.TransaccionesService = TransaccionesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(transaccion_entity_1.Transaccion)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], TransaccionesService);
//# sourceMappingURL=transacciones.service.js.map