import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AuthService } from './auth.service';
import { AuthModule } from './auth.module';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import authConfig from '../config/auth.config';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { UserRole } from './constants';

describe('AuthController', () => {
  let app: INestApplication<App>;
  let authService: AuthService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true, load: [authConfig] }),
        AuthModule,
      ],
      providers: [
        {
          provide: APP_GUARD,
          useClass: JwtAuthGuard,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    authService = moduleFixture.get<AuthService>(AuthService);
  });

  afterEach(async () => {
    await app.close();
  });

  it('rechaza /auth/me sin token', () => {
    return request(app.getHttpServer()).get('/auth/me').expect(401);
  });

  it('rechaza /auth/me con token invalido', () => {
    return request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', 'Bearer token-invalido')
      .expect(401);
  });

  it('permite /auth/me con token valido', () => {
    const token = authService.signToken('10', 'user@example.com');

    return request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect((res: { body: { userId: string; role: UserRole } }) => {
        expect(res.body.userId).toBe('10');
        expect(res.body.role).toBe(UserRole.USER);
      });
  });

  it('rechaza /auth/admin con role user', () => {
    const token = authService.signToken('11', 'user@example.com');

    return request(app.getHttpServer())
      .get('/auth/admin')
      .set('Authorization', `Bearer ${token}`)
      .expect(403);
  });

  it('permite /auth/admin con role admin', () => {
    const token = authService.signToken('12', 'admin@betyouwin.com');

    return request(app.getHttpServer())
      .get('/auth/admin')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect((res: { body: { ok: boolean } }) => {
        expect(res.body.ok).toBe(true);
      });
  });
});
