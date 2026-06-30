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
exports.PartidosService = void 0;
const common_1 = require("@nestjs/common");
const event_emitter_1 = require("@nestjs/event-emitter");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const enums_1 = require("../common/enums");
const equipo_entity_1 = require("../entities/equipo.entity");
const partido_entity_1 = require("../entities/partido.entity");
const partido_finalizado_event_1 = require("./events/partido-finalizado.event");
const partido_cancelado_event_1 = require("./events/partido-cancelado.event");
let PartidosService = class PartidosService {
    partidosRepository;
    equiposRepository;
    eventEmitter;
    constructor(partidosRepository, equiposRepository, eventEmitter) {
        this.partidosRepository = partidosRepository;
        this.equiposRepository = equiposRepository;
        this.eventEmitter = eventEmitter;
    }
    async listar(filtros) {
        const query = this.partidosRepository
            .createQueryBuilder('partido')
            .leftJoinAndSelect('partido.equipoLocal', 'equipoLocal')
            .leftJoinAndSelect('partido.equipoVisitante', 'equipoVisitante')
            .orderBy('partido.fecha_hora', 'ASC');
        if (filtros.grupo) {
            query.andWhere('partido.grupo = :grupo', { grupo: filtros.grupo });
        }
        if (filtros.fase) {
            query.andWhere('partido.fase = :fase', { fase: filtros.fase });
        }
        if (filtros.fecha) {
            query.andWhere('DATE(partido.fecha_hora) = :fecha', {
                fecha: filtros.fecha,
            });
        }
        if (filtros.equipo) {
            query.andWhere('(partido.equipo_local_id = :equipoId OR partido.equipo_visitante_id = :equipoId)', { equipoId: filtros.equipo });
        }
        const partidos = await query.getMany();
        return partidos.map((partido) => this.toResponse(partido));
    }
    async actualizar(partidoId, dto) {
        const partido = await this.partidosRepository.findOne({
            where: { id: partidoId },
            relations: ['equipoLocal', 'equipoVisitante'],
        });
        if (!partido) {
            throw new common_1.NotFoundException('partido no encontrado');
        }
        const estadoAnterior = partido.estado;
        if (dto.equipoLocalId !== undefined ||
            dto.equipoVisitanteId !== undefined) {
            if (partido.fase === enums_1.FasePartido.GRUPOS) {
                throw new common_1.BadRequestException('no se pueden asignar equipos en fase de grupos');
            }
            if (dto.equipoLocalId !== undefined) {
                if (dto.equipoLocalId !== null) {
                    await this.validarEquipo(dto.equipoLocalId);
                }
                partido.equipoLocalId = dto.equipoLocalId;
            }
            if (dto.equipoVisitanteId !== undefined) {
                if (dto.equipoVisitanteId !== null) {
                    await this.validarEquipo(dto.equipoVisitanteId);
                }
                partido.equipoVisitanteId = dto.equipoVisitanteId;
            }
        }
        if (dto.golesLocal !== undefined) {
            partido.golesLocal = dto.golesLocal;
        }
        if (dto.golesVisitante !== undefined) {
            partido.golesVisitante = dto.golesVisitante;
        }
        if (dto.estado !== undefined) {
            partido.estado = dto.estado;
        }
        if (partido.equipoLocalId &&
            partido.equipoVisitanteId &&
            partido.equipoLocalId === partido.equipoVisitanteId) {
            throw new common_1.BadRequestException('equipo local y visitante deben ser distintos');
        }
        if (partido.estado === enums_1.EstadoPartido.FINALIZADO) {
            if (partido.golesLocal === null || partido.golesVisitante === null) {
                throw new common_1.BadRequestException('partido finalizado requiere goles_local y goles_visitante');
            }
        }
        const guardado = await this.partidosRepository.save(partido);
        const recargado = await this.partidosRepository.findOne({
            where: { id: guardado.id },
            relations: ['equipoLocal', 'equipoVisitante'],
        });
        if (estadoAnterior !== enums_1.EstadoPartido.FINALIZADO &&
            recargado?.estado === enums_1.EstadoPartido.FINALIZADO) {
            await this.eventEmitter.emitAsync(partido_finalizado_event_1.PARTIDO_FINALIZADO_EVENT, new partido_finalizado_event_1.PartidoFinalizadoEvent(recargado.id));
        }
        if (estadoAnterior !== enums_1.EstadoPartido.CANCELADO &&
            recargado?.estado === enums_1.EstadoPartido.CANCELADO) {
            await this.eventEmitter.emitAsync(partido_cancelado_event_1.PARTIDO_CANCELADO_EVENT, new partido_cancelado_event_1.PartidoCanceladoEvent(recargado.id));
        }
        return this.toResponse(recargado ?? guardado);
    }
    async validarEquipo(equipoId) {
        const existe = await this.equiposRepository.exist({
            where: { id: equipoId },
        });
        if (!existe) {
            throw new common_1.BadRequestException(`equipo ${equipoId} no existe`);
        }
    }
    toResponse(partido) {
        return {
            id: partido.id,
            numeroOficial: partido.numeroOficial,
            fechaHora: partido.fechaHora,
            fase: partido.fase,
            grupo: partido.grupo,
            estado: partido.estado,
            descripcion: partido.descripcion,
            golesLocal: partido.golesLocal,
            golesVisitante: partido.golesVisitante,
            equipoLocal: partido.equipoLocal
                ? {
                    id: partido.equipoLocal.id,
                    nombre: partido.equipoLocal.nombre,
                    codigoPais: partido.equipoLocal.codigoPais,
                }
                : null,
            equipoVisitante: partido.equipoVisitante
                ? {
                    id: partido.equipoVisitante.id,
                    nombre: partido.equipoVisitante.nombre,
                    codigoPais: partido.equipoVisitante.codigoPais,
                }
                : null,
        };
    }
};
exports.PartidosService = PartidosService;
exports.PartidosService = PartidosService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(partido_entity_1.Partido)),
    __param(1, (0, typeorm_1.InjectRepository)(equipo_entity_1.Equipo)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        event_emitter_1.EventEmitter2])
], PartidosService);
//# sourceMappingURL=partidos.service.js.map