import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Apuesta } from '../entities/apuesta.entity';
import { Partido } from '../entities/partido.entity';
import { TransaccionesModule } from '../transacciones/transacciones.module';
import { ApuestasController } from './apuestas.controller';
import { ApuestasService } from './apuestas.service';

@Module({
  imports: [TypeOrmModule.forFeature([Apuesta, Partido]), TransaccionesModule],
  controllers: [ApuestasController],
  providers: [ApuestasService],
  exports: [ApuestasService],
})
export class ApuestasModule {}
