import { CityImage } from '@prisma/client';

export class CityImageResponseDto {
  id: string;
  city_id: string;
  url: string;
  caption: string | null;
  order: number;
  created_at: Date;

  constructor(image: CityImage) {
    this.id = image.id;
    this.city_id = image.city_id;
    this.url = image.url;
    this.caption = image.caption;
    this.order = image.order;
    this.created_at = image.created_at;
  }
}
