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
exports.Apuesta = void 0;
const typeorm_1 = require("typeorm");
const enums_1 = require("../common/enums");
const equipo_entity_1 = require("./equipo.entity");
const partido_entity_1 = require("./partido.entity");
const transaccion_entity_1 = require("./transaccion.entity");
const usuario_entity_1 = require("./usuario.entity");
let Apuesta = class Apuesta {
    id;
    usuarioId;
    partidoId;
    tipo;
    equipoElegidoId;
    golesLocalApostados;
    golesVisitanteApostados;
    montoPesos;
    premioPesos;
    estado;
    fechaCreacion;
    usuario;
    partido;
    equipoElegido;
    transacciones;
};
exports.Apuesta = Apuesta;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ type: 'bigint', unsigned: true }),
    __metadata("design:type", String)
], Apuesta.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'usuario_id', type: 'bigint', unsigned: true }),
    __metadata("design:type", String)
], Apuesta.prototype, "usuarioId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'partido_id', type: 'bigint', unsigned: true }),
    __metadata("design:type", String)
], Apuesta.prototype, "partidoId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: enums_1.TipoApuesta }),
    __metadata("design:type", String)
], Apuesta.prototype, "tipo", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'equipo_elegido_id',
        type: 'bigint',
        unsigned: true,
        nullable: true,
    }),
    __metadata("design:type", Object)
], Apuesta.prototype, "equipoElegidoId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'goles_local_apostados',
        type: 'tinyint',
        unsigned: true,
        nullable: true,
    }),
    __metadata("design:type", Object)
], Apuesta.prototype, "golesLocalApostados", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'goles_visitante_apostados',
        type: 'tinyint',
        unsigned: true,
        nullable: true,
    }),
    __metadata("design:type", Object)
], Apuesta.prototype, "golesVisitanteApostados", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'monto_pesos', type: 'decimal', precision: 15, scale: 2 }),
    __metadata("design:type", String)
], Apuesta.prototype, "montoPesos", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'premio_pesos',
        type: 'decimal',
        precision: 15,
        scale: 2,
        nullable: true,
    }),
    __metadata("design:type", Object)
], Apuesta.prototype, "premioPesos", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: enums_1.EstadoApuesta,
        default: enums_1.EstadoApuesta.PENDIENTE,
    }),
    __metadata("design:type", String)
], Apuesta.prototype, "estado", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'fecha_creacion', type: 'datetime' }),
    __metadata("design:type", Date)
], Apuesta.prototype, "fechaCreacion", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => usuario_entity_1.Usuario, (usuario) => usuario.apuestas),
    (0, typeorm_1.JoinColumn)({ name: 'usuario_id' }),
    __metadata("design:type", usuario_entity_1.Usuario)
], Apuesta.prototype, "usuario", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => partido_entity_1.Partido, (partido) => partido.apuestas),
    (0, typeorm_1.JoinColumn)({ name: 'partido_id' }),
    __metadata("design:type", partido_entity_1.Partido)
], Apuesta.prototype, "partido", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => equipo_entity_1.Equipo, (equipo) => equipo.apuestasElegidas, {
        nullable: true,
    }),
    (0, typeorm_1.JoinColumn)({ name: 'equipo_elegido_id' }),
    __metadata("design:type", Object)
], Apuesta.prototype, "equipoElegido", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => transaccion_entity_1.Transaccion, (transaccion) => transaccion.apuesta),
    __metadata("design:type", Array)
], Apuesta.prototype, "transacciones", void 0);
exports.Apuesta = Apuesta = __decorate([
    (0, typeorm_1.Entity)('apuestas'),
    (0, typeorm_1.Unique)('uk_apuestas_usuario_partido', ['usuarioId', 'partidoId'])
], Apuesta);
//# sourceMappingURL=apuesta.entity.js.map