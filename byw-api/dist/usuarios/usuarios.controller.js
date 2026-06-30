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
exports.UsuariosController = void 0;
const common_1 = require("@nestjs/common");
const auth_1 = require("../auth");
const transacciones_service_1 = require("../transacciones/transacciones.service");
const login_usuario_dto_1 = require("./dto/login-usuario.dto");
const registro_usuario_dto_1 = require("./dto/registro-usuario.dto");
const usuarios_service_1 = require("./usuarios.service");
let UsuariosController = class UsuariosController {
    usuariosService;
    transaccionesService;
    constructor(usuariosService, transaccionesService) {
        this.usuariosService = usuariosService;
        this.transaccionesService = transaccionesService;
    }
    registro(dto) {
        return this.usuariosService.registro(dto);
    }
    login(dto) {
        return this.usuariosService.login(dto);
    }
    async saldo(user) {
        const saldoPesos = await this.transaccionesService.calcularSaldo(user.userId);
        return { saldoPesos };
    }
};
exports.UsuariosController = UsuariosController;
__decorate([
    (0, auth_1.Public)(),
    (0, common_1.Post)('registro'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [registro_usuario_dto_1.RegistroUsuarioDto]),
    __metadata("design:returntype", void 0)
], UsuariosController.prototype, "registro", null);
__decorate([
    (0, auth_1.Public)(),
    (0, common_1.Post)('login'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [login_usuario_dto_1.LoginUsuarioDto]),
    __metadata("design:returntype", void 0)
], UsuariosController.prototype, "login", null);
__decorate([
    (0, common_1.Get)('saldo'),
    __param(0, (0, auth_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsuariosController.prototype, "saldo", null);
exports.UsuariosController = UsuariosController = __decorate([
    (0, common_1.Controller)('usuarios'),
    __metadata("design:paramtypes", [usuarios_service_1.UsuariosService,
        transacciones_service_1.TransaccionesService])
], UsuariosController);
//# sourceMappingURL=usuarios.controller.js.map