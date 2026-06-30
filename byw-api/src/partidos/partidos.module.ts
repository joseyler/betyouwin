import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Equipo } from '../entities/equipo.entity';
import { Partido } from '../entities/partido.entity';
import { LiquidacionModule } from '../liquidacion/liquidacion.module';
import { PartidoLiquidacionListener } from './partido-liquidacion.listener';
import { PartidosController } from './partidos.controller';
import { PartidosService } from './partidos.service';

@Module({
  imports: [TypeOrmModule.forFeature([Partido, Equipo]), LiquidacionModule],
  controllers: [PartidosController],
  providers: [PartidosService, PartidoLiquidacionListener],
  exports: [PartidosService],
})
export class PartidosModule {}
