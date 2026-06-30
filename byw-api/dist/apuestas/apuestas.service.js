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
exports.ApuestasService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const enums_1 = require("../common/enums");
const apuesta_entity_1 = require("../entities/apuesta.entity");
const partido_entity_1 = require("../entities/partido.entity");
const transaccion_entity_1 = require("../entities/transaccion.entity");
const transacciones_service_1 = require("../transacciones/transacciones.service");
const partido_apuesta_rules_1 = require("./partido-apuesta.rules");
let ApuestasService = class ApuestasService {
    apuestasRepository;
    partidosRepository;
    transaccionesService;
    dataSource;
    constructor(apuestasRepository, partidosRepository, transaccionesService, dataSource) {
        this.apuestasRepository = apuestasRepository;
        this.partidosRepository = partidosRepository;
        this.transaccionesService = transaccionesService;
        this.dataSource = dataSource;
    }
    async listarPorUsuario(usuarioId) {
        const apuestas = await this.apuestasRepository.find({
            where: { usuarioId },
            order: { fechaCreacion: 'DESC' },
        });
        return apuestas.map((apuesta) => this.toResponse(apuesta));
    }
    async crear(usuarioId, dto) {
        const partido = await this.obtenerPartido(dto.partidoId);
        this.validarPartidoParaApostar(partido);
        (0, partido_apuesta_rules_1.validarCamposPorTipo)(partido, {
            tipo: dto.tipo,
            equipoElegidoId: dto.equipoElegidoId ?? null,
            golesLocalApostados: dto.golesLocalApostados ?? null,
            golesVisitanteApostados: dto.golesVisitanteApostados ?? null,
        });
        const saldo = await this.transaccionesService.calcularSaldo(usuarioId);
        if (dto.montoPesos > saldo) {
            throw new common_1.BadRequestException('monto supera saldo disponible');
        }
        try {
            const apuesta = await this.dataSource.transaction(async (manager) => {
                const nuevaApuesta = manager.create(apuesta_entity_1.Apuesta, {
                    usuarioId,
                    partidoId: dto.partidoId,
                    tipo: dto.tipo,
                    equipoElegidoId: dto.tipo === enums_1.TipoApuesta.GANADOR
                        ? (dto.equipoElegidoId ?? null)
                        : null,
                    golesLocalApostados: dto.tipo === enums_1.TipoApuesta.RESULTADO_EXACTO
                        ? (dto.golesLocalApostados ?? null)
                        : null,
                    golesVisitanteApostados: dto.tipo === enums_1.TipoApuesta.RESULTADO_EXACTO
                        ? (dto.golesVisitanteApostados ?? null)
                        : null,
                    montoPesos: dto.montoPesos.toFixed(2),
                    estado: enums_1.EstadoApuesta.PENDIENTE,
                });
                const guardada = await manager.save(nuevaApuesta);
                const transaccion = manager.create(transaccion_entity_1.Transaccion, {
                    usuarioId,
                    apuestaId: guardada.id,
                    tipo: enums_1.TipoTransaccion.APUESTA,
                    montoPesos: dto.montoPesos.toFixed(2),
                    descripcion: null,
                });
                await manager.save(transaccion);
                return guardada;
            });
            return this.toResponse(apuesta);
        }
        catch (error) {
            if (error instanceof typeorm_2.QueryFailedError &&
                error.driverError.code === 'ER_DUP_ENTRY') {
                throw new common_1.ConflictException('ya existe apuesta para este partido');
            }
            throw error;
        }
    }
    async actualizar(usuarioId, apuestaId, dto) {
        const apuesta = await this.obtenerApuestaDeUsuario(usuarioId, apuestaId);
        this.validarApuestaModificable(apuesta);
        const partido = await this.obtenerPartido(apuesta.partidoId);
        this.validarPartidoParaApostar(partido);
        const tipo = dto.tipo ?? apuesta.tipo;
        const equipoElegidoId = dto.equipoElegidoId !== undefined
            ? dto.equipoElegidoId
            : apuesta.equipoElegidoId;
        const golesLocalApostados = dto.golesLocalApostados !== undefined
            ? dto.golesLocalApostados
            : apuesta.golesLocalApostados;
        const golesVisitanteApostados = dto.golesVisitanteApostados !== undefined
            ? dto.golesVisitanteApostados
            : apuesta.golesVisitanteApostados;
        (0, partido_apuesta_rules_1.validarCamposPorTipo)(partido, {
            tipo,
            equipoElegidoId,
            golesLocalApostados,
            golesVisitanteApostados,
        });
        const montoNuevo = dto.montoPesos ?? Number(apuesta.montoPesos);
        const montoAnterior = Number(apuesta.montoPesos);
        if (montoNuevo > montoAnterior) {
            const saldo = await this.transaccionesService.calcularSaldo(usuarioId);
            const saldoEfectivo = saldo + montoAnterior;
            if (montoNuevo > saldoEfectivo) {
                throw new common_1.BadRequestException('monto supera saldo disponible');
            }
        }
        apuesta.tipo = tipo;
        apuesta.equipoElegidoId =
            tipo === enums_1.TipoApuesta.GANADOR ? equipoElegidoId : null;
        apuesta.golesLocalApostados =
            tipo === enums_1.TipoApuesta.RESULTADO_EXACTO ? golesLocalApostados : null;
        apuesta.golesVisitanteApostados =
            tipo === enums_1.TipoApuesta.RESULTADO_EXACTO ? golesVisitanteApostados : null;
        apuesta.montoPesos = montoNuevo.toFixed(2);
        const guardada = await this.apuestasRepository.save(apuesta);
        if (montoNuevo !== montoAnterior) {
            await this.transaccionesService.actualizarMontoApuesta(apuesta.id, montoNuevo);
        }
        return this.toResponse(guardada);
    }
    async eliminar(usuarioId, apuestaId) {
        const apuesta = await this.obtenerApuestaDeUsuario(usuarioId, apuestaId);
        this.validarApuestaModificable(apuesta);
        const partido = await this.obtenerPartido(apuesta.partidoId);
        this.validarPartidoParaApostar(partido);
        await this.dataSource.transaction(async (manager) => {
            await manager.delete(transaccion_entity_1.Transaccion, {
                apuestaId: apuesta.id,
                tipo: enums_1.TipoTransaccion.APUESTA,
            });
            await manager.delete(apuesta_entity_1.Apuesta, { id: apuesta.id });
        });
    }
    validarPartidoParaApostar(partido) {
        if ((0, partido_apuesta_rules_1.partidoIniciado)(partido)) {
            throw new common_1.BadRequestException('el partido ya inicio');
        }
        if ((0, partido_apuesta_rules_1.eliminatoriaSinEquipos)(partido)) {
            throw new common_1.BadRequestException('eliminatoria sin equipos definidos no admite apuestas');
        }
    }
    validarApuestaModificable(apuesta) {
        if (apuesta.estado !== enums_1.EstadoApuesta.PENDIENTE) {
            throw new common_1.BadRequestException('solo se pueden modificar apuestas pendientes');
        }
    }
    async obtenerPartido(partidoId) {
        const partido = await this.partidosRepository.findOne({
            where: { id: partidoId },
        });
        if (!partido) {
            throw new common_1.NotFoundException('partido no encontrado');
        }
        return partido;
    }
    async obtenerApuestaDeUsuario(usuarioId, apuestaId) {
        const apuesta = await this.apuestasRepository.findOne({
            where: { id: apuestaId, usuarioId },
        });
        if (!apuesta) {
            throw new common_1.NotFoundException('apuesta no encontrada');
        }
        return apuesta;
    }
    toResponse(apuesta) {
        return {
            id: apuesta.id,
            partidoId: apuesta.partidoId,
            tipo: apuesta.tipo,
            equipoElegidoId: apuesta.equipoElegidoId,
            golesLocalApostados: apuesta.golesLocalApostados,
            golesVisitanteApostados: apuesta.golesVisitanteApostados,
            montoPesos: apuesta.montoPesos,
            premioPesos: apuesta.premioPesos,
            estado: apuesta.estado,
            fechaCreacion: apuesta.fechaCreacion,
        };
    }
};
exports.ApuestasService = ApuestasService;
exports.ApuestasService = ApuestasService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(apuesta_entity_1.Apuesta)),
    __param(1, (0, typeorm_1.InjectRepository)(partido_entity_1.Partido)),
    __param(3, (0, typeorm_1.InjectDataSource)()),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        transacciones_service_1.TransaccionesService,
        typeorm_2.DataSource])
], ApuestasService);
//# sourceMappingURL=apuestas.service.js.map