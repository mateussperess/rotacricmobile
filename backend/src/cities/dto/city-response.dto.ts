function formatImageUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const baseUrl = process.env.MEDIA_BASE_URL || 'https://rota-cric.charqueadas.ifsul.edu.br/media/';
  const cleanBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${cleanBase}${cleanPath}`;
}

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

  constructor(city: any) {
    this.id = city.id?.toString() ?? '';
    this.name = city.name;
    this.about = city.about ?? null;
    this.lat = city.latitude !== undefined ? Number(city.latitude) : Number(city.lat ?? 0);
    this.lng = city.longitude !== undefined ? Number(city.longitude) : Number(city.lng ?? 0);
    this.zoom = city.zoom;
    this.banner_image = formatImageUrl(city.banner_image);
    this.visible = Boolean(city.visible);
    this.active = Boolean(city.active);
    this.created_at = city.created_at;
    this.updated_at = city.updated_at;
  }
}
