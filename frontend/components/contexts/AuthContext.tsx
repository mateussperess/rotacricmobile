import api from "@/services/api";
import { tokenStorage } from "@/services/tokenStorage";
import { getUserProfile, UserProfileResponse } from "@/services/users/userService";
import { createContext, useContext, useEffect, useState } from "react";

export interface User {
  id: string;
  email: string;
  name: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  is_staff?: boolean;
  is_superuser?: boolean;
  birth_date?: string | null;
  document?: string | null;
  document_type?: string | null;
  social_network?: string | null;
  social_network_type?: string | null;
  profile_picture_path?: string | null;
  stampsCount?: number;
}

export const CRIC_BLUE = "#2563EB";
export const ADMIN_BLUE = "#273273";

interface AuthContextType {
  token: string | null;
  user: User | null;
  loading: boolean;
  isLoggedIn: boolean;
  isAdmin: boolean;
  primaryColor: string;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function decodeToken(token: string): Partial<User> | null {
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
      username: payload.username,
      is_staff: Boolean(payload.is_staff),
      is_superuser: Boolean(payload.is_superuser),
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

  const fetchFullProfile = async (userId: string, baseUser: Partial<User>) => {
    try {
      const profile: UserProfileResponse = await getUserProfile(userId);
      const fullName = [profile.first_name, profile.last_name]
        .filter(Boolean)
        .join(" ");

      setUser({
        id: profile.id,
        email: profile.email || baseUser.email || "",
        name: fullName || baseUser.name || "Ciclista",
        username: profile.username || baseUser.username,
        first_name: profile.first_name,
        last_name: profile.last_name,
        is_staff: profile.is_staff !== undefined ? Boolean(profile.is_staff) : Boolean(baseUser.is_staff),
        is_superuser: profile.is_superuser !== undefined ? Boolean(profile.is_superuser) : Boolean(baseUser.is_superuser),
        birth_date: profile.birth_date,
        document: profile.document,
        document_type: profile.document_type,
        social_network: profile.social_network,
        social_network_type: profile.social_network_type,
        profile_picture_path: profile.profile_picture_path,
        stampsCount: 0,
      });
    } catch (err) {
      console.warn("Falha ao buscar perfil completo, usando dados do token:", err);
      setUser({
        id: userId,
        email: baseUser.email || "",
        name: baseUser.name || "Ciclista",
        username: baseUser.username,
        is_staff: Boolean(baseUser.is_staff),
        is_superuser: Boolean(baseUser.is_superuser),
      });
    }
  };

  const refreshUser = async () => {
    if (user?.id) {
      await fetchFullProfile(user.id, user);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        const saved = await tokenStorage.get();
        if (saved) {
          const decoded = decodeToken(saved);
          if (decoded && decoded.id) {
            setToken(saved);
            await fetchFullProfile(decoded.id, decoded);
          } else {
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

      const decoded = decodeToken(tokenToUse);
      if (!decoded || !decoded.id) {
        console.error("Login: falha ao decodificar token");
        return false;
      }

      await tokenStorage.save(tokenToUse);
      setToken(tokenToUse);
      await fetchFullProfile(decoded.id, decoded);
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

  const signIn = login;
  const signOut = logout;

  const isAdmin = Boolean(user?.is_staff || user?.is_superuser);
  const primaryColor = isAdmin ? ADMIN_BLUE : CRIC_BLUE;

  const value: AuthContextType = {
    token,
    user,
    loading,
    isLoggedIn: !!token && !!user,
    isAdmin,
    primaryColor,
    login,
    logout,
    refreshUser,
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
