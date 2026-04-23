import React, { createContext, useContext, useState } from "react";

interface AuthContextData {
  isLoggedIn: boolean;
  user: { name: string; email: string; stampsCount: number } | null;
  login: (email: string, pass: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<any>(null);

  async function login(email: string, pass: string) {
    // chamar aqui futuramente a api (nestjs)
    if (email && pass.length >= 4) {
      setUser({ name: "Mateus Lopes", email: email, stampsCount: 5 });
      return true;
    }
    return false;
  }

  function logout() {
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ isLoggedIn: !!user, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
