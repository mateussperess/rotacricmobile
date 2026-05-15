// src/contexts/AuthContext.tsx
import api from "@/services/api";
import { tokenStorage } from "@/services/tokenStorage";
import { createContext, useContext, useEffect, useState } from "react";

interface User {
  id: string;
  email: string;
  name: string;
  stampsCount?: number;
}

interface AuthContextType {
  token: string | null;
  user: User | null;
  loading: boolean;
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<boolean>; // mantém compatibilidade
  signOut: () => Promise<void>; // mantém compatibilidade
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function decodeToken(token: string): User | null {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );
    const payload = JSON.parse(jsonPayload);
    const email = payload.email || payload.username || "user";
    return {
      id: payload.sub || payload.id,
      email: email,
      name: payload.name || email.split("@")[0],
      stampsCount: payload.stampsCount || 0,
    };
  } catch (error) {
    console.error("Erro ao decodificar token:", error);
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const saved = await tokenStorage.get();
        if (saved) {
          const userData = decodeToken(saved);
          if (userData) {
            setToken(saved);
            setUser(userData);
          } else {
            // Token inválido, limpar
            await tokenStorage.delete();
          }
        }
      } catch (error) {
        console.error("Erro ao inicializar auth:", error);
        await tokenStorage.delete();
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const { data } = await api.post("/auth/login", { email, pass: password });
      const tokenToUse = data.token || data.access_token;

      if (!tokenToUse) {
        console.error("Login: token não retornado pelo backend");
        return false;
      }

      const userData = decodeToken(tokenToUse);
      if (!userData) {
        console.error("Login: falha ao decodificar token");
        return false;
      }

      await tokenStorage.save(tokenToUse);
      setToken(tokenToUse);
      setUser(userData);
      return true;
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      return false;
    }
  };

  const logout = async () => {
    await tokenStorage.delete();
    setToken(null);
    setUser(null);
  };

  // Manter compatibilidade com nomes antigos
  const signIn = login;
  const signOut = logout;

  const value: AuthContextType = {
    token,
    user,
    loading,
    isLoggedIn: !!token && !!user,
    login,
    logout,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider");
  }
  return context;
};
