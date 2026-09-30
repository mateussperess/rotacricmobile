import { Type } from 'class-transformer';
import { IsArray, IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';

export class ScannedStampItemDto {
  @IsNotEmpty()
  @IsString()
  client_uuid: string;

  @IsNotEmpty()
  @IsNumber()
  stamp_id: number;

  @IsNotEmpty()
  @IsNumber()
  anchor_point_id: number;

  @IsNotEmpty()
  @IsDateString()
  scanned_at: string;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;
}

export class SyncStampsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ScannedStampItemDto)
  stamps: ScannedStampItemDto[];
}
