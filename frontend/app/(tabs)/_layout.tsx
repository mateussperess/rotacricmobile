import { Tabs } from "expo-router";
import React from "react";

import { useAuth } from "@/components/contexts/AuthContext";
import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";

const TAB_BAR_HEIGHT = 64;

/** Botão central elevado — substitui o tabBarButton padrão só no Escanear */
function ScanTabButton({ onPress, children }: any) {
  return (
    <Pressable
      onPress={onPress}
      style={styles.scanTabButton}
      android_ripple={{ color: "transparent" }}
    >
      {/* Círculo azul elevado */}
      <View style={styles.scanButton}>
        <IconSymbol size={26} name="barcode.viewfinder" color="#FFFFFF" />
      </View>
      <Text style={styles.scanLabel}>Escanear</Text>
    </Pressable>
  );
}

export default function TabLayout() {
  const { token, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#2563EB",
        tabBarInactiveTintColor: "#9CA3AF",
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarItemStyle: styles.tabBarItem,
      }}
    >
      <Tabs.Screen
        name="nativeMap"
        options={{
          title: "Mapa",
          tabBarIcon: ({ color, focused }) => (
            <View
              style={focused ? styles.activeIconWrapper : styles.iconWrapper}
            >
              <IconSymbol size={22} name="map.fill" color={color} />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="cidades"
        options={{
          title: "Cidades",
          tabBarIcon: ({ color, focused }) => (
            <View
              style={focused ? styles.activeIconWrapper : styles.iconWrapper}
            >
              <IconSymbol name="building.2.fill" size={22} color={color} />
            </View>
          ),
        }}
      />

      {/* ── Escanear: botão customizado elevado ── */}
      <Tabs.Screen
        name="escanear"
        options={{
          title: "Escanear",
          tabBarLabel: () => null,
          tabBarIcon: () => null,
          tabBarButton: (props) => <ScanTabButton {...props} />,
          tabBarItemStyle: styles.scanTabItem,
        }}
      />

      <Tabs.Screen
        name="carimbos"
        options={{
          title: "Carimbos",
          tabBarIcon: ({ color, focused }) => (
            <View
              style={focused ? styles.activeIconWrapper : styles.iconWrapper}
            >
              <IconSymbol size={22} name="star.fill" color={color} />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: token ? "Perfil" : "Entrar",
          tabBarIcon: ({ color, focused }) => (
            <View
              style={focused ? styles.activeIconWrapper : styles.iconWrapper}
            >
              <IconSymbol size={22} name="person.fill" color={color} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8FAFC",
  },
  loadingText: {
    color: "#6B7280",
  },

  tabBar: {
    height: TAB_BAR_HEIGHT + (Platform.OS === "ios" ? 20 : 0),
    backgroundColor: "#FFFFFF",
    borderTopWidth: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 16,
    paddingBottom: Platform.OS === "ios" ? 20 : 6,
  },
  tabBarLabel: {
    fontSize: 10,
    fontWeight: "500",
    marginTop: 2,
  },
  tabBarItem: {
    paddingTop: 4,
  },

  iconWrapper: {
    backgroundColor: "#F3F4F6",
    borderRadius: 10,
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  activeIconWrapper: {
    backgroundColor: "#EFF6FF",
    borderRadius: 10,
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },

  scanTabItem: {
    overflow: "visible",
  },
  scanTabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: Platform.OS === "ios" ? 20 : 6,
    overflow: "visible",
  },
  scanButton: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
    marginTop: -20,
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 12,
  },
  scanLabel: {
    fontSize: 10,
    fontWeight: "500",
    color: "#2563EB",
    marginTop: 3,
    letterSpacing: 0.2,
  },
});
