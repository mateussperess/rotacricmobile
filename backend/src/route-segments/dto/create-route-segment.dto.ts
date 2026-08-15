import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateRouteSegmentDto {
  @IsUUID()
  @IsNotEmpty()
  route_id!: string;

  @IsUUID()
  @IsNotEmpty()
  from_city_id!: string;

  @IsUUID()
  @IsNotEmpty()
  to_city_id!: string;
}
