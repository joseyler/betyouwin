import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, QueryFailedError, Repository } from 'typeorm';
import { EstadoApuesta, TipoApuesta, TipoTransaccion } from '../common/enums';
import { Apuesta } from '../entities/apuesta.entity';
import { Partido } from '../entities/partido.entity';
import { Transaccion } from '../entities/transaccion.entity';
import { TransaccionesService } from '../transacciones/transacciones.service';
import { ActualizarApuestaDto } from './dto/actualizar-apuesta.dto';
import { CrearApuestaDto } from './dto/crear-apuesta.dto';
import {
  eliminatoriaSinEquipos,
  partidoIniciado,
  validarCamposPorTipo,
} from './partido-apuesta.rules';

export interface ApuestaResponse {
  id: string;
  partidoId: string;
  tipo: TipoApuesta;
  equipoElegidoId: string | null;
  golesLocalApostados: number | null;
  golesVisitanteApostados: number | null;
  montoPesos: string;
  premioPesos: string | null;
  estado: EstadoApuesta;
  fechaCreacion: Date;
}

@Injectable()
export class ApuestasService {
  constructor(
    @InjectRepository(Apuesta)
    private readonly apuestasRepository: Repository<Apuesta>,
    @InjectRepository(Partido)
    private readonly partidosRepository: Repository<Partido>,
    private readonly transaccionesService: TransaccionesService,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async listarPorUsuario(usuarioId: string): Promise<ApuestaResponse[]> {
    const apuestas = await this.apuestasRepository.find({
      where: { usuarioId },
      order: { fechaCreacion: 'DESC' },
    });

    return apuestas.map((apuesta) => this.toResponse(apuesta));
  }

  async crear(
    usuarioId: string,
    dto: CrearApuestaDto,
  ): Promise<ApuestaResponse> {
    const partido = await this.obtenerPartido(dto.partidoId);
    this.validarPartidoParaApostar(partido);

    validarCamposPorTipo(partido, {
      tipo: dto.tipo,
      equipoElegidoId: dto.equipoElegidoId ?? null,
      golesLocalApostados: dto.golesLocalApostados ?? null,
      golesVisitanteApostados: dto.golesVisitanteApostados ?? null,
    });

    const saldo = await this.transaccionesService.calcularSaldo(usuarioId);

    if (dto.montoPesos > saldo) {
      throw new BadRequestException('monto supera saldo disponible');
    }

    try {
      const apuesta = await this.dataSource.transaction(async (manager) => {
        const nuevaApuesta = manager.create(Apuesta, {
          usuarioId,
          partidoId: dto.partidoId,
          tipo: dto.tipo,
          equipoElegidoId:
            dto.tipo === TipoApuesta.GANADOR
              ? (dto.equipoElegidoId ?? null)
              : null,
          golesLocalApostados:
            dto.tipo === TipoApuesta.RESULTADO_EXACTO
              ? (dto.golesLocalApostados ?? null)
              : null,
          golesVisitanteApostados:
            dto.tipo === TipoApuesta.RESULTADO_EXACTO
              ? (dto.golesVisitanteApostados ?? null)
              : null,
          montoPesos: dto.montoPesos.toFixed(2),
          estado: EstadoApuesta.PENDIENTE,
        });

        const guardada = await manager.save(nuevaApuesta);

        const transaccion = manager.create(Transaccion, {
          usuarioId,
          apuestaId: guardada.id,
          tipo: TipoTransaccion.APUESTA,
          montoPesos: dto.montoPesos.toFixed(2),
          descripcion: null,
        });

        await manager.save(transaccion);

        return guardada;
      });

      return this.toResponse(apuesta);
    } catch (error: unknown) {
      if (
        error instanceof QueryFailedError &&
        (error.driverError as { code?: string }).code === 'ER_DUP_ENTRY'
      ) {
        throw new ConflictException('ya existe apuesta para este partido');
      }
      throw error;
    }
  }

  async actualizar(
    usuarioId: string,
    apuestaId: string,
    dto: ActualizarApuestaDto,
  ): Promise<ApuestaResponse> {
    const apuesta = await this.obtenerApuestaDeUsuario(usuarioId, apuestaId);
    this.validarApuestaModificable(apuesta);

    const partido = await this.obtenerPartido(apuesta.partidoId);
    this.validarPartidoParaApostar(partido);

    const tipo = dto.tipo ?? apuesta.tipo;
    const equipoElegidoId =
      dto.equipoElegidoId !== undefined
        ? dto.equipoElegidoId
        : apuesta.equipoElegidoId;
    const golesLocalApostados =
      dto.golesLocalApostados !== undefined
        ? dto.golesLocalApostados
        : apuesta.golesLocalApostados;
    const golesVisitanteApostados =
      dto.golesVisitanteApostados !== undefined
        ? dto.golesVisitanteApostados
        : apuesta.golesVisitanteApostados;

    validarCamposPorTipo(partido, {
      tipo,
      equipoElegidoId,
      golesLocalApostados,
      golesVisitanteApostados,
    });

    const montoNuevo = dto.montoPesos ?? Number(apuesta.montoPesos);
    const montoAnterior = Number(apuesta.montoPesos);

    if (montoNuevo > montoAnterior) {
      const saldo = await this.transaccionesService.calcularSaldo(usuarioId);
      const saldoEfectivo = saldo + montoAnterior;

      if (montoNuevo > saldoEfectivo) {
        throw new BadRequestException('monto supera saldo disponible');
      }
    }

    apuesta.tipo = tipo;
    apuesta.equipoElegidoId =
      tipo === TipoApuesta.GANADOR ? equipoElegidoId : null;
    apuesta.golesLocalApostados =
      tipo === TipoApuesta.RESULTADO_EXACTO ? golesLocalApostados : null;
    apuesta.golesVisitanteApostados =
      tipo === TipoApuesta.RESULTADO_EXACTO ? golesVisitanteApostados : null;
    apuesta.montoPesos = montoNuevo.toFixed(2);

    const guardada = await this.apuestasRepository.save(apuesta);

    if (montoNuevo !== montoAnterior) {
      await this.transaccionesService.actualizarMontoApuesta(
        apuesta.id,
        montoNuevo,
      );
    }

    return this.toResponse(guardada);
  }

  async eliminar(usuarioId: string, apuestaId: string): Promise<void> {
    const apuesta = await this.obtenerApuestaDeUsuario(usuarioId, apuestaId);
    this.validarApuestaModificable(apuesta);

    const partido = await this.obtenerPartido(apuesta.partidoId);
    this.validarPartidoParaApostar(partido);

    await this.dataSource.transaction(async (manager) => {
      await manager.delete(Transaccion, {
        apuestaId: apuesta.id,
        tipo: TipoTransaccion.APUESTA,
      });
      await manager.delete(Apuesta, { id: apuesta.id });
    });
  }

  private validarPartidoParaApostar(partido: Partido): void {
    if (partidoIniciado(partido)) {
      throw new BadRequestException('el partido ya inicio');
    }

    if (eliminatoriaSinEquipos(partido)) {
      throw new BadRequestException(
        'eliminatoria sin equipos definidos no admite apuestas',
      );
    }
  }

  private validarApuestaModificable(apuesta: Apuesta): void {
    if (apuesta.estado !== EstadoApuesta.PENDIENTE) {
      throw new BadRequestException(
        'solo se pueden modificar apuestas pendientes',
      );
    }
  }

  private async obtenerPartido(partidoId: string): Promise<Partido> {
    const partido = await this.partidosRepository.findOne({
      where: { id: partidoId },
    });

    if (!partido) {
      throw new NotFoundException('partido no encontrado');
    }

    return partido;
  }

  private async obtenerApuestaDeUsuario(
    usuarioId: string,
    apuestaId: string,
  ): Promise<Apuesta> {
    const apuesta = await this.apuestasRepository.findOne({
      where: { id: apuestaId, usuarioId },
    });

    if (!apuesta) {
      throw new NotFoundException('apuesta no encontrada');
    }

    return apuesta;
  }

  private toResponse(apuesta: Apuesta): ApuestaResponse {
    return {
      id: apuesta.id,
      partidoId: apuesta.partidoId,
      tipo: apuesta.tipo,
      equipoElegidoId: apuesta.equipoElegidoId,
      golesLocalApostados: apuesta.golesLocalApostados,
      golesVisitanteApostados: apuesta.golesVisitanteApostados,
      montoPesos: apuesta.montoPesos,
      premioPesos: apuesta.premioPesos,
      estado: apuesta.estado,
      fechaCreacion: apuesta.fechaCreacion,
    };
  }
}
