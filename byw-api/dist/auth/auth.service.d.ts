import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from './constants';
import { JwtPayload } from './interfaces/jwt-payload.interface';
export declare class AuthService {
    private readonly jwtService;
    private readonly configService;
    constructor(jwtService: JwtService, configService: ConfigService);
    signToken(userId: string, email: string, role?: UserRole): string;
    verifyToken(token: string): JwtPayload;
    resolveRole(email: string): UserRole;
}
