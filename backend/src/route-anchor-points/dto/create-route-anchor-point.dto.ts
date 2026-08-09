import { IsBoolean, IsOptional, IsUUID } from 'class-validator';

export class CreateRouteAnchorPointDto {
  @IsUUID()
  route_id!: string;

  @IsUUID()
  anchor_point_id!: string;

  @IsBoolean()
  @IsOptional()
  on_route?: boolean;
}
