import { Image } from "expo-image";
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
        CitiesOfflineRepository.saveAll(data).catch(() => {});
        
        // Pre-carregar imagens de capa no cache de disco nativo para acesso off-line
        const bannerUrls = data
          .map((c: City) => c.banner_image)
          .filter((url: string | null): url is string => Boolean(url) && (url.startsWith("http://") || url.startsWith("https://")));
        if (bannerUrls.length > 0) {
          Image.prefetch(bannerUrls, "disk").catch(() => {});
        }

        const orderedData = [...data].sort((a: City, b: City) =>
          a.name.localeCompare(b.name)
        );
        return orderedData;
      }
    } catch (error) {
      // Modo off-line: carregar do SQLite silenciosamente
    }
    return CitiesOfflineRepository.getAll();
  },

  findOne: async (id: string): Promise<City | null> => {
    try {
      const { data } = await api.get(`/cities/${id}`);
      if (data) {
        await CitiesOfflineRepository.saveAll([data]);
        if (data.banner_image && (data.banner_image.startsWith("http://") || data.banner_image.startsWith("https://"))) {
          Image.prefetch(data.banner_image, "disk").catch(() => {});
        }
      }
      return data;
    } catch (error) {
      // Modo off-line: carregar do SQLite silenciosamente
      return CitiesOfflineRepository.getOne(id);
    }
  },

  findImages: async (cityId: string): Promise<CityImage[]> => {
    try {
      const { data } = await api.get(`/cities/${cityId}/images`);
      if (data && Array.isArray(data)) {
        await CityImagesOfflineRepository.saveAll(cityId, data).catch(() => {});
        const formatted = data.map((img: any) => ({
          ...img,
          url: img.url || img.image_path || img.image || "",
        }));

        // Pre-carregar imagens da galeria no cache de disco nativo para acesso off-line
        const urlsToPrefetch = formatted
          .map((img: CityImage) => img.url)
          .filter((url: string) => Boolean(url) && (url.startsWith("http://") || url.startsWith("https://")));

        if (urlsToPrefetch.length > 0) {
          Image.prefetch(urlsToPrefetch, "disk").catch(() => {});
        }

        return formatted;
      }
    } catch (error) {
      // Modo off-line: carregar do SQLite silenciosamente
    }
    return CityImagesOfflineRepository.getByCity(cityId);
  },
};
