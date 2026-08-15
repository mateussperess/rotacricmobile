import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class CreateAnchorPointCategoryDto {
  @IsString({ message: 'O nome da categoria deve ser uma string' })
  @IsNotEmpty({ message: 'O nome da categoria é obrigatório' })
  @Matches(/^[a-zA-Z0-9a-fA-FÀ-úçÇ\s,_,-]+$/, {
    message: 'O nome contém caracteres inválidos',
  })
  name!: string;

  @IsString({ message: 'O nome do ícone deve ser uma string' })
  @IsNotEmpty({ message: 'O nome do ícone é obrigatório' })
  @Matches(/^[a-zA-Z0-9_-]+$/, {
    message:
      'O nome do ícone deve conter apenas letras, números, underscore e hífen',
  })
  icon_name!: string;
}
