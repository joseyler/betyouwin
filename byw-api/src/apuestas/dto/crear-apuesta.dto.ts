import { TipoApuesta } from '../../common/enums';
import {
  IsEnum,
  IsInt,
  IsNumber,
  IsPositive,
  IsString,
  Min,
  ValidateIf,
} from 'class-validator';

export class CrearApuestaDto {
  @IsString()
  partidoId: string;

  @IsEnum(TipoApuesta)
  tipo: TipoApuesta;

  @ValidateIf((dto: CrearApuestaDto) => dto.tipo === TipoApuesta.GANADOR)
  @IsString()
  equipoElegidoId?: string;

  @ValidateIf(
    (dto: CrearApuestaDto) => dto.tipo === TipoApuesta.RESULTADO_EXACTO,
  )
  @IsInt()
  @Min(0)
  golesLocalApostados?: number;

  @ValidateIf(
    (dto: CrearApuestaDto) => dto.tipo === TipoApuesta.RESULTADO_EXACTO,
  )
  @IsInt()
  @Min(0)
  golesVisitanteApostados?: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  montoPesos: number;
}
