import axios from "axios";

const api = axios.create({
  baseURL: `http://${process.env.EXPO_PUBLIC_IP}:3000`, // definir o ip na .env da raiz
});

export default api;
