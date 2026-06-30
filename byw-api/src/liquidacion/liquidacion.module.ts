import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Apuesta } from '../entities/apuesta.entity';
import { Partido } from '../entities/partido.entity';
import { LiquidacionService } from './liquidacion.service';

@Module({
  imports: [TypeOrmModule.forFeature([Partido, Apuesta])],
  providers: [LiquidacionService],
  exports: [LiquidacionService],
})
export class LiquidacionModule {}
