import api from "../api";

export interface AnchorPointCategory {
  id: string;
  name: string;
  icon_name: string;
  is_active: boolean;
}

export const AnchorPointCategoryService = {
  findAll: async (): Promise<AnchorPointCategory[]> => {
    const { data } = await api.get("/anchor-point-categories");
    return data;
  },
};
