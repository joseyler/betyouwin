import { EstadoPartido } from '../../common/enums';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
  ValidateIf,
} from 'class-validator';

export class ActualizarPartidoDto {
  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsString()
  equipoLocalId?: string | null;

  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsString()
  equipoVisitanteId?: string | null;

  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsInt()
  @Min(0)
  golesLocal?: number | null;

  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsInt()
  @Min(0)
  golesVisitante?: number | null;

  @IsOptional()
  @IsEnum(EstadoPartido)
  estado?: EstadoPartido;
}
