import { useAuth } from "@/components/contexts/AuthContext";
import React from "react";
import { ActivityIndicator, Text, View } from "react-native";

interface ProtectedRouteProps {
  children: React.ReactNode;
  loadingComponent?: React.ReactNode;
  unauthorizedComponent?: React.ReactNode;
}

export function ProtectedRoute({
  children,
  loadingComponent,
  unauthorizedComponent,
}: ProtectedRouteProps) {
  const { isLoggedIn, loading } = useAuth();

  if (loading) {
    return (
      loadingComponent || (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" />
          <Text style={{ marginTop: 12 }}>Carregando...</Text>
        </View>
      )
    );
  }

  if (!isLoggedIn) {
    return (
      unauthorizedComponent || (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text>Você precisa estar autenticado para acessar esta página</Text>
        </View>
      )
    );
  }

  return children;
}
