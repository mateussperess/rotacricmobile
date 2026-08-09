import api from "@/services/api";
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
        setData({ totalKm: json.totalKm, segmentCount: json.segmentCount });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return { data, loading };
}
