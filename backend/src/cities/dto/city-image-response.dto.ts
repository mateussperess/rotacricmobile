import { formatImageUrl } from '../../utils/image.utils';

export class CityImageResponseDto {
  id: string;
  city_id: string;
  url: string;
  caption: string | null;
  order: number;
  created_at: Date;

  constructor(image: any) {
    this.id = image.id?.toString() ?? '';
    this.city_id = image.city_id?.toString() ?? '';
    this.url = formatImageUrl(image.image_path ?? image.url) ?? '';
    this.caption = image.title ?? image.subtitle ?? image.caption ?? null;
    this.order = image.order ?? 0;
    this.created_at = image.created_at ?? new Date();
  }
}

