"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("@nestjs/config");
exports.default = (0, config_1.registerAs)('auth', () => ({
    jwtSecret: process.env.JWT_SECRET ?? 'dev-secret-change-me',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '1d',
    adminEmail: process.env.ADMIN_EMAIL ?? 'admin@betyouwin.com',
}));
//# sourceMappingURL=auth.config.js.map