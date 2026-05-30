export class RouteSegment {
  id!: string;
  route_id!: string;
  from_city_id!: string;
  to_city_id!: string;
  distance!: number | null;
  created_at!: Date;
  updated_at!: Date;
}
