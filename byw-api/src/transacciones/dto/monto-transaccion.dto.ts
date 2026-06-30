import {
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';

export class MontoTransaccionDto {
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  montoPesos: number;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  descripcion?: string;
}
