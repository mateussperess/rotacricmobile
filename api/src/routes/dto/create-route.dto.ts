import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateRouteDto {
  @IsString({ message: 'Nome deve ser uma string' })
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  @Transform(({ value }: { value: string }) => value.trim())
  name!: string;

  @IsString({ message: 'Polyline deve ser uma string' })
  @IsNotEmpty({ message: 'Polyline é obrigatória' })
  polyline!: string;

  @IsString()
  @IsOptional()
  strava_id?: string;

  @IsString()
  @IsOptional()
  color?: string;

  @IsNumber({}, { message: 'Distância deve ser um número' })
  distance!: number;

  @IsBoolean()
  @IsOptional()
  active?: boolean;
}
