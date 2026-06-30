import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TipoTransaccion } from '../common/enums';
import { Transaccion } from '../entities/transaccion.entity';

@Injectable()
export class TransaccionesService {
  constructor(
    @InjectRepository(Transaccion)
    private readonly transaccionesRepository: Repository<Transaccion>,
  ) {}

  async calcularSaldo(usuarioId: string): Promise<number> {
    const resultado = await this.transaccionesRepository
      .createQueryBuilder('t')
      .select(
        `COALESCE(SUM(
          CASE t.tipo
            WHEN :ingreso THEN t.monto_pesos
            WHEN :ganancia THEN t.monto_pesos
            WHEN :retiro THEN -t.monto_pesos
            WHEN :apuesta THEN -t.monto_pesos
            ELSE 0
          END
        ), 0)`,
        'saldo',
      )
      .where('t.usuario_id = :usuarioId', { usuarioId })
      .setParameters({
        ingreso: TipoTransaccion.INGRESO,
        ganancia: TipoTransaccion.GANANCIA,
        retiro: TipoTransaccion.RETIRO,
        apuesta: TipoTransaccion.APUESTA,
      })
      .getRawOne<{ saldo: string }>();

    return Number(resultado?.saldo ?? 0);
  }

  async registrarIngreso(
    usuarioId: string,
    montoPesos: number,
    descripcion?: string,
  ): Promise<Transaccion> {
    const transaccion = this.transaccionesRepository.create({
      usuarioId,
      tipo: TipoTransaccion.INGRESO,
      montoPesos: montoPesos.toFixed(2),
      descripcion: descripcion ?? null,
      apuestaId: null,
    });

    return this.transaccionesRepository.save(transaccion);
  }

  async registrarRetiro(
    usuarioId: string,
    montoPesos: number,
    descripcion?: string,
  ): Promise<Transaccion> {
    const saldo = await this.calcularSaldo(usuarioId);

    if (montoPesos > saldo) {
      throw new BadRequestException('saldo insuficiente para retiro');
    }

    const transaccion = this.transaccionesRepository.create({
      usuarioId,
      tipo: TipoTransaccion.RETIRO,
      montoPesos: montoPesos.toFixed(2),
      descripcion: descripcion ?? null,
      apuestaId: null,
    });

    return this.transaccionesRepository.save(transaccion);
  }

  async registrarApuesta(
    usuarioId: string,
    apuestaId: string,
    montoPesos: number,
  ): Promise<Transaccion> {
    const transaccion = this.transaccionesRepository.create({
      usuarioId,
      apuestaId,
      tipo: TipoTransaccion.APUESTA,
      montoPesos: montoPesos.toFixed(2),
      descripcion: null,
    });

    return this.transaccionesRepository.save(transaccion);
  }

  async actualizarMontoApuesta(
    apuestaId: string,
    montoPesos: number,
  ): Promise<void> {
    const transaccion = await this.transaccionesRepository.findOne({
      where: { apuestaId, tipo: TipoTransaccion.APUESTA },
    });

    if (!transaccion) {
      throw new BadRequestException('transaccion de apuesta no encontrada');
    }

    transaccion.montoPesos = montoPesos.toFixed(2);
    await this.transaccionesRepository.save(transaccion);
  }

  async eliminarTransaccionesApuesta(apuestaId: string): Promise<void> {
    await this.transaccionesRepository.delete({
      apuestaId,
      tipo: TipoTransaccion.APUESTA,
    });
  }
}
