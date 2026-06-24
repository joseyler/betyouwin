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
exports.Equipo = void 0;
const typeorm_1 = require("typeorm");
const apuesta_entity_1 = require("./apuesta.entity");
const partido_entity_1 = require("./partido.entity");
let Equipo = class Equipo {
    id;
    nombre;
    codigoPais;
    grupo;
    fechaCreacion;
    partidosComoLocal;
    partidosComoVisitante;
    apuestasElegidas;
};
exports.Equipo = Equipo;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ type: 'bigint', unsigned: true }),
    __metadata("design:type", String)
], Equipo.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100 }),
    __metadata("design:type", String)
], Equipo.prototype, "nombre", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'codigo_pais', type: 'char', length: 3 }),
    __metadata("design:type", String)
], Equipo.prototype, "codigoPais", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'char', length: 1 }),
    __metadata("design:type", String)
], Equipo.prototype, "grupo", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'fecha_creacion', type: 'datetime' }),
    __metadata("design:type", Date)
], Equipo.prototype, "fechaCreacion", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => partido_entity_1.Partido, (partido) => partido.equipoLocal),
    __metadata("design:type", Array)
], Equipo.prototype, "partidosComoLocal", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => partido_entity_1.Partido, (partido) => partido.equipoVisitante),
    __metadata("design:type", Array)
], Equipo.prototype, "partidosComoVisitante", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => apuesta_entity_1.Apuesta, (apuesta) => apuesta.equipoElegido),
    __metadata("design:type", Array)
], Equipo.prototype, "apuestasElegidas", void 0);
exports.Equipo = Equipo = __decorate([
    (0, typeorm_1.Entity)('equipos')
], Equipo);
//# sourceMappingURL=equipo.entity.js.map