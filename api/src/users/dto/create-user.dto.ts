import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsString({ message: 'Username deve ser uma string' })
  @IsNotEmpty({ message: 'Username é obrigatório' })
  @Matches(/^[a-zA-Z0-9_-]+$/, {
    message: 'Username pode conter apenas letras, números, underscore e hífen',
  })
  @Transform(({ value }: { value: string }) => value.trim())
  username!: string;

  @IsString({ message: 'Nome deve ser uma string' })
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  @Transform(({ value }: { value: string }) => value.trim())
  first_name!: string;

  @IsString({ message: 'Sobrenome deve ser uma string' })
  @IsNotEmpty({ message: 'Sobrenome é obrigatório' })
  @Transform(({ value }: { value: string }) => value.trim())
  last_name!: string;

  @IsEmail({}, { message: 'Email inválido' })
  @IsNotEmpty({ message: 'Email é obrigatório' })
  @Transform(({ value }: { value: string }) => value.toLowerCase().trim())
  email!: string;

  @IsString({ message: 'Senha deve ser uma string' })
  @IsNotEmpty({ message: 'Senha é obrigatória' })
  @MinLength(8, {
    message: 'Senha deve ter no mínimo 8 caracteres',
  })
  pass!: string;
}
