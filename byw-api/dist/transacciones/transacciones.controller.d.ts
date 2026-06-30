import type { AuthenticatedUser } from '../auth';
import { MontoTransaccionDto } from './dto/monto-transaccion.dto';
import { TransaccionesService } from './transacciones.service';
export declare class TransaccionesController {
    private readonly transaccionesService;
    constructor(transaccionesService: TransaccionesService);
    ingreso(user: AuthenticatedUser, dto: MontoTransaccionDto): Promise<import("../entities").Transaccion>;
    retiro(user: AuthenticatedUser, dto: MontoTransaccionDto): Promise<import("../entities").Transaccion>;
}
