import axios from "axios";
import { tokenStorage } from "./tokenStorage";

const isProd = process.env.EXPO_PUBLIC_ENV === "prod";

const RENDER_API_URL = "https://rotacricmobile.onrender.com/api";
const LOCAL_API_URL = `http://${process.env.EXPO_PUBLIC_IP || "localhost"}:3000/api`;

const baseURL = isProd
  ? process.env.EXPO_PUBLIC_API_URL || RENDER_API_URL
  : LOCAL_API_URL;

const api = axios.create({
  baseURL,
  timeout: isProd ? 15000 : 5000,
});

api.interceptors.request.use(
  async (config) => {
    const token = await tokenStorage.get();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // console.log("➡️ API REQUEST", {
    //   method: config.method?.toUpperCase(),
    //   baseURL: config.baseURL,
    //   url: config.url,
    //   fullURL: `${config.baseURL ?? ""}${config.url ?? ""}`,
    //   data: config.data,
    // });

    return config;
  },
  (error) => {
    console.log("❌ API REQUEST ERROR", error);
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (response) => {
    // console.log("⬅️ API RESPONSE", {
    //   status: response.status,
    //   url: response.config.url,
    //   data: response.data,
    // });

    return response;
  },
  (error) => {
    // console.log("❌ API RESPONSE ERROR", {
    //   message: error.message,
    //   code: error.code,
    //   status: error.response?.status,
    //   baseURL: error.config?.baseURL,
    //   url: error.config?.url,
    //   data: error.response?.data,
    // });

    return Promise.reject(error);
  },
);

export default api;
