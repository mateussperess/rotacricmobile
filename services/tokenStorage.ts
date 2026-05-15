import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "auth_token";

export const tokenStorage = {
  save: async (token: string) => {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  },

  get: async (): Promise<string | null> => {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  },

  delete: async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  },
};
