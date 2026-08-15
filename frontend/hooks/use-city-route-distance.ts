import api from "@/services/api";
import { useEffect, useState } from "react";

export interface RouteDistanceItem {
  routeId: string;
  routeName: string;
  distanceKm: number;
}

export interface CityRouteDistanceData {
  cityId: string;
  cityName: string;
  radiusKm: number;
  routes: RouteDistanceItem[];
  totalDistanceKm: number;
}

export function useCityRouteDistance(cityId: string, radiusKm: number = 8) {
  const [data, setData] = useState<CityRouteDistanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!cityId) return;

    setLoading(true);
    setError(null);

    api
      .get(`/cities/${cityId}/route-distance`, { params: { radius: radiusKm } })
      .then((response) => {
        setData(response.data);
        setLoading(false);
      })
      .catch(() => {
        setError("Não foi possível carregar os dados do trecho.");
        setLoading(false);
      });
  }, [cityId, radiusKm]);

  return { data, loading, error };
}
