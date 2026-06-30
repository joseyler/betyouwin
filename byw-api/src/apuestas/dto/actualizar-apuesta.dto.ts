import { TipoApuesta } from '../../common/enums';
import {
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
  ValidateIf,
} from 'class-validator';

export class ActualizarApuestaDto {
  @IsOptional()
  @IsEnum(TipoApuesta)
  tipo?: TipoApuesta;

  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsString()
  equipoElegidoId?: string | null;

  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsInt()
  @Min(0)
  golesLocalApostados?: number | null;

  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsInt()
  @Min(0)
  golesVisitanteApostados?: number | null;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  montoPesos?: number;
}
