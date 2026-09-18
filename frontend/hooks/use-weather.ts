import NetInfo from "@react-native-community/netinfo";
import { useEffect, useState, useCallback } from "react";
import { WeatherOfflineRepository } from "@/services/database/offlineRepositories";

const WMO_CODES: Record<number, { label: string; emoji: string }> = {
  0: { label: "Céu limpo", emoji: "☀️" },
  1: { label: "Quase limpo", emoji: "🌤️" },
  2: { label: "Parcialmente nublado", emoji: "⛅" },
  3: { label: "Nublado", emoji: "☁️" },
  45: { label: "Névoa", emoji: "🌫️" },
  48: { label: "Névoa com gelo", emoji: "🌫️" },
  51: { label: "Garoa leve", emoji: "🌦️" },
  53: { label: "Garoa moderada", emoji: "🌦️" },
  55: { label: "Garoa intensa", emoji: "🌧️" },
  61: { label: "Chuva leve", emoji: "🌧️" },
  63: { label: "Chuva moderada", emoji: "🌧️" },
  65: { label: "Chuva forte", emoji: "🌧️" },
  71: { label: "Neve leve", emoji: "🌨️" },
  73: { label: "Neve moderada", emoji: "🌨️" },
  75: { label: "Neve forte", emoji: "❄️" },
  80: { label: "Pancadas leves", emoji: "🌦️" },
  81: { label: "Pancadas moderadas", emoji: "🌧️" },
  82: { label: "Pancadas fortes", emoji: "⛈️" },
  95: { label: "Tempestade", emoji: "⛈️" },
  96: { label: "Tempestade c/ granizo", emoji: "⛈️" },
  99: { label: "Tempestade c/ granizo forte", emoji: "⛈️" },
};

export interface DayForecast {
  date: string;
  maxTemp: number;
  minTemp: number;
  weatherCode: number;
  emoji: string;
  label: string;
  precipitation: number;
}

export interface WeatherData {
  temperature: number;
  feelsLike: number;
  windspeed: number;
  precipitation: number;
  weatherCode: number;
  emoji: string;
  label: string;
  forecast: DayForecast[];
  fetchedAt: number;
  isCachedOffline?: boolean;
}

const CACHE_TTL = 30 * 60 * 1000; // 30 minutos
const memoryCache: Record<string, WeatherData> = {};
const inFlightRequests: Record<string, Promise<WeatherData | null>> = {};
const DAY_NAMES = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export function getWeatherKey(lat: number, lng: number): string {
  if (isNaN(lat) || isNaN(lng)) return "0.00,0.00";
  return `${Number(lat).toFixed(2)},${Number(lng).toFixed(2)}`;
}

export async function fetchAndSaveWeather(lat: number, lng: number): Promise<WeatherData | null> {
  if (isNaN(lat) || isNaN(lng) || (lat === 0 && lng === 0)) return null;
  const key = getWeatherKey(lat, lng);

  // Se já existir no cache de memória e estiver atualizado
  if (memoryCache[key] && Date.now() - memoryCache[key].fetchedAt < CACHE_TTL) {
    return memoryCache[key];
  }

  // Se já houver uma requisição idêntica em andamento, reutiliza a Promise (evita múltiplos fetches simultâneos)
  if (inFlightRequests[key]) {
    return inFlightRequests[key];
  }

  const promise = (async () => {
    const url =
      `https://api.open-meteo.com/v1/forecast` +
      `?latitude=${lat}&longitude=${lng}` +
      `&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m,precipitation` +
      `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum` +
      `&timezone=America%2FSao_Paulo` +
      `&forecast_days=5`;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos timeout

      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP Error ${response.status}`);
      }

      const json = await response.json();
      if (!json || !json.current) {
        throw new Error("Formato inválido de resposta do clima");
      }

      const c = json.current;
      const d = json.daily || {};

      const weatherCode = c.weather_code ?? c.weathercode ?? 0;
      const temp = c.temperature_2m ?? 0;
      const feelsLike = c.apparent_temperature ?? temp;
      const windspeed = c.wind_speed_10m ?? c.windspeed_10m ?? 0;

      const wmo = WMO_CODES[weatherCode] ?? { label: "Estável", emoji: "🌤️" };

      const forecast: DayForecast[] = Array.isArray(d.time)
        ? d.time.map((dateStr: string, i: number) => {
            const day = new Date(dateStr + "T12:00:00");
            const dayCode = (d.weather_code || d.weathercode || [])[i] ?? 0;
            const wmoDay = WMO_CODES[dayCode] ?? {
              label: "—",
              emoji: "🌡️",
            };
            return {
              date: DAY_NAMES[day.getDay()],
              maxTemp: Math.round((d.temperature_2m_max || [])[i] ?? temp),
              minTemp: Math.round((d.temperature_2m_min || [])[i] ?? temp),
              weatherCode: dayCode,
              emoji: wmoDay.emoji,
              label: wmoDay.label,
              precipitation: (d.precipitation_sum || [])[i] ?? 0,
            };
          })
        : [];

      const result: WeatherData = {
        temperature: Math.round(temp),
        feelsLike: Math.round(feelsLike),
        windspeed: Math.round(windspeed),
        precipitation: c.precipitation ?? 0,
        weatherCode,
        emoji: wmo.emoji,
        label: wmo.label,
        forecast,
        fetchedAt: Date.now(),
        isCachedOffline: false,
      };

      memoryCache[key] = result;
      await WeatherOfflineRepository.saveWeather(key, result);
      return result;
    } catch (err: any) {
      if (err?.name === "AbortError" || err?.message?.includes("aborted")) {
        console.warn(`[Clima] Requisição de clima para (${key}) foi interrompida (timeout/abort).`);
      } else {
        console.warn(`[Clima] Erro ao buscar API remota para (${key}):`, err?.message || err);
      }
      return null;
    } finally {
      delete inFlightRequests[key];
    }
  })();

  inFlightRequests[key] = promise;
  return promise;
}

export function useWeather(lat: number, lng: number) {
  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadWeather = useCallback(async (isMounted: () => boolean) => {
    if (isNaN(lat) || isNaN(lng) || (lat === 0 && lng === 0)) {
      if (isMounted()) setLoading(false);
      return;
    }

    const key = getWeatherKey(lat, lng);
    const cachedMem = memoryCache[key];

    if (cachedMem && Date.now() - cachedMem.fetchedAt < CACHE_TTL) {
      if (isMounted()) {
        setData(cachedMem);
        setLoading(false);
      }
      return;
    }

    if (isMounted()) {
      setLoading(true);
      setError(null);
    }

    // Tentar primeiro buscar online
    const remoteResult = await fetchAndSaveWeather(lat, lng);

    if (!isMounted()) return;

    if (remoteResult) {
      setData(remoteResult);
      setError(null);
      setLoading(false);
      return;
    }

    // Se a busca remota falhou (offline ou timeout), ler do SQLite local
    try {
      const offlineResult = await WeatherOfflineRepository.getWeather(key);
      if (!isMounted()) return;

      if (offlineResult) {
        setData({ ...offlineResult, isCachedOffline: true });
        setError(null);
      } else {
        setError("Modo off-line: sem previsão em cache.");
      }
    } catch {
      if (isMounted()) setError("Não foi possível carregar o clima.");
    } finally {
      if (isMounted()) setLoading(false);
    }
  }, [lat, lng]);

  useEffect(() => {
    let mounted = true;
    const isMounted = () => mounted;

    loadWeather(isMounted);

    return () => {
      mounted = false;
    };
  }, [loadWeather]);

  // Listener para recarregar o clima automaticamente quando o dispositivo reconecta com a internet
  useEffect(() => {
    let unsubscribe = () => {};
    let mounted = true;
    const isMounted = () => mounted;

    try {
      if (NetInfo && typeof NetInfo.addEventListener === "function") {
        unsubscribe = NetInfo.addEventListener((state) => {
          if (state.isConnected === true && state.isInternetReachable !== false) {
            loadWeather(isMounted);
          }
        });
      }
    } catch {
      // Ignorar ambiente onde NetInfo não esteja montado
    }
    return () => {
      mounted = false;
      try {
        unsubscribe();
      } catch {}
    };
  }, [loadWeather]);

  return { data, loading, error };
}
