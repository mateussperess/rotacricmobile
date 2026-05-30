import { City } from '../entities/city.entity';

export class CityResponseDto {
  id: string;
  name: string;
  about: string | null;
  lat: number;
  lng: number;
  zoom: number;
  banner_image: string | null;
  visible: boolean;
  active: boolean;
  created_at: Date;
  updated_at: Date;

  constructor(city: City) {
    this.id = city.id;
    this.name = city.name;
    this.about = city.about;
    this.lat = city.lat;
    this.lng = city.lng;
    this.zoom = city.zoom;
    this.banner_image = city.banner_image;
    this.visible = city.visible;
    this.active = city.active;
    this.created_at = city.created_at;
    this.updated_at = city.updated_at;
  }
}
