export class RouteResponseDto {
  id: string;
  name: string;
  polyline: string;
  strava_id: string | null;
  color: string | null;
  distance: number;
  is_event_route: boolean;
  active: boolean;
  created_at: Date;
  updated_at: Date;

  constructor(route: any) {
    this.id = route.id?.toString() ?? '';
    this.name = route.name ?? '';
    this.polyline = route.polyline ?? '';
    this.strava_id = route.external_strava_id ?? route.strava_id ?? null;
    this.color = route.color ?? '#2563EB';
    this.distance = typeof route.distance === 'number' ? route.distance : parseFloat(route.distance || '0');
    this.is_event_route = Boolean(route.is_event_route);
    this.active = Boolean(route.active);
    this.created_at = route.created_at ?? new Date();
    this.updated_at = route.updated_at ?? new Date();
  }
}
