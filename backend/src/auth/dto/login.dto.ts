import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDTO {
  @IsString({ message: 'E-mail ou usuário deve ser uma string' })
  @IsNotEmpty({ message: 'E-mail ou usuário é obrigatório' })
  @Transform(({ value }: { value: string }) => value.toLowerCase().trim())
  email!: string;

  @IsString()
  @IsNotEmpty({ message: 'Senha é obrigatória' })
  pass!: string;
}
