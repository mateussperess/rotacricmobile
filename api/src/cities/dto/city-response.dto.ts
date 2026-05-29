import { City } from '@prisma/client';

export class CityResponseDto {
  id: string;
  name: string;
  about?: string;
  lat: number;
  lng: number;
  zoom: number;
  created_at: Date;
  updated_at: Date;

  constructor(city: City) {
    this.id = city.id;
    this.name = city.name;
    this.about = city.about || undefined;
    this.lat = city.lat;
    this.lng = city.lng;
    this.zoom = city.zoom;
    this.created_at = city.created_at;
    this.updated_at = city.updated_at;
  }
}
