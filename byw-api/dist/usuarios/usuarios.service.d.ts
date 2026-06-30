import { Repository } from 'typeorm';
import { AuthService } from '../auth';
import { Usuario } from '../entities/usuario.entity';
import { LoginUsuarioDto } from './dto/login-usuario.dto';
import { RegistroUsuarioDto } from './dto/registro-usuario.dto';
export declare class UsuariosService {
    private readonly usuariosRepository;
    private readonly authService;
    private readonly saltRounds;
    constructor(usuariosRepository: Repository<Usuario>, authService: AuthService);
    registro(dto: RegistroUsuarioDto): Promise<{
        id: string;
        email: string;
        nombreCompleto: string;
    }>;
    login(dto: LoginUsuarioDto): Promise<{
        accessToken: string;
    }>;
    obtenerPorId(usuarioId: string): Promise<Usuario>;
}
