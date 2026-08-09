import api from "../api";

export interface Route {
  id: string;
  name: string;
  polyline: string;
  strava_id: string | null;
  color: string | null;
  distance: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export const RoutesService = {
  findAll: async (): Promise<Route[]> => {
    const { data } = await api.get("/routes");
    return data;
  },

  findOne: async (id: string): Promise<Route> => {
    const { data } = await api.get(`/routes/${id}`);
    return data;
  },
};
