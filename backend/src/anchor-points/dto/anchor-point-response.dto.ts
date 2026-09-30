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
  city_id: string | null;
  created_at: Date;
  updated_at: Date;

  constructor(ap: any) {
    const parseCoord = (v1: any, v2: any, defaultVal: number = 0) => {
      const getNum = (v: any): number => {
        if (v === undefined || v === null || v === '') return NaN;
        if (typeof v === 'number') return isNaN(v) ? NaN : v;
        if (typeof v === 'object' && v !== null) {
          if (typeof v.toNumber === 'function') {
            try {
              const res = v.toNumber();
              if (typeof res === 'number' && !isNaN(res)) return res;
            } catch {}
          }
          if ('d' in v && 's' in v && Array.isArray(v.d) && v.d.length > 0) {
            const sign = v.s < 0 ? -1 : 1;
            const mainPart = Number(v.d[0]);
            let fracPart = 0;
            if (v.d.length > 1 && v.d[1] !== undefined) {
              const fracStr = String(v.d[1]);
              fracPart = Number(v.d[1]) / Math.pow(10, fracStr.length);
            }
            return sign * (mainPart + fracPart);
          }
        }
        const n = Number(v);
        return isNaN(n) ? NaN : n;
      };

      const n1 = getNum(v1);
      if (!isNaN(n1) && n1 !== 0) return n1;
      const n2 = getNum(v2);
      if (!isNaN(n2) && n2 !== 0) return n2;
      return !isNaN(n1) ? n1 : !isNaN(n2) ? n2 : defaultVal;
    };

    this.id = ap.id?.toString() ?? '';
    this.name = ap.name ?? '';
    this.lat = parseCoord(ap.latitude, ap.lat, -29.9547);
    this.lng = parseCoord(ap.longitude, ap.lng, -51.6256);
    this.business_hours = ap.business_hours ?? null;
    this.phone = ap.phone ?? null;
    this.image = formatImageUrl(ap.image);
    this.active = Boolean(ap.active);
    this.category_id = ap.anchorpoint_category_id?.toString() ?? ap.category_id?.toString() ?? null;
    this.city_id = ap.city_id?.toString() ?? null;
    this.created_at = ap.created_at ?? new Date();
    this.updated_at = ap.updated_at ?? new Date();
  }
}
