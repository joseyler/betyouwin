import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaccion } from '../entities/transaccion.entity';
import { TransaccionesController } from './transacciones.controller';
import { TransaccionesService } from './transacciones.service';

@Module({
  imports: [TypeOrmModule.forFeature([Transaccion])],
  controllers: [TransaccionesController],
  providers: [TransaccionesService],
  exports: [TransaccionesService],
})
export class TransaccionesModule {}
