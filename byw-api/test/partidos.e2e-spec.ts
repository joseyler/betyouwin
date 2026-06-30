import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { FasePartido } from '../src/common/enums';
import { AppModule } from '../src/app.module';

interface LoginResponse {
  accessToken: string;
}

interface EquipoResumen {
  id: string;
  nombre: string;
  codigoPais: string;
}

interface PartidoResponse {
  id: string;
  numeroOficial: number;
  fechaHora: string;
  fase: FasePartido;
  estado: string;
  equipoLocal: EquipoResumen | null;
  equipoVisitante: EquipoResumen | null;
  golesLocal: number | null;
  golesVisitante: number | null;
}

describe('Partidos (e2e)', () => {
  let app: INestApplication<App>;
  let adminToken = '';
  let userToken = '';
  let partidoEliminatoriaId = '';
  let equipoLocalId = '';
  let equipoVisitanteId = '';
  let adminEmail = '';

  beforeAll(async () => {
    const suffix = Date.now().toString();
    adminEmail = `admin-${suffix}@test.com`;
    process.env.ADMIN_EMAIL = adminEmail;

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

    await request(app.getHttpServer())
      .post('/usuarios/registro')
      .send({
        email: adminEmail,
        nombreCompleto: 'Admin Test',
        dni: `1${suffix}`.slice(0, 20),
        direccion: 'Admin 1',
        telefono: '100000001',
        password: 'password123',
      })
      .expect(201);

    const adminLogin = await request(app.getHttpServer())
      .post('/usuarios/login')
      .send({ email: adminEmail, password: 'password123' })
      .expect(201);

    adminToken = (adminLogin.body as LoginResponse).accessToken;
    expect(adminToken).toBeTruthy();

    const userEmail = `partidos-user-${suffix}@test.com`;
    await request(app.getHttpServer())
      .post('/usuarios/registro')
      .send({
        email: userEmail,
        nombreCompleto: 'User Test',
        dni: `2${suffix}`.slice(0, 20),
        direccion: 'User 1',
        telefono: '100000002',
        password: 'password123',
      })
      .expect(201);

    const userLogin = await request(app.getHttpServer())
      .post('/usuarios/login')
      .send({ email: userEmail, password: 'password123' })
      .expect(201);

    userToken = (userLogin.body as LoginResponse).accessToken;
    expect(userToken).toBeTruthy();

    const grupos = await request(app.getHttpServer())
      .get('/partidos')
      .query({ fase: FasePartido.GRUPOS, grupo: 'A' });

    const partidoGrupo = (grupos.body as PartidoResponse[])[0];
    equipoLocalId = partidoGrupo.equipoLocal?.id ?? '';
    equipoVisitanteId = partidoGrupo.equipoVisitante?.id ?? '';

    const eliminatorias = await request(app.getHttpServer())
      .get('/partidos')
      .query({ fase: FasePartido.DIECISEISAVOS });

    partidoEliminatoriaId = (eliminatorias.body as PartidoResponse[])[0].id;
  }, 60000);

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('GET /partidos es publico y ordena por fecha_hora ASC', async () => {
    const response = await request(app.getHttpServer())
      .get('/partidos')
      .expect(200);

    const partidos = response.body as PartidoResponse[];
    expect(partidos.length).toBeGreaterThan(0);

    for (let i = 1; i < partidos.length; i += 1) {
      const anterior = new Date(partidos[i - 1].fechaHora).getTime();
      const actual = new Date(partidos[i].fechaHora).getTime();
      expect(actual).toBeGreaterThanOrEqual(anterior);
    }
  });

  it('GET /partidos filtra por fase', async () => {
    const response = await request(app.getHttpServer())
      .get('/partidos')
      .query({ fase: FasePartido.FINAL })
      .expect(200);

    const partidos = response.body as PartidoResponse[];
    expect(partidos.every((p) => p.fase === FasePartido.FINAL)).toBe(true);
  });

  it('PATCH /partidos/:id rechaza usuario sin rol admin', () => {
    return request(app.getHttpServer())
      .patch(`/partidos/${partidoEliminatoriaId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ golesLocal: 1, golesVisitante: 0 })
      .expect(403);
  });

  it('admin asigna equipos en eliminatoria y finaliza partido', async () => {
    const asignacion = await request(app.getHttpServer())
      .patch(`/partidos/${partidoEliminatoriaId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        equipoLocalId,
        equipoVisitanteId,
      })
      .expect(200);

    const asignado = asignacion.body as PartidoResponse;
    expect(asignado.equipoLocal?.id).toBe(equipoLocalId);
    expect(asignado.equipoVisitante?.id).toBe(equipoVisitanteId);

    const finalizacion = await request(app.getHttpServer())
      .patch(`/partidos/${partidoEliminatoriaId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        golesLocal: 2,
        golesVisitante: 1,
        estado: 'finalizado',
      })
      .expect(200);

    const finalizado = finalizacion.body as PartidoResponse;
    expect(finalizado.estado).toBe('finalizado');
    expect(finalizado.golesLocal).toBe(2);
    expect(finalizado.golesVisitante).toBe(1);
  });
});
