import { EstadoPartido, FasePartido } from '../common/enums';
import { Apuesta } from './apuesta.entity';
import { Equipo } from './equipo.entity';
export declare class Partido {
    id: string;
    numeroOficial: number;
    equipoLocalId: string | null;
    equipoVisitanteId: string | null;
    descripcion: string | null;
    fechaHora: Date;
    golesLocal: number | null;
    golesVisitante: number | null;
    fase: FasePartido;
    grupo: string | null;
    estado: EstadoPartido;
    fechaCreacion: Date;
    equipoLocal: Equipo | null;
    equipoVisitante: Equipo | null;
    apuestas: Apuesta[];
}
