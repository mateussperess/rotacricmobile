import axios from "axios";
import { tokenStorage } from "./tokenStorage";

const isProd = process.env.EXPO_PUBLIC_ENV === "prod";

const RENDER_API_URL = "https://rotacricmobile.onrender.com/api";
const LOCAL_API_URL = `http://${process.env.EXPO_PUBLIC_IP || "localhost"}:3000/api`;

const baseURL = isProd
  ? (process.env.EXPO_PUBLIC_API_URL || RENDER_API_URL)
  : LOCAL_API_URL;

const api = axios.create({
  baseURL,
  timeout: isProd ? 15000 : 5000,
});

api.interceptors.request.use(async (config) => {
  const token = await tokenStorage.get();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;
