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

export interface CityImage {
  id: string;
  city_id: string;
  url: string;
  caption: string | null;
  order: number;
  created_at: string;
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
      const orderedData = [...data].sort((a: City, b: City) =>
        a.name.localeCompare(b.name),
      );
      return orderedData;
    } catch (error) {
      console.error("Error fetching cities:", error);
      return null;
    }
  },

  findOne: async (id: string): Promise<City | null> => {
    try {
      const { data } = await api.get(`/cities/${id}`);
      return data;
    } catch (error) {
      console.error("Error fetching city:", error);
      return null;
    }
  },

  findImages: async (cityId: string): Promise<CityImage[]> => {
    try {
      const { data } = await api.get(`/cities/${cityId}/images`);
      return data;
    } catch (error) {
      console.error("Error fetching city images:", error);
      return [];
    }
  },
};
