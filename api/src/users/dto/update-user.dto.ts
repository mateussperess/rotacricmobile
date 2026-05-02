import { PartialType } from '@nestjs/mapped-types';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsOptional()
  @IsString({ message: 'Username deve ser uma string' })
  @Matches(/^[a-zA-Z0-9_-]+$/, {
    message: 'Username pode conter apenas letras, números, underscore e hífen',
  })
  @Transform(({ value }: { value: string }) => value?.trim())
  username?: string;

  @IsOptional()
  @IsString({ message: 'Nome deve ser uma string' })
  @Transform(({ value }: { value: string }) => value?.trim())
  first_name?: string;

  @IsOptional()
  @IsString({ message: 'Sobrenome deve ser uma string' })
  @Transform(({ value }: { value: string }) => value?.trim())
  last_name?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Email inválido' })
  @Transform(({ value }: { value: string }) => value?.toLowerCase().trim())
  email?: string;

  @IsOptional()
  @IsString({ message: 'Senha deve ser uma string' })
  @MinLength(8, {
    message: 'Senha deve ter no mínimo 8 caracteres',
  })
  pass?: string;
}
