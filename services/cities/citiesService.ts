import api from "../api";

export interface City {
  id: string;
  name: string;
  about: string | null;
  lat: number;
  lng: number;
  zoom: number;
  banner_image: string | null;
  visible: boolean;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export const CitiesService = {
  findByName: async (name: string): Promise<City | null> => {
    try {
      const { data } = await api.get(
        `/cities?name=${encodeURIComponent(name)}`,
      );
      return data;
    } catch {
      return null;
    }
  },

  findAll: async (): Promise<City[] | null> => {
    try {
      const { data } = await api.get("/cities");
      return data;
    } catch (error) {
      console.error("Error fetching cities:", error);
      return null;
    }
  },
};
