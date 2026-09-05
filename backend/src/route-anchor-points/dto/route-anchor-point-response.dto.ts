export class RouteAnchorPointResponseDto {
  id: string;
  route_id: string;
  anchor_point_id: string;
  on_route: boolean;
  created_at: Date;
  updated_at: Date;

  constructor(rap: any) {
    this.id = rap.id?.toString() ?? '';
    this.route_id = rap.route_id?.toString() ?? '';
    this.anchor_point_id = rap.anchor_point_id?.toString() ?? '';
    this.on_route = Boolean(rap.on_route);
    this.created_at = rap.created_at ?? new Date();
    this.updated_at = rap.updated_at ?? new Date();
  }
}
