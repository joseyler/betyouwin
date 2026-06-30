import { FasePartido } from '../../common/enums';
import { IsEnum, IsOptional, IsString, Length, Matches } from 'class-validator';

export class ListarPartidosQueryDto {
  @IsOptional()
  @IsString()
  @Length(1, 1)
  grupo?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'fecha debe tener formato YYYY-MM-DD',
  })
  fecha?: string;

  @IsOptional()
  @IsString()
  equipo?: string;

  @IsOptional()
  @IsEnum(FasePartido)
  fase?: FasePartido;
}
