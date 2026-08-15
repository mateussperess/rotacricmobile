import { RouteAnchorPoint as PrismaRouteAnchorPoint } from '@prisma/client';

export class RouteAnchorPointResponseDto {
  id: string;
  route_id: string;
  anchor_point_id: string;
  on_route: boolean;
  created_at: Date;
  updated_at: Date;

  constructor(routeAnchorPoint: PrismaRouteAnchorPoint) {
    this.id = routeAnchorPoint.id;
    this.route_id = routeAnchorPoint.route_id;
    this.anchor_point_id = routeAnchorPoint.anchor_point_id;
    this.on_route = routeAnchorPoint.on_route;
    this.created_at = routeAnchorPoint.created_at;
    this.updated_at = routeAnchorPoint.updated_at;
  }
}
