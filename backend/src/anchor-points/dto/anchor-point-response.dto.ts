import { AnchorPoint } from '../entities/anchor-point.entity';

export class AnchorPointResponseDto {
  id: string;
  name: string;
  lat: number;
  lng: number;
  business_hours: string | null;
  phone: string | null;
  image: string | null;
  active: boolean;
  category_id: string | null;
  created_at: Date;
  updated_at: Date;

  constructor(anchorPoint: AnchorPoint) {
    this.id = anchorPoint.id;
    this.name = anchorPoint.name;
    this.lat = anchorPoint.lat;
    this.lng = anchorPoint.lng;
    this.business_hours = anchorPoint.business_hours;
    this.phone = anchorPoint.phone;
    this.image = anchorPoint.image;
    this.active = anchorPoint.active;
    this.category_id = anchorPoint.category_id;
    this.created_at = anchorPoint.created_at;
    this.updated_at = anchorPoint.updated_at;
  }
}
