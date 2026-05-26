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
  category_id: string | null;
  created_at: string;
  updated_at: string;
}

export const AnchorPointsService = {
  findAllByCity: async (city_id: string): Promise<AnchorPoint[]> => {
    const { data } = await api.get(`/anchor-points/city/${city_id}`);
    return data;
  },
};
