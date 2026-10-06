import { formatImageUrl } from '../../utils/image.utils';

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

    this.id = city.id?.toString() ?? '';
    this.name = city.name;
    this.about = city.about ?? null;
    this.lat = parseCoord(city.latitude, city.lat, -29.9547);
    this.lng = parseCoord(city.longitude, city.lng, -51.6256);
    this.zoom = city.zoom ?? 13;
    this.banner_image = formatImageUrl(city.banner_image);
    this.visible = Boolean(city.visible);
    this.active = Boolean(city.active);
    this.created_at = city.created_at;
    this.updated_at = city.updated_at;
  }
}
