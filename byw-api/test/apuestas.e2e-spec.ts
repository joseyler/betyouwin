import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { FasePartido, TipoApuesta } from '../src/common/enums';

interface LoginResponse {
  accessToken: string;
}

interface SaldoResponse {
  saldoPesos: number;
}

interface EquipoResumen {
  id: string;
  nombre: string;
  codigoPais: string;
}

interface PartidoResponse {
  id: string;
  fechaHora: string;
  fase: FasePartido;
  estado: string;
  equipoLocal: EquipoResumen | null;
  equipoVisitante: EquipoResumen | null;
}

interface ApuestaResponse {
  id: string;
  partidoId: string;
  tipo: TipoApuesta;
  equipoElegidoId: string | null;
  montoPesos: string;
  estado: string;
}

function partidoApostable(partido: PartidoResponse): boolean {
  return (
    partido.estado === 'programado' &&
    new Date(partido.fechaHora).getTime() > Date.now() &&
    Boolean(partido.equipoLocal) &&
    Boolean(partido.equipoVisitante)
  );
}

describe('Apuestas (e2e)', () => {
  let app: INestApplication<App>;
  let accessToken = '';
  let adminToken = '';
  let partidoApuestaId = '';
  let partidoSinEquiposId = '';
  let equipoLocalId = '';
  let partidoSaldoId = '';

  beforeAll(async () => {
    const suffix = Date.now().toString();
    const email = `apuestas-${suffix}@test.com`;
    const adminEmail = `apuestas-admin-${suffix}@test.com`;
    const dni = `3${suffix}`.slice(0, 20);
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
        nombreCompleto: 'Admin Apuestas',
        dni: `1${suffix}`.slice(0, 20),
        direccion: 'Admin',
        telefono: '100000010',
        password: 'password123',
      })
      .expect(201);

    const adminLogin = await request(app.getHttpServer())
      .post('/usuarios/login')
      .send({ email: adminEmail, password: 'password123' })
      .expect(201);

    adminToken = (adminLogin.body as LoginResponse).accessToken;

    await request(app.getHttpServer())
      .post('/usuarios/registro')
      .send({
        email,
        nombreCompleto: 'Apuestas Test',
        dni,
        direccion: 'Calle Apuestas',
        telefono: '100000003',
        password: 'password123',
      })
      .expect(201);

    const login = await request(app.getHttpServer())
      .post('/usuarios/login')
      .send({ email, password: 'password123' })
      .expect(201);

    accessToken = (login.body as LoginResponse).accessToken;

    const referenciaGrupo = await request(app.getHttpServer())
      .get('/partidos')
      .query({ fase: FasePartido.GRUPOS, grupo: 'A' })
      .expect(200);

    const partidoReferencia = (referenciaGrupo.body as PartidoResponse[])[0];
    equipoLocalId = partidoReferencia.equipoLocal?.id ?? '';
    const equipoVisitanteId = partidoReferencia.equipoVisitante?.id ?? '';

    if (!equipoLocalId || !equipoVisitanteId) {
      throw new Error('no hay equipos de referencia para asignar eliminatoria');
    }

    const eliminatorias = await request(app.getHttpServer())
      .get('/partidos')
      .query({ fase: FasePartido.DIECISEISAVOS })
      .expect(200);

    const futuras = (eliminatorias.body as PartidoResponse[]).filter(
      (partido) =>
        partido.estado === 'programado' &&
        new Date(partido.fechaHora).getTime() > Date.now(),
    );

    if (futuras.length < 2) {
      throw new Error('no hay suficientes eliminatorias futuras para pruebas');
    }

    partidoSinEquiposId = futuras[0].id;
    partidoApuestaId = futuras[1].id;
    partidoSaldoId = futuras[2]?.id ?? futuras[1].id;

    await request(app.getHttpServer())
      .patch(`/partidos/${partidoApuestaId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        equipoLocalId,
        equipoVisitanteId,
      })
      .expect(200);

    if (partidoSaldoId !== partidoApuestaId) {
      await request(app.getHttpServer())
        .patch(`/partidos/${partidoSaldoId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          equipoLocalId,
          equipoVisitanteId,
        })
        .expect(200);
    }
  }, 60000);

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('rechaza apuestas sin token', () => {
    return request(app.getHttpServer()).get('/apuestas').expect(401);
  });

  it('rechaza apuesta en eliminatoria sin equipos', () => {
    return request(app.getHttpServer())
      .post('/apuestas')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        partidoId: partidoSinEquiposId,
        tipo: TipoApuesta.EMPATE,
        montoPesos: 100,
      })
      .expect(400);
  });

  it('flujo CRUD de apuesta y saldo', async () => {
    await request(app.getHttpServer())
      .post('/transacciones/ingreso')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ montoPesos: 1000 })
      .expect(201);

    const creacion = await request(app.getHttpServer())
      .post('/apuestas')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        partidoId: partidoApuestaId,
        tipo: TipoApuesta.GANADOR,
        equipoElegidoId: equipoLocalId,
        montoPesos: 200,
      })
      .expect(201);

    const apuesta = creacion.body as ApuestaResponse;
    expect(apuesta.tipo).toBe(TipoApuesta.GANADOR);
    expect(apuesta.montoPesos).toBe('200.00');
    expect(apuesta.estado).toBe('pendiente');

    const saldoTrasApuesta = await request(app.getHttpServer())
      .get('/usuarios/saldo')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect((saldoTrasApuesta.body as SaldoResponse).saldoPesos).toBe(800);

    const listado = await request(app.getHttpServer())
      .get('/apuestas')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    const apuestas = listado.body as ApuestaResponse[];
    expect(apuestas.some((item) => item.id === apuesta.id)).toBe(true);

    await request(app.getHttpServer())
      .post('/apuestas')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        partidoId: partidoApuestaId,
        tipo: TipoApuesta.EMPATE,
        montoPesos: 50,
      })
      .expect(409);

    const actualizacion = await request(app.getHttpServer())
      .patch(`/apuestas/${apuesta.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ montoPesos: 300 })
      .expect(200);

    expect((actualizacion.body as ApuestaResponse).montoPesos).toBe('300.00');

    const saldoTrasActualizar = await request(app.getHttpServer())
      .get('/usuarios/saldo')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect((saldoTrasActualizar.body as SaldoResponse).saldoPesos).toBe(700);

    await request(app.getHttpServer())
      .delete(`/apuestas/${apuesta.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    const saldoFinal = await request(app.getHttpServer())
      .get('/usuarios/saldo')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect((saldoFinal.body as SaldoResponse).saldoPesos).toBe(1000);
  });

  it('rechaza apuesta si monto supera saldo', async () => {
    const partido = await request(app.getHttpServer())
      .get('/partidos')
      .query({ fase: FasePartido.DIECISEISAVOS })
      .expect(200)
      .then((response) =>
        (response.body as PartidoResponse[]).find(
          (item) => item.id === partidoSaldoId && partidoApostable(item),
        ),
      );

    if (!partido?.equipoLocal) {
      throw new Error('partido para prueba de saldo no disponible');
    }

    await request(app.getHttpServer())
      .post('/apuestas')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        partidoId: partido.id,
        tipo: TipoApuesta.GANADOR,
        equipoElegidoId: partido.equipoLocal.id,
        montoPesos: 5000,
      })
      .expect(400);
  });
});
