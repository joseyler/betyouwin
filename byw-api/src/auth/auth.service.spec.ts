import { ConfigModule } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import authConfig from '../config/auth.config';
import { AuthService } from './auth.service';
import { UserRole } from './constants';

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          load: [authConfig],
        }),
      ],
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: new JwtService({
            secret: 'test-secret',
            signOptions: { expiresIn: '1h' },
          }),
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  it('genera y valida un JWT con role user', () => {
    const token = authService.signToken('1', 'user@example.com');
    const payload = authService.verifyToken(token);

    expect(payload.sub).toBe('1');
    expect(payload.email).toBe('user@example.com');
    expect(payload.role).toBe(UserRole.USER);
  });

  it('asigna role admin segun ADMIN_EMAIL', () => {
    const token = authService.signToken('2', 'admin@betyouwin.com');
    const payload = authService.verifyToken(token);

    expect(payload.role).toBe(UserRole.ADMIN);
  });

  it('permite forzar role al firmar token', () => {
    const token = authService.signToken(
      '3',
      'other@example.com',
      UserRole.ADMIN,
    );
    const payload = authService.verifyToken(token);

    expect(payload.role).toBe(UserRole.ADMIN);
  });
});
