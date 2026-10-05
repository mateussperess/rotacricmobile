import "@/services/notifications/backgroundGeofenceTask";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
  Stack,
} from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import * as SplashScreen from "expo-splash-screen";

import { useEffect, useState } from "react";
import { AuthProvider } from "@/components/contexts/AuthContext";
import { NotificationProvider } from "@/components/contexts/NotificationContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { AnimatedSplashScreen } from "@/components/AnimatedSplashScreen";
import { BootstrapOfflineService } from "@/services/database/offlineRepositories";
import { proximityService } from "@/services/notifications/proximityService";

// Manter a splash nativa visível até a inicialização inicial
SplashScreen.preventAutoHideAsync().catch(() => {});

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [splashAnimationDone, setSplashAnimationDone] = useState(false);

  useEffect(() => {
    // Garante o preenchimento do SQLite com cidades, rotas e pontos de apoio e ativa o Geofencing
    BootstrapOfflineService.syncBootstrapData()
      .then(() => {
        proximityService.startGeofencing().catch(() => {});
      })
      .catch(() => {
        proximityService.startGeofencing().catch(() => {});
      });
  }, []);

  return (
    <AuthProvider>
      <NotificationProvider>
        <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="admin/index" options={{ headerShown: false }} />
            <Stack.Screen
              name="modal"
              options={{ presentation: "modal", title: "Modal" }}
            />
          </Stack>
          <StatusBar style="auto" />
          {!splashAnimationDone && (
            <AnimatedSplashScreen
              onAnimationFinish={() => setSplashAnimationDone(true)}
            />
          )}
        </ThemeProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}

