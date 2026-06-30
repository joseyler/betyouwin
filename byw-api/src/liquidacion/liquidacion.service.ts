import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { EstadoApuesta, EstadoPartido, TipoTransaccion } from '../common/enums';
import { Apuesta } from '../entities/apuesta.entity';
import { Partido } from '../entities/partido.entity';
import { Transaccion } from '../entities/transaccion.entity';
import { apuestaGanadora } from './apuesta-ganadora.evaluator';
import { COEFICIENTE_PREMIO } from './liquidacion.constants';

@Injectable()
export class LiquidacionService {
  constructor(
    @InjectRepository(Partido)
    private readonly partidosRepository: Repository<Partido>,
    @InjectRepository(Apuesta)
    private readonly apuestasRepository: Repository<Apuesta>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async liquidarPartidoFinalizado(partidoId: string): Promise<void> {
    const partido = await this.partidosRepository.findOne({
      where: { id: partidoId },
    });

    if (!partido || partido.estado !== EstadoPartido.FINALIZADO) {
      return;
    }

    if (partido.golesLocal === null || partido.golesVisitante === null) {
      return;
    }

    const apuestasPendientes = await this.apuestasRepository.find({
      where: { partidoId, estado: EstadoApuesta.PENDIENTE },
    });

    for (const apuesta of apuestasPendientes) {
      await this.liquidarApuesta(apuesta.id, partido);
    }
  }

  async cancelarApuestasPartido(partidoId: string): Promise<void> {
    const partido = await this.partidosRepository.findOne({
      where: { id: partidoId },
    });

    if (!partido || partido.estado !== EstadoPartido.CANCELADO) {
      return;
    }

    await this.apuestasRepository.update(
      { partidoId, estado: EstadoApuesta.PENDIENTE },
      { estado: EstadoApuesta.CANCELADA },
    );
  }

  private async liquidarApuesta(
    apuestaId: string,
    partido: Partido,
  ): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const apuesta = await manager.findOne(Apuesta, {
        where: { id: apuestaId, estado: EstadoApuesta.PENDIENTE },
      });

      if (!apuesta) {
        return;
      }

      if (apuestaGanadora(apuesta, partido)) {
        const coeficiente = COEFICIENTE_PREMIO[apuesta.tipo];
        const premio = Number(apuesta.montoPesos) * coeficiente;

        apuesta.estado = EstadoApuesta.GANADA;
        apuesta.premioPesos = premio.toFixed(2);
        await manager.save(apuesta);

        await manager.save(
          manager.create(Transaccion, {
            usuarioId: apuesta.usuarioId,
            apuestaId: apuesta.id,
            tipo: TipoTransaccion.GANANCIA,
            montoPesos: premio.toFixed(2),
            descripcion: null,
          }),
        );
        return;
      }

      apuesta.estado = EstadoApuesta.PERDIDA;
      await manager.save(apuesta);
    });
  }
}
