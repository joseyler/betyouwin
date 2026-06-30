import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from './constants';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  signToken(userId: string, email: string, role?: UserRole): string {
    const payload: JwtPayload = {
      sub: userId,
      email,
      role: role ?? this.resolveRole(email),
    };

    return this.jwtService.sign(payload);
  }

  verifyToken(token: string): JwtPayload {
    return this.jwtService.verify<JwtPayload>(token);
  }

  resolveRole(email: string): UserRole {
    const adminEmail = this.configService.get<string>('auth.adminEmail');

    if (adminEmail && email.toLowerCase() === adminEmail.toLowerCase()) {
      return UserRole.ADMIN;
    }

    return UserRole.USER;
  }
}
