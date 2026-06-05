import { useEffect, useState } from "react";

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
  date: string; // "seg", "ter", ...
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
}

const CACHE_TTL = 30 * 60 * 1000; // 30 minutos
const cache: Record<string, WeatherData> = {};

const DAY_NAMES = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export function useWeather(lat: number, lng: number) {
  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const key = `${lat.toFixed(4)},${lng.toFixed(4)}`;
    const cached = cache[key];

    if (cached && Date.now() - cached.fetchedAt < CACHE_TTL) {
      setData(cached);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const url =
      `https://api.open-meteo.com/v1/forecast` +
      `?latitude=${lat}&longitude=${lng}` +
      `&current=temperature_2m,apparent_temperature,weathercode,windspeed_10m,precipitation` +
      `&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum` +
      `&timezone=America%2FSao_Paulo` +
      `&forecast_days=5`;

    fetch(url)
      .then((r) => r.json())
      .then((json) => {
        const c = json.current;
        const d = json.daily;

        const wmo = WMO_CODES[c.weathercode] ?? { label: "—", emoji: "🌡️" };

        const forecast: DayForecast[] = (d.time as string[]).map(
          (dateStr: string, i: number) => {
            const day = new Date(dateStr + "T12:00:00");
            const wmoDay = WMO_CODES[d.weathercode[i]] ?? {
              label: "—",
              emoji: "🌡️",
            };
            return {
              date: DAY_NAMES[day.getDay()],
              maxTemp: Math.round(d.temperature_2m_max[i]),
              minTemp: Math.round(d.temperature_2m_min[i]),
              weatherCode: d.weathercode[i],
              emoji: wmoDay.emoji,
              label: wmoDay.label,
              precipitation: d.precipitation_sum[i] ?? 0,
            };
          },
        );

        const result: WeatherData = {
          temperature: Math.round(c.temperature_2m),
          feelsLike: Math.round(c.apparent_temperature),
          windspeed: Math.round(c.windspeed_10m),
          precipitation: c.precipitation ?? 0,
          weatherCode: c.weathercode,
          emoji: wmo.emoji,
          label: wmo.label,
          forecast,
          fetchedAt: Date.now(),
        };

        cache[key] = result;
        setData(result);
        setLoading(false);
      })
      .catch(() => {
        setError("Não foi possível carregar o clima.");
        setLoading(false);
      });
  }, [lat, lng]);

  return { data, loading, error };
}
