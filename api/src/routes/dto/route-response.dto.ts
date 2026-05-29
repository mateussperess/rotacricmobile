import { Route } from '@prisma/client';

export class RouteResponseDto {
  id: string;
  name: string;
  polyline: string;
  strava_id: string | null;
  color: string | null;
  distance: number;
  active: boolean;
  created_at: Date;
  updated_at: Date;

  constructor(route: Route) {
    this.id = route.id;
    this.name = route.name;
    this.polyline = route.polyline;
    this.strava_id = route.strava_id;
    this.color = route.color;
    this.distance = route.distance;
    this.active = route.active;
    this.created_at = route.created_at;
    this.updated_at = route.updated_at;
  }
}
