import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import * as SplashScreen from "expo-splash-screen";

import { deactivateKeepAwake } from "expo-keep-awake";
import { useEffect, useState } from "react";
import { AuthProvider } from "@/components/contexts/AuthContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { AnimatedSplashScreen } from "@/components/AnimatedSplashScreen";

// Manter a splash nativa visível até a inicialização inicial
SplashScreen.preventAutoHideAsync().catch(() => {});

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [splashAnimationDone, setSplashAnimationDone] = useState(false);

  useEffect(() => {
    try {
      deactivateKeepAwake().catch(() => {});
    } catch {}

    // Oculta a splash nativa estática do sistema para exibir a AnimatedSplashScreen
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  return (
    <AuthProvider>
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
    </AuthProvider>
  );
}

