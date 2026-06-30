import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CurrentUser } from '../auth';
import type { AuthenticatedUser } from '../auth';
import { ApuestasService } from './apuestas.service';
import { ActualizarApuestaDto } from './dto/actualizar-apuesta.dto';
import { CrearApuestaDto } from './dto/crear-apuesta.dto';

@Controller('apuestas')
export class ApuestasController {
  constructor(private readonly apuestasService: ApuestasService) {}

  @Get()
  listar(@CurrentUser() user: AuthenticatedUser) {
    return this.apuestasService.listarPorUsuario(user.userId);
  }

  @Post()
  crear(@CurrentUser() user: AuthenticatedUser, @Body() dto: CrearApuestaDto) {
    return this.apuestasService.crear(user.userId, dto);
  }

  @Patch(':id')
  actualizar(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: ActualizarApuestaDto,
  ) {
    return this.apuestasService.actualizar(user.userId, id, dto);
  }

  @Delete(':id')
  eliminar(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.apuestasService.eliminar(user.userId, id);
  }
}
