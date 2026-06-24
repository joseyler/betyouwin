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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Partido = void 0;
const typeorm_1 = require("typeorm");
const enums_1 = require("../common/enums");
const apuesta_entity_1 = require("./apuesta.entity");
const equipo_entity_1 = require("./equipo.entity");
let Partido = class Partido {
    id;
    numeroOficial;
    equipoLocalId;
    equipoVisitanteId;
    descripcion;
    fechaHora;
    golesLocal;
    golesVisitante;
    fase;
    grupo;
    estado;
    fechaCreacion;
    equipoLocal;
    equipoVisitante;
    apuestas;
};
exports.Partido = Partido;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ type: 'bigint', unsigned: true }),
    __metadata("design:type", String)
], Partido.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'numero_oficial', type: 'int', unsigned: true, unique: true }),
    __metadata("design:type", Number)
], Partido.prototype, "numeroOficial", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'equipo_local_id',
        type: 'bigint',
        unsigned: true,
        nullable: true,
    }),
    __metadata("design:type", Object)
], Partido.prototype, "equipoLocalId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'equipo_visitante_id',
        type: 'bigint',
        unsigned: true,
        nullable: true,
    }),
    __metadata("design:type", Object)
], Partido.prototype, "equipoVisitanteId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 200, nullable: true }),
    __metadata("design:type", Object)
], Partido.prototype, "descripcion", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'fecha_hora', type: 'datetime' }),
    __metadata("design:type", Date)
], Partido.prototype, "fechaHora", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'goles_local',
        type: 'tinyint',
        unsigned: true,
        nullable: true,
    }),
    __metadata("design:type", Object)
], Partido.prototype, "golesLocal", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'goles_visitante',
        type: 'tinyint',
        unsigned: true,
        nullable: true,
    }),
    __metadata("design:type", Object)
], Partido.prototype, "golesVisitante", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: enums_1.FasePartido }),
    __metadata("design:type", String)
], Partido.prototype, "fase", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'char', length: 1, nullable: true }),
    __metadata("design:type", Object)
], Partido.prototype, "grupo", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: enums_1.EstadoPartido,
        default: enums_1.EstadoPartido.PROGRAMADO,
    }),
    __metadata("design:type", String)
], Partido.prototype, "estado", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'fecha_creacion', type: 'datetime' }),
    __metadata("design:type", Date)
], Partido.prototype, "fechaCreacion", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => equipo_entity_1.Equipo, (equipo) => equipo.partidosComoLocal, {
        nullable: true,
    }),
    (0, typeorm_1.JoinColumn)({ name: 'equipo_local_id' }),
    __metadata("design:type", Object)
], Partido.prototype, "equipoLocal", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => equipo_entity_1.Equipo, (equipo) => equipo.partidosComoVisitante, {
        nullable: true,
    }),
    (0, typeorm_1.JoinColumn)({ name: 'equipo_visitante_id' }),
    __metadata("design:type", Object)
], Partido.prototype, "equipoVisitante", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => apuesta_entity_1.Apuesta, (apuesta) => apuesta.partido),
    __metadata("design:type", Array)
], Partido.prototype, "apuestas", void 0);
exports.Partido = Partido = __decorate([
    (0, typeorm_1.Entity)('partidos')
], Partido);
//# sourceMappingURL=partido.entity.js.map