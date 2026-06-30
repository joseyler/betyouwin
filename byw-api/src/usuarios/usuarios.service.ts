import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { QueryFailedError, Repository } from 'typeorm';
import { AuthService } from '../auth';
import { Usuario } from '../entities/usuario.entity';
import { LoginUsuarioDto } from './dto/login-usuario.dto';
import { RegistroUsuarioDto } from './dto/registro-usuario.dto';

@Injectable()
export class UsuariosService {
  private readonly saltRounds = 10;

  constructor(
    @InjectRepository(Usuario)
    private readonly usuariosRepository: Repository<Usuario>,
    private readonly authService: AuthService,
  ) {}

  async registro(dto: RegistroUsuarioDto) {
    const passwordHash = await bcrypt.hash(dto.password, this.saltRounds);

    const usuario = this.usuariosRepository.create({
      email: dto.email.toLowerCase(),
      nombreCompleto: dto.nombreCompleto,
      dni: dto.dni,
      direccion: dto.direccion,
      telefono: dto.telefono,
      passwordHash,
    });

    try {
      const guardado = await this.usuariosRepository.save(usuario);
      return {
        id: guardado.id,
        email: guardado.email,
        nombreCompleto: guardado.nombreCompleto,
      };
    } catch (error: unknown) {
      if (
        error instanceof QueryFailedError &&
        (error.driverError as { code?: string }).code === 'ER_DUP_ENTRY'
      ) {
        throw new ConflictException('email o dni ya registrado');
      }
      throw error;
    }
  }

  async login(dto: LoginUsuarioDto) {
    const usuario = await this.usuariosRepository.findOne({
      where: { email: dto.email.toLowerCase() },
    });

    if (!usuario) {
      throw new UnauthorizedException('credenciales invalidas');
    }

    const passwordValida = await bcrypt.compare(
      dto.password,
      usuario.passwordHash,
    );

    if (!passwordValida) {
      throw new UnauthorizedException('credenciales invalidas');
    }

    const accessToken = this.authService.signToken(usuario.id, usuario.email);

    return { accessToken };
  }

  async obtenerPorId(usuarioId: string): Promise<Usuario> {
    const usuario = await this.usuariosRepository.findOne({
      where: { id: usuarioId },
    });

    if (!usuario) {
      throw new BadRequestException('usuario no encontrado');
    }

    return usuario;
  }
}
