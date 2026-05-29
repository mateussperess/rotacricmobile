import { Tabs, useRouter } from "expo-router";
import React, { useEffect } from "react";

import { useAuth } from "@/components/contexts/AuthContext";
import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Text, View } from "react-native";

export default function TabLayout() {
  const { token, loading } = useAuth();
  const router = useRouter();
  const colorScheme = useColorScheme();

  useEffect(() => {
    if (!loading && !token) {
      router.replace("/(tabs)/profile");
    }
  }, [token, loading, router]);

  if (loading) {
    return (
      <View>
        <Text>Carregando...</Text>
      </View>
    );
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}
    >
      <Tabs.Screen
        name="nativeMap"
        options={{
          title: "Mapa",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="map.fill" color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="cidades"
        options={{
          title: "Cidades",
          tabBarIcon: ({ color }) => (
            <IconSymbol name="building.2.fill" size={28} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="escanear"
        options={{
          title: "Escanear",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="barcode.viewfinder" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="carimbos"
        options={{
          title: "Carimbos",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="star.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile/index"
        options={{
          title: token ? "Perfil" : "Entrar",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="person.fill" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
