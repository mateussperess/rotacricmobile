import api from "../api";

export interface CreateUserData {
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  pass: string;
}

export async function createUser(data: CreateUserData) {
  const response = await api.post("/users", data);
  return response.data;
}
