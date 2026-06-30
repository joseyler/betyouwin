import { Body, Controller, Get, Post } from '@nestjs/common';
import { CurrentUser, Public } from '../auth';
import type { AuthenticatedUser } from '../auth';
import { TransaccionesService } from '../transacciones/transacciones.service';
import { LoginUsuarioDto } from './dto/login-usuario.dto';
import { RegistroUsuarioDto } from './dto/registro-usuario.dto';
import { UsuariosService } from './usuarios.service';

@Controller('usuarios')
export class UsuariosController {
  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly transaccionesService: TransaccionesService,
  ) {}

  @Public()
  @Post('registro')
  registro(@Body() dto: RegistroUsuarioDto) {
    return this.usuariosService.registro(dto);
  }

  @Public()
  @Post('login')
  login(@Body() dto: LoginUsuarioDto) {
    return this.usuariosService.login(dto);
  }

  @Get('saldo')
  async saldo(@CurrentUser() user: AuthenticatedUser) {
    const saldoPesos = await this.transaccionesService.calcularSaldo(
      user.userId,
    );

    return { saldoPesos };
  }
}
