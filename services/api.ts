import axios from "axios";

const api = axios.create({
  baseURL: "http://meu_ip:3000",
});

export default api;
