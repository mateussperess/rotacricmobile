import axios from "axios";
import { tokenStorage } from "./tokenStorage";

const api = axios.create({
  baseURL: `http://${process.env.EXPO_PUBLIC_IP}:3000/api`, // definir o ip na .env da raiz
});

api.interceptors.request.use(async (config) => {
  const token = await tokenStorage.get();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;
