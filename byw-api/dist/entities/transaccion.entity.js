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
exports.Transaccion = void 0;
const typeorm_1 = require("typeorm");
const enums_1 = require("../common/enums");
const apuesta_entity_1 = require("./apuesta.entity");
const usuario_entity_1 = require("./usuario.entity");
let Transaccion = class Transaccion {
    id;
    usuarioId;
    apuestaId;
    tipo;
    montoPesos;
    descripcion;
    fechaCreacion;
    usuario;
    apuesta;
};
exports.Transaccion = Transaccion;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ type: 'bigint', unsigned: true }),
    __metadata("design:type", String)
], Transaccion.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'usuario_id', type: 'bigint', unsigned: true }),
    __metadata("design:type", String)
], Transaccion.prototype, "usuarioId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'apuesta_id',
        type: 'bigint',
        unsigned: true,
        nullable: true,
    }),
    __metadata("design:type", Object)
], Transaccion.prototype, "apuestaId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: enums_1.TipoTransaccion }),
    __metadata("design:type", String)
], Transaccion.prototype, "tipo", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'monto_pesos', type: 'decimal', precision: 15, scale: 2 }),
    __metadata("design:type", String)
], Transaccion.prototype, "montoPesos", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 300, nullable: true }),
    __metadata("design:type", Object)
], Transaccion.prototype, "descripcion", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'fecha_creacion', type: 'datetime' }),
    __metadata("design:type", Date)
], Transaccion.prototype, "fechaCreacion", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => usuario_entity_1.Usuario, (usuario) => usuario.transacciones),
    (0, typeorm_1.JoinColumn)({ name: 'usuario_id' }),
    __metadata("design:type", usuario_entity_1.Usuario)
], Transaccion.prototype, "usuario", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => apuesta_entity_1.Apuesta, (apuesta) => apuesta.transacciones, {
        nullable: true,
    }),
    (0, typeorm_1.JoinColumn)({ name: 'apuesta_id' }),
    __metadata("design:type", Object)
], Transaccion.prototype, "apuesta", void 0);
exports.Transaccion = Transaccion = __decorate([
    (0, typeorm_1.Entity)('transacciones')
], Transaccion);
//# sourceMappingURL=transaccion.entity.js.map