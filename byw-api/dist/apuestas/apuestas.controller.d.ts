import type { AuthenticatedUser } from '../auth';
import { ApuestasService } from './apuestas.service';
import { ActualizarApuestaDto } from './dto/actualizar-apuesta.dto';
import { CrearApuestaDto } from './dto/crear-apuesta.dto';
export declare class ApuestasController {
    private readonly apuestasService;
    constructor(apuestasService: ApuestasService);
    listar(user: AuthenticatedUser): Promise<import("./apuestas.service").ApuestaResponse[]>;
    crear(user: AuthenticatedUser, dto: CrearApuestaDto): Promise<import("./apuestas.service").ApuestaResponse>;
    actualizar(user: AuthenticatedUser, id: string, dto: ActualizarApuestaDto): Promise<import("./apuestas.service").ApuestaResponse>;
    eliminar(user: AuthenticatedUser, id: string): Promise<void>;
}
