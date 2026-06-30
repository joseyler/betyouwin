import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegistroUsuarioDto {
  @IsEmail()
  @MaxLength(255)
  email: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  nombreCompleto: string;

  @IsString()
  @Matches(/^[0-9]+$/, { message: 'dni debe contener solo digitos' })
  @MaxLength(20)
  dni: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(300)
  direccion: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  telefono: string;

  @IsString()
  @MinLength(8)
  @MaxLength(100)
  password: string;
}
