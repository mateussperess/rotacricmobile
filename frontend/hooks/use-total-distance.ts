import api from "@/services/api";
import { RoutesOfflineRepository } from "@/services/database/offlineRepositories";
import { useEffect, useState } from "react";

export interface TotalDistanceData {
  totalKm: number;
  segmentCount: number;
}

export function useTotalDistance() {
  const [data, setData] = useState<TotalDistanceData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/route-segments/total-distance")
      .then((response) => {
        const json = response.data;
        if (json && typeof json.totalKm === "number") {
          setData({ totalKm: json.totalKm, segmentCount: json.segmentCount || 0 });
          setLoading(false);
          return;
        }
        throw new Error("Formato inválido");
      })
      .catch(async () => {
        try {
          const offlineRoutes = await RoutesOfflineRepository.getAll();
          const sumKm = offlineRoutes.reduce(
            (acc, r) => acc + Number(r.distance || 0),
            0
          );
          setData({
            totalKm: sumKm > 0 ? sumKm : 180, // 180 km extensão oficial da Rota CRIC
            segmentCount: offlineRoutes.length || 9,
          });
        } catch {
          setData({ totalKm: 180, segmentCount: 9 });
        } finally {
          setLoading(false);
        }
      });
  }, []);

  return { data, loading };
}
