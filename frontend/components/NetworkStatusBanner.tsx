import NetInfo from "@react-native-community/netinfo";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { IconSymbol } from "@/components/ui/icon-symbol";
import {
  BootstrapOfflineService,
  SyncQueueRepository,
} from "@/services/database/offlineRepositories";
import { StampService } from "@/services/stamps/stampService";

export function NetworkStatusBanner() {
  const [isConnected, setIsConnected] = useState<boolean | null>(true);
  const [pendingCount, setPendingCount] = useState(0);
  const [expanded, setExpanded] = useState(false);

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

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
      // Ignorar caso NetInfo não esteja disponível no ambiente atual
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
      } catch {
        // cleanup silencioso
      }
      clearInterval(interval);
    };
  }, [isConnected]);

  // Efeito de pulso discreto no ponto indicador para feedback suave sem travamento
  useEffect(() => {
    if (isConnected === false || pendingCount > 0) {
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
        ])
      );
      pulseLoop.start();
      return () => pulseLoop.stop();
    }
  }, [isConnected, pendingCount, pulseAnim]);

  // Se estiver online e sem itens pendentes de sincronização, oculta a barra
  if (isConnected === true && pendingCount === 0) {
    return null;
  }

  const isOffline = isConnected === false;

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

  return (
    <View style={styles.topRightWrapper} pointerEvents="box-none">
      <Animated.View style={[{ transform: [{ scale: scaleAnim }] }]}>
        {!expanded ? (
          /* ── ESTADO RECOLHIDO (MINIMALISTA CANTO SUPERIOR DIREITO) ── */
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={toggleExpand}
            style={[
              styles.minimalPill,
              isOffline ? styles.borderOffline : styles.borderSyncing,
            ]}
          >
            {/* Ponto indicador de sinalização rápida */}
            <Animated.View
              style={[
                styles.dot,
                isOffline ? styles.dotOffline : styles.dotSyncing,
                { opacity: pulseAnim },
              ]}
            />

            <IconSymbol
              name={isOffline ? "wifi.slash" : "arrow.clockwise"}
              size={13}
              color={isOffline ? "#F59E0B" : "#38BDF8"}
            />

            <Text style={styles.minimalText}>
              {isOffline ? "Off-line" : "Sincronizando"}
            </Text>

            {pendingCount > 0 && (
              <View style={styles.badgeCount}>
                <Text style={styles.badgeCountText}>{pendingCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        ) : (
          /* ── ESTADO EXPANDIDO (CARD EXPLICATIVO FLUTUANTE) ── */
          <View
            style={[
              styles.expandedCard,
              isOffline ? styles.borderOffline : styles.borderSyncing,
            ]}
          >
            <View style={styles.expandedHeader}>
              <View style={styles.titleRow}>
                <Animated.View
                  style={[
                    styles.dot,
                    isOffline ? styles.dotOffline : styles.dotSyncing,
                    { opacity: pulseAnim },
                  ]}
                />
                <Text style={styles.expandedTitle}>
                  {isOffline ? "Dispositivo Off-line" : "Sincronizando Dados"}
                </Text>
              </View>

              <Pressable onPress={toggleExpand} style={styles.closeBtn}>
                <Text style={styles.closeBtnText}>✕</Text>
              </Pressable>
            </View>

            <Text style={styles.expandedSubText}>
              {isOffline
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
  );
}

const styles = StyleSheet.create({
  topRightWrapper: {
    position: "absolute",
    top: 54,
    right: 16,
    zIndex: 99999,
    elevation: 99999,
    alignItems: "flex-end",
  },

  /* Minimalista */
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
