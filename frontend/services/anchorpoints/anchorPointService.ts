import api from "../api";
import { AnchorPointsOfflineRepository } from "../database/offlineRepositories";

export interface AnchorPoint {
  id: string;
  name: string;
  lat: number;
  lng: number;
  latitude?: number;
  longitude?: number;
  business_hours: string | null;
  phone: string | null;
  image: string | null;
  active: boolean;
  on_route: boolean;
  category_id: string | null;
  city_id?: string | null;
  category?: {
    id: string;
    name: string;
    icon_name: string;
    icon_image: string;
  } | null;
  created_at: string;
  updated_at: string;
}

export const AnchorPointsService = {
  findAll: async (): Promise<AnchorPoint[]> => {
    try {
      const { data } = await api.get("/anchor-points");
      if (data && Array.isArray(data)) {
        await AnchorPointsOfflineRepository.saveAll(data);
        return data;
      }
    } catch (e) {
      console.log("Offline mode: Carregando pontos de apoio da base SQLite local");
    }
    return AnchorPointsOfflineRepository.getAll();
  },

  findAllByCity: async (city_id: string): Promise<AnchorPoint[]> => {
    try {
      const { data } = await api.get(`/anchor-points/city/${city_id}`);
      if (data && Array.isArray(data)) {
        await AnchorPointsOfflineRepository.saveAll(data);
        return data;
      }
    } catch (e) {
      console.log("Offline mode: Carregando pontos de apoio da cidade do SQLite local");
    }
    return AnchorPointsOfflineRepository.getByCity(city_id);
  },

  create: async (payload: {
    name: string;
    city_id: string;
    category_id?: string;
    lat: number;
    lng: number;
    business_hours?: string;
    phone?: string;
  }): Promise<AnchorPoint> => {
    try {
      const { data } = await api.post("/anchor-points", payload);
      if (data) {
        await AnchorPointsOfflineRepository.saveAll([data]);
      }
      return data;
    } catch {
      const localId = `local-${Date.now()}`;
      const localPoint: AnchorPoint = {
        id: localId,
        name: payload.name,
        lat: payload.lat,
        lng: payload.lng,
        business_hours: payload.business_hours || null,
        phone: payload.phone || null,
        image: null,
        active: true,
        on_route: true,
        category_id: payload.category_id || null,
        city_id: payload.city_id || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      await AnchorPointsOfflineRepository.saveAll([localPoint]);
      return localPoint;
    }
  },

  findAllAdmin: async (): Promise<AnchorPoint[]> => {
    return AnchorPointsService.findAll();
  },

  toggleActive: async (id: string): Promise<AnchorPoint> => {
    const { data } = await api.patch(`/anchor-points/${id}/toggle-active`);
    return data;
  },

  deleteAnchorPoint: async (id: string): Promise<void> => {
    await api.delete(`/anchor-points/${id}`);
  },
};
