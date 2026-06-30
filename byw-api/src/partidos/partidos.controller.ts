import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Public, Roles, RolesGuard, UserRole } from '../auth';
import { ActualizarPartidoDto } from './dto/actualizar-partido.dto';
import { ListarPartidosQueryDto } from './dto/listar-partidos-query.dto';
import { PartidosService } from './partidos.service';

@Controller('partidos')
export class PartidosController {
  constructor(private readonly partidosService: PartidosService) {}

  @Public()
  @Get()
  listar(@Query() query: ListarPartidosQueryDto) {
    return this.partidosService.listar(query);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  actualizar(@Param('id') id: string, @Body() dto: ActualizarPartidoDto) {
    return this.partidosService.actualizar(id, dto);
  }
}
