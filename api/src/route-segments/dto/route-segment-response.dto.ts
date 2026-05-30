import { RouteSegment } from '../entities/route-segment.entity';

export class RouteSegmentResponseDto {
  id: string;
  route_id: string;
  from_city_id: string;
  to_city_id: string;
  distance: number | null;
  created_at: Date;
  updated_at: Date;

  constructor(routeSegment: RouteSegment) {
    this.id = routeSegment.id;
    this.route_id = routeSegment.route_id;
    this.from_city_id = routeSegment.from_city_id;
    this.to_city_id = routeSegment.to_city_id;
    this.distance = routeSegment.distance;
    this.created_at = routeSegment.created_at;
    this.updated_at = routeSegment.updated_at;
  }
}
