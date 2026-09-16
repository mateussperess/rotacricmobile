import api from "../api";
import {
  CitiesOfflineRepository,
  CityImagesOfflineRepository,
} from "../database/offlineRepositories";

export interface City {
  id: string;
  name: string;
  about: string | null;
  lat: number;
  lng: number;
  latitude?: number;
  longitude?: number;
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
        `/cities?name=${encodeURIComponent(name)}`
      );
      return data;
    } catch {
      const all = await CitiesOfflineRepository.getAll();
      return (
        all.find(
          (c) => c.name.toLowerCase() === name.toLowerCase()
        ) || null
      );
    }
  },

  findAll: async (): Promise<City[] | null> => {
    try {
      const { data } = await api.get("/cities");
      if (data && Array.isArray(data)) {
        await CitiesOfflineRepository.saveAll(data);
        const orderedData = [...data].sort((a: City, b: City) =>
          a.name.localeCompare(b.name)
        );
        return orderedData;
      }
    } catch (error) {
      console.log("Offline mode: Carregando cidades da base SQLite local");
    }
    return CitiesOfflineRepository.getAll();
  },

  findOne: async (id: string): Promise<City | null> => {
    try {
      const { data } = await api.get(`/cities/${id}`);
      if (data) {
        await CitiesOfflineRepository.saveAll([data]);
      }
      return data;
    } catch (error) {
      console.log("Offline mode: Carregando detalhes da cidade do SQLite local");
      return CitiesOfflineRepository.getOne(id);
    }
  },

  findImages: async (cityId: string): Promise<CityImage[]> => {
    try {
      const { data } = await api.get(`/cities/${cityId}/images`);
      if (data && Array.isArray(data)) {
        await CityImagesOfflineRepository.saveAll(cityId, data);
        return data;
      }
    } catch (error) {
      console.log("Offline mode: Buscando imagens salvas no SQLite local");
    }
    return CityImagesOfflineRepository.getByCity(cityId);
  },
};
