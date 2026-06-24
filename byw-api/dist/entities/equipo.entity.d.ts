import { Apuesta } from './apuesta.entity';
import { Partido } from './partido.entity';
export declare class Equipo {
    id: string;
    nombre: string;
    codigoPais: string;
    grupo: string;
    fechaCreacion: Date;
    partidosComoLocal: Partido[];
    partidosComoVisitante: Partido[];
    apuestasElegidas: Apuesta[];
}
