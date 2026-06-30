import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';

interface RegistroResponse {
  id: string;
  email: string;
}

interface LoginResponse {
  accessToken: string;
}

interface SaldoResponse {
  saldoPesos: number;
}

describe('Usuarios y transacciones (e2e)', () => {
  let app: INestApplication<App>;
  const suffix = Date.now().toString();
  const email = `user-${suffix}@test.com`;
  const dni = suffix.slice(-8).padStart(8, '0');
  let accessToken = '';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );
    await app.init();
  }, 30000);

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('rechaza saldo sin token', () => {
    return request(app.getHttpServer()).get('/usuarios/saldo').expect(401);
  });

  it('registra usuario con password_hash', async () => {
    const response = await request(app.getHttpServer())
      .post('/usuarios/registro')
      .send({
        email,
        nombreCompleto: 'Usuario Test',
        dni,
        direccion: 'Calle 123',
        telefono: '111222333',
        password: 'password123',
      })
      .expect(201);

    const body = response.body as RegistroResponse;
    expect(body.email).toBe(email);
    expect(body.id).toBeDefined();
  });

  it('login devuelve JWT valido', async () => {
    const response = await request(app.getHttpServer())
      .post('/usuarios/login')
      .send({
        email,
        password: 'password123',
      })
      .expect(201);

    const body = response.body as LoginResponse;
    expect(body.accessToken).toBeDefined();
    accessToken = body.accessToken;
  });

  it('saldo inicial es 0', async () => {
    const response = await request(app.getHttpServer())
      .get('/usuarios/saldo')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    const body = response.body as SaldoResponse;
    expect(body.saldoPesos).toBe(0);
  });

  it('registra ingreso y actualiza saldo', async () => {
    await request(app.getHttpServer())
      .post('/transacciones/ingreso')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ montoPesos: 1000 })
      .expect(201);

    const response = await request(app.getHttpServer())
      .get('/usuarios/saldo')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    const body = response.body as SaldoResponse;
    expect(body.saldoPesos).toBe(1000);
  });

  it('registra retiro valido', async () => {
    await request(app.getHttpServer())
      .post('/transacciones/retiro')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ montoPesos: 300 })
      .expect(201);

    const response = await request(app.getHttpServer())
      .get('/usuarios/saldo')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    const body = response.body as SaldoResponse;
    expect(body.saldoPesos).toBe(700);
  });

  it('rechaza retiro si supera saldo', () => {
    return request(app.getHttpServer())
      .post('/transacciones/retiro')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ montoPesos: 1000 })
      .expect(400);
  });
});
