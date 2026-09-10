import api from "../api";

export interface AnchorPoint {
  id: string;
  name: string;
  lat: number;
  lng: number;
  business_hours: string | null;
  phone: string | null;
  image: string | null;
  active: boolean;
  on_route: boolean;
  category_id: string | null;
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
    const { data } = await api.get("/anchor-points");
    return data;
  },

  findAllByCity: async (city_id: string): Promise<AnchorPoint[]> => {
    const { data } = await api.get(`/anchor-points/city/${city_id}`);
    return data;
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
    const { data } = await api.post("/anchor-points", payload);
    return data;
  },

  findAllAdmin: async (): Promise<AnchorPoint[]> => {
    const { data } = await api.get("/anchor-points/admin/all");
    return data;
  },

  toggleActive: async (id: string): Promise<AnchorPoint> => {
    const { data } = await api.patch(`/anchor-points/${id}/toggle-active`);
    return data;
  },

  deleteAnchorPoint: async (id: string): Promise<void> => {
    await api.delete(`/anchor-points/${id}`);
  },
};
