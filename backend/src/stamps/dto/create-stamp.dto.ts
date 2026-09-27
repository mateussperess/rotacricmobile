import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateStampDto {
  @IsNotEmpty()
  @IsNumber()
  anchor_point_id: number;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  badge_image?: string;

  @IsOptional()
  @IsString()
  qr_code_token?: string;
}
