import { Transform } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateCityDto {
  @IsString({ message: 'Nome deve ser uma string' })
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  @Transform(({ value }: { value: string }) => value.trim())
  name!: string;

  @IsNumber()
  @IsNotEmpty({ message: 'Latitude é obrigatória' })
  lat!: number;

  @IsNumber()
  @IsNotEmpty({ message: 'Longitude é obrigatória' })
  lng!: number;

  @IsNotEmpty({ message: 'Zoom é obrigatório' })
  zoom!: number;

  @IsString({ message: 'About deve ser uma string' })
  about?: string;
}
