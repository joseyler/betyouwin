import { Body, Controller, Post } from '@nestjs/common';
import { CurrentUser } from '../auth';
import type { AuthenticatedUser } from '../auth';
import { MontoTransaccionDto } from './dto/monto-transaccion.dto';
import { TransaccionesService } from './transacciones.service';

@Controller('transacciones')
export class TransaccionesController {
  constructor(private readonly transaccionesService: TransaccionesService) {}

  @Post('ingreso')
  ingreso(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: MontoTransaccionDto,
  ) {
    return this.transaccionesService.registrarIngreso(
      user.userId,
      dto.montoPesos,
      dto.descripcion,
    );
  }

  @Post('retiro')
  retiro(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: MontoTransaccionDto,
  ) {
    return this.transaccionesService.registrarRetiro(
      user.userId,
      dto.montoPesos,
      dto.descripcion,
    );
  }
}
