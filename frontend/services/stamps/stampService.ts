import api from "../api";

export interface Stamp {
  id: string;
  anchor_point_id: string;
  qr_code_token: string;
  name: string;
  badge_image: string;
  active: boolean;
  anchor_point?: any;
  created_at?: string;
}

export const StampService = {
  createStamp: async (payload: {
    anchor_point_id: number;
    name: string;
    badge_image?: string;
    qr_code_token?: string;
  }): Promise<Stamp> => {
    const { data } = await api.post("/stamps", payload);
    return data;
  },

  findAll: async (): Promise<Stamp[]> => {
    const { data } = await api.get("/stamps");
    return data;
  },

  getUserStamps: async (): Promise<any[]> => {
    const { data } = await api.get("/stamps/my-stamps");
    return data;
  },

  toggleActive: async (id: string): Promise<Stamp> => {
    const { data } = await api.patch(`/stamps/${id}/toggle-active`);
    return data;
  },

  deleteStamp: async (id: string): Promise<any> => {
    const { data } = await api.delete(`/stamps/${id}`);
    return data;
  },
};
