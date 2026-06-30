import type { AuthenticatedUser } from '../auth';
import { TransaccionesService } from '../transacciones/transacciones.service';
import { LoginUsuarioDto } from './dto/login-usuario.dto';
import { RegistroUsuarioDto } from './dto/registro-usuario.dto';
import { UsuariosService } from './usuarios.service';
export declare class UsuariosController {
    private readonly usuariosService;
    private readonly transaccionesService;
    constructor(usuariosService: UsuariosService, transaccionesService: TransaccionesService);
    registro(dto: RegistroUsuarioDto): Promise<{
        id: string;
        email: string;
        nombreCompleto: string;
    }>;
    login(dto: LoginUsuarioDto): Promise<{
        accessToken: string;
    }>;
    saldo(user: AuthenticatedUser): Promise<{
        saldoPesos: number;
    }>;
}
