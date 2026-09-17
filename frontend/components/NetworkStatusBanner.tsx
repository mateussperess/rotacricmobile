import NetInfo from "@react-native-community/netinfo";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { usePathname } from "expo-router";
import { IconSymbol } from "@/components/ui/icon-symbol";
import {
  BootstrapOfflineService,
  SyncQueueRepository,
} from "@/services/database/offlineRepositories";
import { StampService } from "@/services/stamps/stampService";

export type NetworkStatusState = "online" | "offline" | "syncing" | "reconnected";

export function useNetworkStatus() {
  const [isConnected, setIsConnected] = useState<boolean | null>(true);
  const [pendingCount, setPendingCount] = useState(0);
  const [statusState, setStatusState] = useState<NetworkStatusState>("online");
  const wasOfflineRef = useRef(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let unsubscribe = () => {};
    try {
      if (NetInfo && typeof NetInfo.addEventListener === "function") {
        unsubscribe = NetInfo.addEventListener((state) => {
          const isOffline =
            state.isConnected === false || state.isInternetReachable === false;
          const online = !isOffline;
          setIsConnected(online);
          if (online) {
            BootstrapOfflineService.syncBootstrapData();
            StampService.processSyncQueue();
          }
        });
      }
    } catch {
      // Ignorar caso NetInfo não esteja disponível
    }

    const checkPending = async () => {
      try {
        const count = await SyncQueueRepository.getPendingCount();
        setPendingCount(count);
        if (count > 0 && isConnected) {
          await StampService.processSyncQueue();
        }
      } catch {
        // Ignorar se a base local estiver inicializando
      }
    };

    checkPending();
    const interval = setInterval(checkPending, 3000);

    return () => {
      try {
        unsubscribe();
      } catch {}
      if (timerRef.current) clearTimeout(timerRef.current);
      clearInterval(interval);
    };
  }, [isConnected]);

  useEffect(() => {
    if (isConnected === false) {
      wasOfflineRef.current = true;
      if (timerRef.current) clearTimeout(timerRef.current);
      setStatusState("offline");
    } else if (pendingCount > 0) {
      setStatusState("syncing");
    } else {
      if (wasOfflineRef.current) {
        setStatusState("reconnected");
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
          wasOfflineRef.current = false;
          setStatusState("online");
        }, 3500);
      } else {
        setStatusState("online");
      }
    }
  }, [isConnected, pendingCount]);

  return { isConnected, pendingCount, statusState, isOffline: isConnected === false };
}

/** Badge Inline Animado para exibição ao lado do card de posição */
export function NetworkStatusInlineBadge({
  statusState,
  pendingCount,
  onPress,
}: {
  statusState: NetworkStatusState;
  pendingCount: number;
  onPress: () => void;
}) {
  const expandAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const spinAnim = useRef(new Animated.Value(0)).current;
  const colorAnim = useRef(new Animated.Value(0)).current;

  const isVisible = statusState !== "online";

  useEffect(() => {
    Animated.timing(expandAnim, {
      toValue: isVisible ? 1 : 0,
      duration: isVisible ? 320 : 280,
      easing: isVisible
        ? Easing.bezier(0.16, 1, 0.3, 1)
        : Easing.bezier(0.7, 0, 0.84, 0),
      useNativeDriver: false,
      isInteraction: false,
    }).start();
  }, [isVisible, expandAnim]);

  useEffect(() => {
    if (statusState === "reconnected") {
      Animated.timing(colorAnim, {
        toValue: 1,
        duration: 450,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false,
        isInteraction: false,
      }).start();
    } else {
      colorAnim.setValue(0);
    }
  }, [statusState, colorAnim]);

  useEffect(() => {
    if (statusState === "syncing") {
      const spinLoop = Animated.loop(
        Animated.timing(spinAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: false,
          isInteraction: false,
        }),
      );
      spinLoop.start();
      return () => {
        spinLoop.stop();
        spinAnim.setValue(0);
      };
    } else {
      spinAnim.setValue(0);
    }
  }, [statusState, spinAnim]);

  useEffect(() => {
    if (statusState === "offline" || statusState === "syncing") {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 0.35,
            duration: 750,
            useNativeDriver: false,
            isInteraction: false,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 750,
            useNativeDriver: false,
            isInteraction: false,
          }),
        ]),
      );
      loop.start();
      return () => loop.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [statusState, pulseAnim]);

  const badgeWidth = expandAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 48],
    extrapolate: "clamp",
  });

  const badgeOpacity = expandAnim.interpolate({
    inputRange: [0, 0.15, 1],
    outputRange: [0, 0.3, 1],
    extrapolate: "clamp",
  });

  const badgeScale = expandAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.75, 1],
    extrapolate: "clamp",
  });

  const marginLeft = expandAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 8],
    extrapolate: "clamp",
  });

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const borderColor = colorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [
      statusState === "syncing"
        ? "rgba(56, 189, 248, 0.6)"
        : "rgba(245, 158, 11, 0.6)",
      "rgba(16, 185, 129, 0.8)",
    ],
  });

  const dotColor = colorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [
      statusState === "syncing" ? "#0284C7" : "#F59E0B",
      "#10B981",
    ],
  });

  const offlineOpacity = colorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0],
  });

  const reconnectedOpacity = colorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <Animated.View
      style={{
        width: badgeWidth,
        height: 48,
        opacity: badgeOpacity,
        marginLeft,
        transform: [{ scale: badgeScale }],
        overflow: "hidden",
        justifyContent: "center",
      }}
    >
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onPress}
        style={[styles.inlinePill, { borderColor }]}
      >
        <Animated.View
          style={[
            styles.dot,
            { backgroundColor: dotColor, opacity: pulseAnim },
          ]}
        />
        {statusState === "syncing" ? (
          <Animated.View style={{ transform: [{ rotate: spin }] }}>
            <IconSymbol name="arrow.clockwise" size={15} color="#0284C7" />
          </Animated.View>
        ) : (
          <View
            style={{
              width: 18,
              height: 18,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* Ícone off-line (Wi-Fi cortado em Amarelo) */}
            <Animated.View
              style={[
                StyleSheet.absoluteFill,
                {
                  opacity: offlineOpacity,
                  alignItems: "center",
                  justifyContent: "center",
                },
              ]}
            >
              <IconSymbol name="wifi.slash" size={15} color="#D97706" />
            </Animated.View>
            {/* Ícone reconectado (Wi-Fi limpo sem traço em Verde) */}
            <Animated.View
              style={[
                StyleSheet.absoluteFill,
                {
                  opacity: reconnectedOpacity,
                  alignItems: "center",
                  justifyContent: "center",
                },
              ]}
            >
              <IconSymbol name="wifi" size={15} color="#10B981" />
            </Animated.View>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

export function NetworkStatusBanner() {
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const { isConnected, pendingCount, statusState } = useNetworkStatus();
  const [expanded, setExpanded] = useState(false);

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Garante que o mapa nativo NUNCA exiba o banner flutuante global
  const isOtherTab =
    Boolean(
      pathname &&
        (pathname.includes("cidades") ||
          pathname.includes("carimbos") ||
          pathname.includes("escanear") ||
          pathname.includes("profile")),
    );
  const isMapScreen = !isOtherTab;

  useEffect(() => {
    if (statusState === "offline" || statusState === "syncing") {
      const pulseLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 0.4,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ]),
      );
      pulseLoop.start();
      return () => pulseLoop.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [statusState, pulseAnim]);

  // Se estiver no mapa nativo ou se estiver online sem pendências, oculta a pílula global
  if (isMapScreen || statusState === "online") {
    return null;
  }

  const isOffline = statusState === "offline";
  const isReconnected = statusState === "reconnected";

  const toggleExpand = () => {
    const nextState = !expanded;
    setExpanded(nextState);
    Animated.spring(scaleAnim, {
      toValue: nextState ? 1.03 : 1,
      useNativeDriver: true,
      speed: 25,
      bounciness: 6,
    }).start(() => {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        speed: 30,
      }).start();
    });
  };

  const topOffset = Math.max(insets.top + 6, 10);

  return (
    <>
      {expanded && (
        <Pressable
          style={styles.backdrop}
          onPress={toggleExpand}
          accessibilityLabel="Fechar aviso off-line"
        />
      )}
      <View style={[styles.topCenterWrapper, { top: topOffset }]} pointerEvents="box-none">
        <Animated.View style={[{ transform: [{ scale: scaleAnim }] }]}>
          {!expanded ? (
            /* ── ESTADO RECOLHIDO ── */
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={toggleExpand}
              style={[
                styles.minimalPill,
                isReconnected
                  ? styles.borderReconnected
                  : isOffline
                    ? styles.borderOffline
                    : styles.borderSyncing,
              ]}
            >
              <Animated.View
                style={[
                  styles.dot,
                  isReconnected
                    ? styles.dotReconnected
                    : isOffline
                      ? styles.dotOffline
                      : styles.dotSyncing,
                  { opacity: pulseAnim },
                ]}
              />

              <IconSymbol
                name={
                  isReconnected
                    ? "wifi"
                    : isOffline
                      ? "wifi.slash"
                      : "arrow.clockwise"
                }
                size={13}
                color={isReconnected ? "#10B981" : isOffline ? "#F59E0B" : "#38BDF8"}
              />

              <Text style={styles.minimalText}>
                {isReconnected
                  ? "Conectado"
                  : isOffline
                    ? "Off-line"
                    : "Sincronizando"}
              </Text>

              {pendingCount > 0 && (
                <View style={styles.badgeCount}>
                  <Text style={styles.badgeCountText}>{pendingCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          ) : (
            /* ── ESTADO EXPANDIDO ── */
            <View
              style={[
                styles.expandedCard,
                isReconnected
                  ? styles.borderReconnected
                  : isOffline
                    ? styles.borderOffline
                    : styles.borderSyncing,
              ]}
            >
              <View style={styles.expandedHeader}>
                <View style={styles.titleRow}>
                  <Animated.View
                    style={[
                      styles.dot,
                      isReconnected
                        ? styles.dotReconnected
                        : isOffline
                          ? styles.dotOffline
                          : styles.dotSyncing,
                      { opacity: pulseAnim },
                    ]}
                  />
                  <Text style={styles.expandedTitle}>
                    {isReconnected
                      ? "Conexão Reestabelecida"
                      : isOffline
                        ? "Dispositivo Off-line"
                        : "Sincronizando Dados"}
                  </Text>
                </View>

                <Pressable onPress={toggleExpand} style={styles.closeBtn}>
                  <Text style={styles.closeBtnText}>✕</Text>
                </Pressable>
              </View>

              <Text style={styles.expandedSubText}>
                {isReconnected
                  ? "Você está online novamente. As informações e carimbos pendentes foram sincronizados com sucesso."
                  : isOffline
                    ? pendingCount > 0
                      ? `Você está desconectado da internet. Há ${pendingCount} carimbo(s) salvo(s) neste celular que serão enviados automaticamente ao reconectar.`
                      : "Você está sem conexão de internet. As informações de cidades, rotas, mapas e carimbos salvos continuam disponíveis para consulta off-line."
                    : `Sincronizando ${pendingCount} item(ns) pendente(s) com os servidores da Rota CRIC...`}
              </Text>

              <View style={styles.expandedFooter}>
                {pendingCount > 0 && (
                  <View style={styles.pendingChip}>
                    <Text style={styles.pendingChipText}>
                      {pendingCount} pendente(s) na fila
                    </Text>
                  </View>
                )}

                <TouchableOpacity
                  style={styles.collapseBtn}
                  onPress={toggleExpand}
                  activeOpacity={0.8}
                >
                  <Text style={styles.collapseBtnText}>Recolher</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </Animated.View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(15, 23, 42, 0.25)",
    zIndex: 99998,
  },
  topCenterWrapper: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 99999,
    elevation: 99999,
  },

  /* Badge Inline (Branco e Alinhado) */
  inlinePill: {
    width: 48,
    height: 48,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    borderWidth: 1.5,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },

  /* Minimalista Global */
  minimalPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0F172A",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    gap: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  borderOffline: {
    borderWidth: 1.5,
    borderColor: "rgba(245, 158, 11, 0.6)",
  },
  borderSyncing: {
    borderWidth: 1.5,
    borderColor: "rgba(56, 189, 248, 0.6)",
  },
  borderReconnected: {
    borderWidth: 1.5,
    borderColor: "rgba(16, 185, 129, 0.6)",
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  dotOffline: {
    backgroundColor: "#F59E0B",
  },
  dotSyncing: {
    backgroundColor: "#38BDF8",
  },
  dotReconnected: {
    backgroundColor: "#10B981",
  },
  minimalText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  badgeCount: {
    backgroundColor: "#F59E0B",
    borderRadius: 9,
    paddingHorizontal: 5,
    paddingVertical: 1,
    marginLeft: 2,
  },
  badgeCountText: {
    color: "#0F172A",
    fontSize: 10,
    fontWeight: "900",
  },

  /* Card Expandido */
  expandedCard: {
    width: 280,
    backgroundColor: "#0F172A",
    borderRadius: 16,
    padding: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 12,
    gap: 8,
  },
  expandedHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  expandedTitle: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },
  closeBtn: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  closeBtnText: {
    color: "#94A3B8",
    fontSize: 11,
    fontWeight: "bold",
  },
  expandedSubText: {
    color: "#CBD5E1",
    fontSize: 11,
    lineHeight: 16,
  },
  expandedFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
  },
  pendingChip: {
    backgroundColor: "rgba(245, 158, 11, 0.2)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(245, 158, 11, 0.3)",
  },
  pendingChipText: {
    color: "#FBBF24",
    fontSize: 10,
    fontWeight: "700",
  },
  collapseBtn: {
    backgroundColor: "#2563EB",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
    marginLeft: "auto",
  },
  collapseBtnText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
  },
});
