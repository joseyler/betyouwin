import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { EstadoPartido, FasePartido, EstadoApuesta } from '../common/enums';
import { Equipo } from '../entities/equipo.entity';
import { Apuesta } from '../entities/apuesta.entity';
import { Partido } from '../entities/partido.entity';
import { ActualizarPartidoDto } from './dto/actualizar-partido.dto';
import { ListarPartidosQueryDto } from './dto/listar-partidos-query.dto';
import {
  PARTIDO_FINALIZADO_EVENT,
  PartidoFinalizadoEvent,
} from './events/partido-finalizado.event';
import {
  PARTIDO_CANCELADO_EVENT,
  PartidoCanceladoEvent,
} from './events/partido-cancelado.event';

export interface EquipoResumen {
  id: string;
  nombre: string;
  codigoPais: string;
}

export interface PartidoResponse {
  id: string;
  numeroOficial: number;
  fechaHora: Date;
  fase: FasePartido;
  grupo: string | null;
  estado: EstadoPartido;
  descripcion: string | null;
  golesLocal: number | null;
  golesVisitante: number | null;
  equipoLocal: EquipoResumen | null;
  equipoVisitante: EquipoResumen | null;
}

@Injectable()
export class PartidosService {
  constructor(
    @InjectRepository(Partido)
    private readonly partidosRepository: Repository<Partido>,
    @InjectRepository(Equipo)
    private readonly equiposRepository: Repository<Equipo>,
    @InjectRepository(Apuesta)
    private readonly apuestasRepository: Repository<Apuesta>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async listar(filtros: ListarPartidosQueryDto): Promise<PartidoResponse[]> {
    const query = this.partidosRepository
      .createQueryBuilder('partido')
      .leftJoinAndSelect('partido.equipoLocal', 'equipoLocal')
      .leftJoinAndSelect('partido.equipoVisitante', 'equipoVisitante')
      .orderBy('partido.fecha_hora', 'ASC');

    if (filtros.grupo) {
      query.andWhere('partido.grupo = :grupo', { grupo: filtros.grupo });
    }

    if (filtros.fase) {
      query.andWhere('partido.fase = :fase', { fase: filtros.fase });
    }

    if (filtros.fecha) {
      query.andWhere('DATE(partido.fecha_hora) = :fecha', {
        fecha: filtros.fecha,
      });
    }

    if (filtros.equipo) {
      query.andWhere(
        '(partido.equipo_local_id = :equipoId OR partido.equipo_visitante_id = :equipoId)',
        { equipoId: filtros.equipo },
      );
    }

    const partidos = await query.getMany();

    return partidos.map((partido) => this.toResponse(partido));
  }

  async actualizar(
    partidoId: string,
    dto: ActualizarPartidoDto,
  ): Promise<PartidoResponse> {
    const partido = await this.partidosRepository.findOne({
      where: { id: partidoId },
      relations: ['equipoLocal', 'equipoVisitante'],
    });

    if (!partido) {
      throw new NotFoundException('partido no encontrado');
    }

    await this.validarModificacionConApuestasLiquidadas(partidoId, dto);

    const estadoAnterior = partido.estado;

    if (
      dto.equipoLocalId !== undefined ||
      dto.equipoVisitanteId !== undefined
    ) {
      if (partido.fase === FasePartido.GRUPOS) {
        throw new BadRequestException(
          'no se pueden asignar equipos en fase de grupos',
        );
      }

      if (dto.equipoLocalId !== undefined) {
        if (dto.equipoLocalId !== null) {
          await this.validarEquipo(dto.equipoLocalId);
        }
        partido.equipoLocalId = dto.equipoLocalId;
      }

      if (dto.equipoVisitanteId !== undefined) {
        if (dto.equipoVisitanteId !== null) {
          await this.validarEquipo(dto.equipoVisitanteId);
        }
        partido.equipoVisitanteId = dto.equipoVisitanteId;
      }
    }

    if (dto.golesLocal !== undefined) {
      partido.golesLocal = dto.golesLocal;
    }

    if (dto.golesVisitante !== undefined) {
      partido.golesVisitante = dto.golesVisitante;
    }

    if (dto.estado !== undefined) {
      partido.estado = dto.estado;
    }

    if (
      partido.equipoLocalId &&
      partido.equipoVisitanteId &&
      partido.equipoLocalId === partido.equipoVisitanteId
    ) {
      throw new BadRequestException(
        'equipo local y visitante deben ser distintos',
      );
    }

    if (partido.estado === EstadoPartido.FINALIZADO) {
      if (partido.golesLocal === null || partido.golesVisitante === null) {
        throw new BadRequestException(
          'partido finalizado requiere goles_local y goles_visitante',
        );
      }
    }

    const guardado = await this.partidosRepository.save(partido);

    const recargado = await this.partidosRepository.findOne({
      where: { id: guardado.id },
      relations: ['equipoLocal', 'equipoVisitante'],
    });

    if (
      estadoAnterior !== EstadoPartido.FINALIZADO &&
      recargado?.estado === EstadoPartido.FINALIZADO
    ) {
      await this.eventEmitter.emitAsync(
        PARTIDO_FINALIZADO_EVENT,
        new PartidoFinalizadoEvent(recargado.id),
      );
    }

    if (
      estadoAnterior !== EstadoPartido.CANCELADO &&
      recargado?.estado === EstadoPartido.CANCELADO
    ) {
      await this.eventEmitter.emitAsync(
        PARTIDO_CANCELADO_EVENT,
        new PartidoCanceladoEvent(recargado.id),
      );
    }

    return this.toResponse(recargado ?? guardado);
  }

  private async validarModificacionConApuestasLiquidadas(
    partidoId: string,
    dto: ActualizarPartidoDto,
  ): Promise<void> {
    const modificaPartido =
      dto.equipoLocalId !== undefined ||
      dto.equipoVisitanteId !== undefined ||
      dto.golesLocal !== undefined ||
      dto.golesVisitante !== undefined ||
      dto.estado !== undefined;

    if (!modificaPartido) {
      return;
    }

    const tieneApuestasLiquidadas = await this.apuestasRepository.exists({
      where: {
        partidoId,
        estado: Not(EstadoApuesta.PENDIENTE),
      },
    });

    if (tieneApuestasLiquidadas) {
      throw new BadRequestException(
        'partido con apuestas liquidadas no admite modificaciones',
      );
    }
  }

  private async validarEquipo(equipoId: string): Promise<void> {
    const existe = await this.equiposRepository.exist({
      where: { id: equipoId },
    });

    if (!existe) {
      throw new BadRequestException(`equipo ${equipoId} no existe`);
    }
  }

  private toResponse(partido: Partido): PartidoResponse {
    return {
      id: partido.id,
      numeroOficial: partido.numeroOficial,
      fechaHora: partido.fechaHora,
      fase: partido.fase,
      grupo: partido.grupo,
      estado: partido.estado,
      descripcion: partido.descripcion,
      golesLocal: partido.golesLocal,
      golesVisitante: partido.golesVisitante,
      equipoLocal: partido.equipoLocal
        ? {
            id: partido.equipoLocal.id,
            nombre: partido.equipoLocal.nombre,
            codigoPais: partido.equipoLocal.codigoPais,
          }
        : null,
      equipoVisitante: partido.equipoVisitante
        ? {
            id: partido.equipoVisitante.id,
            nombre: partido.equipoVisitante.nombre,
            codigoPais: partido.equipoVisitante.codigoPais,
          }
        : null,
    };
  }
}
