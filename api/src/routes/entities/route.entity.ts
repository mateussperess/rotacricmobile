export class Route {
  id!: string;
  name!: string;
  polyline!: string;
  strava_id!: string;
  color!: string;
  distance!: number;
  active!: boolean;
  created_at!: Date;
  updated_at!: Date;
  deleted_at!: Date | null;
}
