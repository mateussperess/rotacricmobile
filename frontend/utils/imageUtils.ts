import api from "@/services/api";

const CITY_FALLBACK_IMAGES: Record<string, string[]> = {
  Charqueadas: [
    "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=1000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1517649763962-0c623266010b?q=80&w=1000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1485965120184-e220f721d03e?q=80&w=1000&auto=format&fit=crop",
  ],
  Butiá: [
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1000&auto=format&fit=crop",
  ],
  "Arroio dos Ratos": [
    "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=1000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=1000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1000&auto=format&fit=crop",
  ],
  "São Jerônimo": [
    "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=1000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?q=80&w=1000&auto=format&fit=crop",
  ],
  "General Câmara": [
    "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?q=80&w=1000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1000&auto=format&fit=crop",
  ],
  Triunfo: [
    "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?q=80&w=1000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1000&auto=format&fit=crop",
  ],
  "Barão do Triunfo": [
    "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1000&auto=format&fit=crop",
  ],
  "Minas do Leão": [
    "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=1000&auto=format&fit=crop",
  ],
  "Vale Verde": [
    "https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1485965120184-e220f721d03e?q=80&w=1000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1000&auto=format&fit=crop",
  ],
};

export const DEFAULT_FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=1000&auto=format&fit=crop";

export function getCityFallbackImage(
  cityName?: string | null,
  index: number = 0
): string {
  if (cityName && CITY_FALLBACK_IMAGES[cityName]) {
    const list = CITY_FALLBACK_IMAGES[cityName];
    return list[Math.abs(index) % list.length];
  }
  return DEFAULT_FALLBACK_IMAGE;
}

export function getCityFallbackImages(cityName?: string | null): string[] {
  if (cityName && CITY_FALLBACK_IMAGES[cityName]) {
    return CITY_FALLBACK_IMAGES[cityName];
  }
  return [
    DEFAULT_FALLBACK_IMAGE,
    "https://images.unsplash.com/photo-1517649763962-0c623266010b?q=80&w=1000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1485965120184-e220f721d03e?q=80&w=1000&auto=format&fit=crop",
  ];
}

export function isUnreachableUrl(url: string): boolean {
  if (!url || typeof url !== "string") return true;
  const lower = url.trim().toLowerCase();
  if (!lower) return true;
  return false;
}

const DEFAULT_MEDIA_BASE_URL = "https://projetocric-django.onrender.com/media/";

export function resolveImageUrl(
  url: string | null | undefined,
  fallbackCityName?: string | null,
  fallbackIndex: number = 0
): string {
  if (!url || typeof url !== "string" || url.trim() === "") {
    return getCityFallbackImage(fallbackCityName, fallbackIndex);
  }

  const trimmed = url.trim();

  const mediaBaseUrl =
    process.env.EXPO_PUBLIC_MEDIA_URL || DEFAULT_MEDIA_BASE_URL;
  const cleanMediaBase = mediaBaseUrl.endsWith("/")
    ? mediaBaseUrl
    : `${mediaBaseUrl}/`;

  // Se a URL contiver o endereço antigo da universidade, reescreve para a nova base de mídia no Render
  if (trimmed.includes("rota-cric.charqueadas.ifsul.edu.br/media/")) {
    const relativePart = trimmed.split("rota-cric.charqueadas.ifsul.edu.br/media/")[1];
    const cleanRelative = relativePart.startsWith("/")
      ? relativePart.slice(1)
      : relativePart;
    return `${cleanMediaBase}${cleanRelative}`;
  }

  // URLs inacessíveis conhecidas
  if (isUnreachableUrl(trimmed)) {
    return getCityFallbackImage(fallbackCityName, fallbackIndex);
  }

  // Se for URL completa (http/https)
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    // Se for localhost/127.0.0.1 em dispositivo mobile ou emulador
    if (trimmed.includes("localhost") || trimmed.includes("127.0.0.1")) {
      const baseApiUrl = api.defaults.baseURL || "";
      const baseHost = baseApiUrl.replace(/\/api\/?$/, "");
      if (baseHost && !baseHost.includes("localhost")) {
        return trimmed.replace(/http:\/\/(localhost|127\.0\.0\.1):3000/, baseHost);
      }
      return getCityFallbackImage(fallbackCityName, fallbackIndex);
    }
    return trimmed;
  }

  // Se for caminho relativo (ex: cities/images/... ou /media/cities/...)
  let cleanPath = trimmed.startsWith("/") ? trimmed.slice(1) : trimmed;
  if (cleanPath.startsWith("media/")) {
    cleanPath = cleanPath.slice(6);
  }

  return `${cleanMediaBase}${cleanPath}`;
}

