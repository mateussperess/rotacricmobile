import api from "../api";
import { RoutesOfflineRepository } from "../database/offlineRepositories";

export interface Route {
  id: string;
  name: string;
  polyline: string;
  strava_id: string | null;
  color: string | null;
  distance: number;
  is_event_route?: boolean;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export const RoutesService = {
  findAll: async (): Promise<Route[]> => {
    try {
      const { data } = await api.get("/routes");
      if (data && Array.isArray(data)) {
        await RoutesOfflineRepository.saveAll(data);
        return data;
      }
    } catch (e) {
      console.log("Offline mode: Carregando rotas da base SQLite local");
    }
    return RoutesOfflineRepository.getAll();
  },

  findOne: async (id: string): Promise<Route> => {
    try {
      const { data } = await api.get(`/routes/${id}`);
      return data;
    } catch (e) {
      const all = await RoutesOfflineRepository.getAll();
      const found = all.find((r) => r.id === id);
      if (found) return found;
      throw new Error("Rota não encontrada offline");
    }
  },
};
