import React, { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  Image,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";
import * as SplashScreen from "expo-splash-screen";

interface AnimatedSplashScreenProps {
  onAnimationFinish: () => void;
}

export function AnimatedSplashScreen({
  onAnimationFinish,
}: AnimatedSplashScreenProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  // Valores de animação - logo inicia visível (opacidade 1) para transição perfeita sem piscar
  const logoScale = useRef(new Animated.Value(0.95)).current;
  const logoOpacity = useRef(new Animated.Value(1)).current;
  const brandOpacity = useRef(new Animated.Value(0)).current;
  const brandTranslateY = useRef(new Animated.Value(12)).current;
  const containerOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // 1. Suave respiro da logo (estilo iFood / Mercado Livre)
    Animated.spring(logoScale, {
      toValue: 1,
      friction: 7,
      tension: 40,
      useNativeDriver: true,
    }).start();

    // 2. Aparição elegante da marca no rodapé
    Animated.parallel([
      Animated.timing(brandOpacity, {
        toValue: 1,
        duration: 450,
        delay: 200,
        useNativeDriver: true,
      }),
      Animated.timing(brandTranslateY, {
        toValue: 0,
        duration: 450,
        delay: 200,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();

    // 3. Transição em fade-out da tela de carregamento após 1.3s
    const timer = setTimeout(() => {
      Animated.timing(containerOpacity, {
        toValue: 0,
        duration: 350,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }).start(() => {
        onAnimationFinish();
      });
    }, 1300);

    return () => clearTimeout(timer);
  }, []);

  const handleLayout = () => {
    // Ocultar a splash screen nativa no exato momento que a View animada estiver desenhada no layout
    SplashScreen.hideAsync().catch(() => {});
  };

  const bgColor = isDark ? "#0F172A" : "#F8FAFC";
  const titleColor = isDark ? "#F8FAFC" : "#0F172A";
  const subtitleColor = isDark ? "#94A3B8" : "#64748B";

  return (
    <Animated.View
      onLayout={handleLayout}
      style={[
        styles.container,
        { backgroundColor: bgColor, opacity: containerOpacity },
      ]}
      pointerEvents="none"
    >
      {/* Centro: Logo com animação de entrada */}
      <View style={styles.centerBox}>
        <Animated.View
          style={[
            styles.logoWrapper,
            {
              opacity: logoOpacity,
              transform: [{ scale: logoScale }],
            },
          ]}
        >
          <Image
            source={require("@/assets/images/splash-icon.png")}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </Animated.View>
      </View>

      {/* Rodapé: Marca RotaCRIC Mobile */}
      <Animated.View
        style={[
          styles.footerBox,
          {
            opacity: brandOpacity,
            transform: [{ translateY: brandTranslateY }],
          },
        ]}
      >
        <Text style={[styles.brandSubtitle, { color: subtitleColor }]}>
          CICLOTURISMO CARBONÍFERO
        </Text>
        <Text style={[styles.brandTitle, { color: titleColor }]}>
          RotaCRIC Mobile
        </Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    zIndex: 999999,
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 60,
    paddingBottom: 45,
  },
  centerBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logoWrapper: {
    width: 200,
    height: 200,
    justifyContent: "center",
    alignItems: "center",
  },
  logoImage: {
    width: "100%",
    height: "100%",
  },
  footerBox: {
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  brandSubtitle: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: -0.5,
  },
});

