function formatImageUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const baseUrl = process.env.MEDIA_BASE_URL || 'https://rota-cric.charqueadas.ifsul.edu.br/media/';
  const cleanBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${cleanBase}${cleanPath}`;
}

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

  constructor(ap: any) {
    this.id = ap.id?.toString() ?? '';
    this.name = ap.name ?? '';
    this.lat = ap.latitude !== undefined ? Number(ap.latitude) : Number(ap.lat ?? 0);
    this.lng = ap.longitude !== undefined ? Number(ap.longitude) : Number(ap.lng ?? 0);
    this.business_hours = ap.business_hours ?? null;
    this.phone = ap.phone ?? null;
    this.image = formatImageUrl(ap.image);
    this.active = Boolean(ap.active);
    this.category_id = ap.anchorpoint_category_id?.toString() ?? ap.category_id?.toString() ?? null;
    this.created_at = ap.created_at ?? new Date();
    this.updated_at = ap.updated_at ?? new Date();
  }
}
