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
exports.TransaccionesController = void 0;
const common_1 = require("@nestjs/common");
const auth_1 = require("../auth");
const monto_transaccion_dto_1 = require("./dto/monto-transaccion.dto");
const transacciones_service_1 = require("./transacciones.service");
let TransaccionesController = class TransaccionesController {
    transaccionesService;
    constructor(transaccionesService) {
        this.transaccionesService = transaccionesService;
    }
    ingreso(user, dto) {
        return this.transaccionesService.registrarIngreso(user.userId, dto.montoPesos, dto.descripcion);
    }
    retiro(user, dto) {
        return this.transaccionesService.registrarRetiro(user.userId, dto.montoPesos, dto.descripcion);
    }
};
exports.TransaccionesController = TransaccionesController;
__decorate([
    (0, common_1.Post)('ingreso'),
    __param(0, (0, auth_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, monto_transaccion_dto_1.MontoTransaccionDto]),
    __metadata("design:returntype", void 0)
], TransaccionesController.prototype, "ingreso", null);
__decorate([
    (0, common_1.Post)('retiro'),
    __param(0, (0, auth_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, monto_transaccion_dto_1.MontoTransaccionDto]),
    __metadata("design:returntype", void 0)
], TransaccionesController.prototype, "retiro", null);
exports.TransaccionesController = TransaccionesController = __decorate([
    (0, common_1.Controller)('transacciones'),
    __metadata("design:paramtypes", [transacciones_service_1.TransaccionesService])
], TransaccionesController);
//# sourceMappingURL=transacciones.controller.js.map