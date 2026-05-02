import api from "./api";
import { tokenStorage } from "./tokenStorage";

export const login = async (email: string, pass: string) => {
  const { data } = await api.post("auth/login", { email, pass });

  await tokenStorage.save(data.access_token);
  return data;
};

export const logout = async () => {
  await tokenStorage.delete();
};
