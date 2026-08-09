import { CitiesService, CityImage } from "@/services/cities/citiesService";
import { useEffect, useState } from "react";

export function useCityImages(cityId: string) {
  const [images, setImages] = useState<CityImage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!cityId) return;
    CitiesService.findImages(cityId).then((data) => {
      setImages(data);
      setLoading(false);
    });
  }, [cityId]);

  return { images, loading };
}
