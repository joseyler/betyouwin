import { BadRequestException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EstadoPartido, FasePartido } from '../common/enums';
import { Apuesta } from '../entities/apuesta.entity';
import { Equipo } from '../entities/equipo.entity';
import { Partido } from '../entities/partido.entity';
import {
  PARTIDO_FINALIZADO_EVENT,
  PartidoFinalizadoEvent,
} from './events/partido-finalizado.event';
import { PartidosService } from './partidos.service';

describe('PartidosService', () => {
  let service: PartidosService;
  let eventEmitter: { emitAsync: jest.Mock };

  const partidoEliminatoria: Partido = {
    id: '73',
    numeroOficial: 73,
    equipoLocalId: null,
    equipoVisitanteId: null,
    descripcion: 'Segundo Grupo A v Segundo Grupo B',
    fechaHora: new Date('2026-06-28T15:00:00'),
    golesLocal: null,
    golesVisitante: null,
    fase: FasePartido.DIECISEISAVOS,
    grupo: null,
    estado: EstadoPartido.PROGRAMADO,
    fechaCreacion: new Date(),
    equipoLocal: null,
    equipoVisitante: null,
    apuestas: [],
  };

  const partidosRepository = {
    createQueryBuilder: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
  };

  const equiposRepository = {
    exist: jest.fn(),
  };

  const apuestasRepository = {
    exists: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    eventEmitter = { emitAsync: jest.fn() };
    apuestasRepository.exists.mockResolvedValue(false);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PartidosService,
        { provide: getRepositoryToken(Partido), useValue: partidosRepository },
        { provide: getRepositoryToken(Equipo), useValue: equiposRepository },
        { provide: getRepositoryToken(Apuesta), useValue: apuestasRepository },
        { provide: EventEmitter2, useValue: eventEmitter },
      ],
    }).compile();

    service = module.get<PartidosService>(PartidosService);
  });

  it('emite evento al finalizar partido', async () => {
    const partido = { ...partidoEliminatoria };
    const finalizado = {
      ...partido,
      golesLocal: 2,
      golesVisitante: 1,
      estado: EstadoPartido.FINALIZADO,
      equipoLocalId: '1',
      equipoVisitanteId: '2',
    };

    partidosRepository.findOne
      .mockResolvedValueOnce(partido)
      .mockResolvedValueOnce(finalizado);
    equiposRepository.exist.mockResolvedValue(true);
    partidosRepository.save.mockResolvedValue(finalizado);

    await service.actualizar('73', {
      golesLocal: 2,
      golesVisitante: 1,
      estado: EstadoPartido.FINALIZADO,
      equipoLocalId: '1',
      equipoVisitanteId: '2',
    });

    expect(eventEmitter.emitAsync).toHaveBeenCalledWith(
      PARTIDO_FINALIZADO_EVENT,
      new PartidoFinalizadoEvent('73'),
    );
  });

  it('rechaza asignar equipos en fase grupos', async () => {
    partidosRepository.findOne.mockResolvedValue({
      ...partidoEliminatoria,
      fase: FasePartido.GRUPOS,
      grupo: 'A',
    });

    await expect(
      service.actualizar('1', { equipoLocalId: '1' }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rechaza modificar partido con apuestas liquidadas', async () => {
    partidosRepository.findOne.mockResolvedValue({
      ...partidoEliminatoria,
      estado: EstadoPartido.FINALIZADO,
      golesLocal: 1,
      golesVisitante: 0,
    });
    apuestasRepository.exists.mockResolvedValue(true);

    await expect(
      service.actualizar('73', { golesLocal: 2 }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
