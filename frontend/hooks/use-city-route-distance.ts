import api from "@/services/api";
import {
  CitiesOfflineRepository,
  RoutesOfflineRepository,
} from "@/services/database/offlineRepositories";
import { useEffect, useState } from "react";

export interface RouteDistanceItem {
  routeId: string;
  routeName: string;
  distanceKm: number;
}

export interface CityConnection {
  cityId: string;
  cityName: string;
  distanceKm: number;
  routeName: string;
}

export interface CityRouteDistanceData {
  cityId: string;
  cityName: string;
  radiusKm: number;
  routes: RouteDistanceItem[];
  totalDistanceKm: number;
  connectedCities: CityConnection[];
}

function calculateHaversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
  const R = 6371; // Raio da Terra em KM
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export function useCityRouteDistance(cityId: string, radiusKm: number = 8) {
  const [data, setData] = useState<CityRouteDistanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!cityId) return;

    let isMounted = true;
    setLoading(true);
    setError(null);

    const loadData = async () => {
      try {
        const response = await api.get(`/cities/${cityId}/route-distance`, {
          params: { radius: radiusKm },
        });

        if (isMounted && response.data) {
          const resData = response.data;
          // Se o backend não retornar connectedCities, calculamos via fallback offline
          if (!resData.connectedCities || resData.connectedCities.length === 0) {
            const offlineConnections = await calculateOfflineConnections(cityId);
            resData.connectedCities = offlineConnections;
          }
          setData(resData);
          setLoading(false);
          return;
        }
      } catch {
        // Modo off-line / fallback quando endpoint falhar
      }

      if (!isMounted) return;

      try {
        const offlineData = await buildOfflineCityRouteData(cityId, radiusKm);
        if (isMounted) {
          setData(offlineData);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError("Não foi possível carregar os dados do trecho.");
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [cityId, radiusKm]);

  return { data, loading, error };
}

const DIRECT_ROTA_CRIC_MAP: Record<string, string[]> = {
  "1": ["3", "4"], // Charqueadas -> Arroio dos Ratos, São Jerônimo
  "2": ["3", "8"], // Butiá -> Arroio dos Ratos, Minas do Leão
  "3": ["1", "4", "2", "7"], // Arroio dos Ratos -> Charqueadas, São Jerônimo, Butiá, Barão do Triunfo
  "4": ["1", "3", "5", "6"], // São Jerônimo -> Charqueadas, Arroio dos Ratos, General Câmara, Triunfo
  "5": ["4", "9"], // General Câmara -> São Jerônimo, Vale Verde
  "6": ["4"], // Triunfo -> São Jerônimo
  "7": ["3"], // Barão do Triunfo -> Arroio dos Ratos
  "8": ["2", "9"], // Minas do Leão -> Butiá, Vale Verde
  "9": ["5", "8"], // Vale Verde -> General Câmara, Minas do Leão
  "charqueadas": ["arroio dos ratos", "são jerônimo", "sao jeronimo"],
  "butiá": ["arroio dos ratos", "minas do leão", "minas do leao"],
  "butia": ["arroio dos ratos", "minas do leão", "minas do leao"],
  "arroio dos ratos": ["charqueadas", "são jerônimo", "sao jeronimo", "butiá", "butia", "barão do triunfo", "barao do triunfo"],
  "são jerônimo": ["charqueadas", "arroio dos ratos", "general câmara", "general camara", "triunfo"],
  "sao jeronimo": ["charqueadas", "arroio dos ratos", "general câmara", "general camara", "triunfo"],
  "general câmara": ["são jerônimo", "sao jeronimo", "vale verde"],
  "general camara": ["são jerônimo", "sao jeronimo", "vale verde"],
  "triunfo": ["são jerônimo", "sao jeronimo"],
  "barão do triunfo": ["arroio dos ratos"],
  "barao do triunfo": ["arroio dos ratos"],
  "minas do leão": ["butiá", "butia", "vale verde"],
  "minas do leao": ["butiá", "butia", "vale verde"],
  "vale verde": ["general câmara", "general camara", "minas do leão", "minas do leao"],
};

async function calculateOfflineConnections(cityId: string): Promise<CityConnection[]> {
  try {
    const allCities = await CitiesOfflineRepository.getAll();
    if (!allCities || allCities.length === 0) return [];

    const targetCity = allCities.find(
      (c) => c.id.toString() === cityId.toString()
    );
    if (!targetCity) return [];

    const targetLat = targetCity.lat ?? targetCity.latitude ?? 0;
    const targetLng = targetCity.lng ?? targetCity.longitude ?? 0;

    const targetIdStr = targetCity.id.toString();
    const targetNameNorm = targetCity.name ? targetCity.name.toLowerCase().trim() : "";

    const allowedTargetKeys = DIRECT_ROTA_CRIC_MAP[targetIdStr] || DIRECT_ROTA_CRIC_MAP[targetNameNorm];

    const connections: CityConnection[] = [];

    for (const otherCity of allCities) {
      if (otherCity.id.toString() === cityId.toString()) continue;

      const otherIdStr = otherCity.id.toString();
      const otherNameNorm = otherCity.name ? otherCity.name.toLowerCase().trim() : "";

      // Se existir mapeamento de conexões diretas, verificar se a cidade parceira pertence à lista
      if (allowedTargetKeys) {
        const isAllowed = allowedTargetKeys.some(
          (key) => key === otherIdStr || key === otherNameNorm
        );
        if (!isAllowed) continue;
      }

      const otherLat = otherCity.lat ?? otherCity.latitude ?? 0;
      const otherLng = otherCity.lng ?? otherCity.longitude ?? 0;
      const dist =
        targetLat && targetLng && otherLat && otherLng
          ? calculateHaversineKm(targetLat, targetLng, otherLat, otherLng)
          : 0;

      connections.push({
        cityId: otherCity.id.toString(),
        cityName: otherCity.name,
        distanceKm: dist,
        routeName: `Trecho Rota CRIC • ${otherCity.name}`,
      });
    }

    connections.sort((a, b) => a.distanceKm - b.distanceKm);
    return connections;
  } catch {
    return [];
  }
}

async function buildOfflineCityRouteData(
  cityId: string,
  radiusKm: number
): Promise<CityRouteDistanceData> {
  const allCities = await CitiesOfflineRepository.getAll();
  const targetCity = allCities.find(
    (c) => c.id.toString() === cityId.toString()
  );
  const cityName = targetCity ? targetCity.name : "Cidade";

  const allRoutes = await RoutesOfflineRepository.getAll();
  const routesItems: RouteDistanceItem[] = (allRoutes || []).map((r) => ({
    routeId: r.id.toString(),
    routeName: r.name || "Trecho Rota CRIC",
    distanceKm: r.distance ? Math.round(r.distance * 10) / 10 : 0,
  }));

  const totalDistanceKm = routesItems.reduce((acc, r) => acc + r.distanceKm, 0);
  const connectedCities = await calculateOfflineConnections(cityId);

  return {
    cityId: cityId.toString(),
    cityName,
    radiusKm,
    routes: routesItems,
    totalDistanceKm: Math.round(totalDistanceKm * 10) / 10,
    connectedCities,
  };
}

