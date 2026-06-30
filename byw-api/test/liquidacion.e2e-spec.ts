import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { FasePartido, TipoApuesta } from '../src/common/enums';
import { LiquidacionService } from '../src/liquidacion/liquidacion.service';

interface LoginResponse {
  accessToken: string;
}

interface SaldoResponse {
  saldoPesos: number;
}

interface EquipoResumen {
  id: string;
}

interface PartidoResponse {
  id: string;
  fechaHora: string;
  estado: string;
  equipoLocal: EquipoResumen | null;
  equipoVisitante: EquipoResumen | null;
}

interface ApuestaResponse {
  id: string;
  partidoId: string;
  tipo: TipoApuesta;
  montoPesos: string;
  premioPesos: string | null;
  estado: string;
}

describe('Liquidacion (e2e)', () => {
  let app: INestApplication<App>;
  let accessToken = '';
  let adminToken = '';
  let equipoLocalId = '';
  let equipoVisitanteId = '';
  let partidoGanadorId = '';
  let partidoEmpateId = '';
  let partidoExactoId = '';
  let partidoPerdedorId = '';
  let partidoCanceladoId = '';
  let liquidacionService: LiquidacionService;

  async function asignarEquipos(partidoId: string): Promise<void> {
    await request(app.getHttpServer())
      .patch(`/partidos/${partidoId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        equipoLocalId,
        equipoVisitanteId,
      })
      .expect(200);
  }

  async function obtenerSaldo(): Promise<number> {
    const response = await request(app.getHttpServer())
      .get('/usuarios/saldo')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    return (response.body as SaldoResponse).saldoPesos;
  }

  beforeAll(async () => {
    const suffix = Date.now().toString();
    const email = `liquidacion-${suffix}@test.com`;
    const adminEmail = `liquidacion-admin-${suffix}@test.com`;
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

    liquidacionService = app.get(LiquidacionService);

    await request(app.getHttpServer())
      .post('/usuarios/registro')
      .send({
        email: adminEmail,
        nombreCompleto: 'Admin Liquidacion',
        dni: `1${suffix}`.slice(0, 20),
        direccion: 'Admin',
        telefono: '100000020',
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
        nombreCompleto: 'Usuario Liquidacion',
        dni: `4${suffix}`.slice(0, 20),
        direccion: 'Calle Liquidacion',
        telefono: '100000021',
        password: 'password123',
      })
      .expect(201);

    const login = await request(app.getHttpServer())
      .post('/usuarios/login')
      .send({ email, password: 'password123' })
      .expect(201);

    accessToken = (login.body as LoginResponse).accessToken;

    const referencia = await request(app.getHttpServer())
      .get('/partidos')
      .query({ fase: FasePartido.GRUPOS, grupo: 'A' })
      .expect(200);

    const partidoReferencia = (referencia.body as PartidoResponse[])[0];
    equipoLocalId = partidoReferencia.equipoLocal?.id ?? '';
    equipoVisitanteId = partidoReferencia.equipoVisitante?.id ?? '';

    const eliminatorias = await request(app.getHttpServer())
      .get('/partidos')
      .query({ fase: FasePartido.DIECISEISAVOS })
      .expect(200);

    const futuras = (eliminatorias.body as PartidoResponse[]).filter(
      (partido) =>
        partido.estado === 'programado' &&
        new Date(partido.fechaHora).getTime() > Date.now(),
    );

    if (futuras.length < 5) {
      throw new Error('no hay suficientes eliminatorias futuras');
    }

    [
      partidoGanadorId,
      partidoEmpateId,
      partidoExactoId,
      partidoPerdedorId,
      partidoCanceladoId,
    ] = futuras.slice(0, 5).map((partido) => partido.id);

    for (const partidoId of [
      partidoGanadorId,
      partidoEmpateId,
      partidoExactoId,
      partidoPerdedorId,
      partidoCanceladoId,
    ]) {
      await asignarEquipos(partidoId);
    }

    await request(app.getHttpServer())
      .post('/transacciones/ingreso')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ montoPesos: 10000 })
      .expect(201);
  }, 90000);

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('liquida apuesta ganador con coeficiente 2x', async () => {
    const apuesta = await request(app.getHttpServer())
      .post('/apuestas')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        partidoId: partidoGanadorId,
        tipo: TipoApuesta.GANADOR,
        equipoElegidoId: equipoLocalId,
        montoPesos: 100,
      })
      .expect(201);

    const saldoAntes = await obtenerSaldo();
    expect(saldoAntes).toBe(9900);

    await request(app.getHttpServer())
      .patch(`/partidos/${partidoGanadorId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        golesLocal: 2,
        golesVisitante: 1,
        estado: 'finalizado',
      })
      .expect(200);

    const apuestaLiquidada = await request(app.getHttpServer())
      .get('/apuestas')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)
      .then((response) =>
        (response.body as ApuestaResponse[]).find(
          (item) => item.id === (apuesta.body as ApuestaResponse).id,
        ),
      );

    expect(apuestaLiquidada?.estado).toBe('ganada');
    expect(apuestaLiquidada?.premioPesos).toBe('200.00');

    const saldoDespues = await obtenerSaldo();
    expect(saldoDespues).toBe(10100);
  });

  it('liquida apuesta empate con coeficiente 3x', async () => {
    const apuesta = await request(app.getHttpServer())
      .post('/apuestas')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        partidoId: partidoEmpateId,
        tipo: TipoApuesta.EMPATE,
        montoPesos: 100,
      })
      .expect(201);

    await request(app.getHttpServer())
      .patch(`/partidos/${partidoEmpateId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        golesLocal: 1,
        golesVisitante: 1,
        estado: 'finalizado',
      })
      .expect(200);

    const apuestaLiquidada = await request(app.getHttpServer())
      .get('/apuestas')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)
      .then((response) =>
        (response.body as ApuestaResponse[]).find(
          (item) => item.id === (apuesta.body as ApuestaResponse).id,
        ),
      );

    expect(apuestaLiquidada?.estado).toBe('ganada');
    expect(apuestaLiquidada?.premioPesos).toBe('300.00');

    const saldo = await obtenerSaldo();
    expect(saldo).toBe(10300);
  });

  it('liquida resultado exacto con coeficiente 6x', async () => {
    const apuesta = await request(app.getHttpServer())
      .post('/apuestas')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        partidoId: partidoExactoId,
        tipo: TipoApuesta.RESULTADO_EXACTO,
        golesLocalApostados: 2,
        golesVisitanteApostados: 1,
        montoPesos: 50,
      })
      .expect(201);

    await request(app.getHttpServer())
      .patch(`/partidos/${partidoExactoId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        golesLocal: 2,
        golesVisitante: 1,
        estado: 'finalizado',
      })
      .expect(200);

    const apuestaLiquidada = await request(app.getHttpServer())
      .get('/apuestas')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)
      .then((response) =>
        (response.body as ApuestaResponse[]).find(
          (item) => item.id === (apuesta.body as ApuestaResponse).id,
        ),
      );

    expect(apuestaLiquidada?.estado).toBe('ganada');
    expect(apuestaLiquidada?.premioPesos).toBe('300.00');

    const saldo = await obtenerSaldo();
    expect(saldo).toBe(10550);
  });

  it('marca apuesta perdedora sin premio', async () => {
    const saldoAntes = await obtenerSaldo();

    const apuesta = await request(app.getHttpServer())
      .post('/apuestas')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        partidoId: partidoPerdedorId,
        tipo: TipoApuesta.GANADOR,
        equipoElegidoId: equipoVisitanteId,
        montoPesos: 100,
      })
      .expect(201);

    await request(app.getHttpServer())
      .patch(`/partidos/${partidoPerdedorId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        golesLocal: 3,
        golesVisitante: 0,
        estado: 'finalizado',
      })
      .expect(200);

    const apuestaLiquidada = await request(app.getHttpServer())
      .get('/apuestas')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)
      .then((response) =>
        (response.body as ApuestaResponse[]).find(
          (item) => item.id === (apuesta.body as ApuestaResponse).id,
        ),
      );

    expect(apuestaLiquidada?.estado).toBe('perdida');
    expect(apuestaLiquidada?.premioPesos).toBeNull();

    const saldoDespues = await obtenerSaldo();
    expect(saldoDespues).toBe(saldoAntes - 100);
  });

  it('reintento de liquidacion no duplica ganancias', async () => {
    const saldoAntes = await liquidacionService
      .liquidarPartidoFinalizado(partidoGanadorId)
      .then(() => obtenerSaldo());

    await liquidacionService.liquidarPartidoFinalizado(partidoGanadorId);

    const saldoDespues = await obtenerSaldo();
    expect(saldoDespues).toBe(saldoAntes);
  });

  it('cancelacion de partido cancela apuestas pendientes sin premio', async () => {
    const saldoAntes = await obtenerSaldo();

    const apuesta = await request(app.getHttpServer())
      .post('/apuestas')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        partidoId: partidoCanceladoId,
        tipo: TipoApuesta.EMPATE,
        montoPesos: 150,
      })
      .expect(201);

    await request(app.getHttpServer())
      .patch(`/partidos/${partidoCanceladoId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ estado: 'cancelado' })
      .expect(200);

    const apuestaCancelada = await request(app.getHttpServer())
      .get('/apuestas')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)
      .then((response) =>
        (response.body as ApuestaResponse[]).find(
          (item) => item.id === (apuesta.body as ApuestaResponse).id,
        ),
      );

    expect(apuestaCancelada?.estado).toBe('cancelada');
    expect(apuestaCancelada?.premioPesos).toBeNull();

    const saldoDespues = await obtenerSaldo();
    expect(saldoDespues).toBe(saldoAntes - 150);
  });
});
