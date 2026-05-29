export class City {
  id: string;
  name: string;
  about?: string;
  lat: number;
  lng: number;
  zoom: number;
  created_at: Date;
  updated_at: Date;

  constructor(
    id: string,
    name: string,
    about: string | null,
    lat: number,
    lng: number,
    zoom: number,
    created_at: Date,
    updated_at: Date,
  ) {
    this.id = id;
    this.name = name;
    this.about = about || undefined;
    this.lat = lat;
    this.lng = lng;
    this.zoom = zoom;
    this.created_at = created_at;
    this.updated_at = updated_at;
  }
}
