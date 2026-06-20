/**
 * Decodifica um polyline encoded (Google format) em lista de coordenadas.
 * @see https://developers.google.com/maps/documentation/utilities/polylinealgorithm
 */

export function decodePolyline(encoded: string): [number, number][] {
  const coords: [number, number][] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    let shift = 0;
    let result = 0;
    let byte: number;

    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    const dLat = result & 1 ? ~(result >> 1) : result >> 1;
    lat += dLat;

    shift = 0;
    result = 0;

    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    const dLng = result & 1 ? ~(result >> 1) : result >> 1;
    lng += dLng;

    coords.push([lat / 1e5, lng / 1e5]);
  }

  return coords;
}

/**
 * Calcula a distância em KM entre dois pontos usando a fórmula de Haversine.
 */

export function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371; // raio da Terra em km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/**
 * Dado um polyline encoded e um ponto central + raio,
 * retorna a distância total (em KM) dos trechos do polyline
 * que passam dentro do raio da cidade.
 *
 * Estratégia:
 *   - Percorre os pontos do polyline em pares consecutivos
 *   - Se pelo menos um dos dois pontos do par estiver dentro do raio,
 *     soma a distância entre eles
 */

export function distanceInsideRadius(
  polyline: string,
  cityLat: number,
  cityLng: number,
  radiusKm: number,
): number {
  const coords = decodePolyline(polyline);
  let total = 0;

  for (let i = 0; i < coords.length - 1; i++) {
    const [lat1, lng1] = coords[i];
    const [lat2, lng2] = coords[i + 1];

    const p1Inside = haversineKm(lat1, lng1, cityLat, cityLng) <= radiusKm;
    const p2Inside = haversineKm(lat2, lng2, cityLat, cityLng) <= radiusKm;

    if (p1Inside || p2Inside) {
      total += haversineKm(lat1, lng1, lat2, lng2);
    }
  }

  return Math.round(total * 100) / 100; // arredonda para 2 casas
}
