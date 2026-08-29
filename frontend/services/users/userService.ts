import api from "../api";

export interface CreateUserData {
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  pass: string;
}

export interface UpdateUserData {
  first_name?: string;
  last_name?: string;
  email?: string;
  username?: string;
  pass?: string;
  birth_date?: string;
  document?: string;
  document_type?: string;
  social_network?: string;
  social_network_type?: string;
}

export interface UserProfileResponse {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  birth_date?: string | null;
  document?: string | null;
  document_type?: string | null;
  social_network?: string | null;
  social_network_type?: string | null;
  profile_picture_path?: string | null;
  created_at: string;
  updated_at: string;
}

export async function createUser(data: CreateUserData) {
  const response = await api.post("/users", data);
  return response.data;
}

export async function getUserProfile(id: string): Promise<UserProfileResponse> {
  const response = await api.get(`/users/${id}`);
  return response.data;
}

export async function updateUserProfile(
  id: string,
  data: UpdateUserData,
): Promise<UserProfileResponse> {
  const response = await api.patch(`/users/${id}`, data);
  return response.data;
}
