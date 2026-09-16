import NetInfo from "@react-native-community/netinfo";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { IconSymbol } from "@/components/ui/icon-symbol";
import {
  BootstrapOfflineService,
  SyncQueueRepository,
} from "@/services/database/offlineRepositories";
import { StampService } from "@/services/stamps/stampService";

export function NetworkStatusBanner() {
  const [isConnected, setIsConnected] = useState<boolean | null>(true);
  const [pendingCount, setPendingCount] = useState(0);

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

  // Se estiver online e sem itens pendentes de sincronização, oculta a barra
  if (isConnected === true && pendingCount === 0) {
    return null;
  }

  const isOffline = isConnected === false;

  return (
    <View style={styles.floatingContainer} pointerEvents="none">
      <View
        style={[
          styles.pillBadge,
          isOffline ? styles.pillOffline : styles.pillSyncing,
        ]}
      >
        {/* Ponto indicador de estado */}
        <View
          style={[
            styles.statusDot,
            isOffline ? styles.statusDotOffline : styles.statusDotSyncing,
          ]}
        />

        {/* Ícone */}
        <View style={styles.iconContainer}>
          <IconSymbol
            name={isOffline ? "wifi.slash" : "arrow.clockwise"}
            size={14}
            color={isOffline ? "#F59E0B" : "#60A5FA"}
          />
        </View>

        {/* Rótulo de texto */}
        <Text style={styles.titleText}>
          {isOffline ? "Modo Off-line" : "Sincronizando"}
        </Text>

        <Text style={styles.dotSeparator}>•</Text>

        <Text style={styles.subText}>
          {isOffline
            ? pendingCount > 0
              ? `${pendingCount} pendente(s)`
              : "Dados salvos no dispositivo"
            : `${pendingCount} item(ns)...`}
        </Text>

        {/* Badge numérico para contagem de pendências */}
        {pendingCount > 0 && isOffline && (
          <View style={styles.countChip}>
            <Text style={styles.countChipText}>{pendingCount}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  floatingContainer: {
    position: "absolute",
    top: 50,
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 99999,
    elevation: 99999,
  },
  pillBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 24,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  pillOffline: {
    backgroundColor: "#1E293B", // Navy Slate elegante em harmonia com Rota CRIC
    borderWidth: 1,
    borderColor: "rgba(245, 158, 11, 0.4)", // Borda Âmbar suave
  },
  pillSyncing: {
    backgroundColor: "#1E3A8A", // Azul Royal de Sincronização
    borderWidth: 1,
    borderColor: "rgba(96, 165, 250, 0.45)", // Borda Azul Celeste
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 8,
  },
  statusDotOffline: {
    backgroundColor: "#F59E0B", // Âmbar Dourado
  },
  statusDotSyncing: {
    backgroundColor: "#38BDF8", // Azul Celeste Brilhante
  },
  iconContainer: {
    marginRight: 6,
  },
  titleText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  dotSeparator: {
    color: "rgba(255, 255, 255, 0.4)",
    fontSize: 12,
    marginHorizontal: 5,
  },
  subText: {
    color: "#CBD5E1", // Slate suave legível
    fontSize: 11,
    fontWeight: "500",
  },
  countChip: {
    backgroundColor: "#F59E0B",
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 1,
    marginLeft: 6,
  },
  countChipText: {
    color: "#0F172A",
    fontSize: 10,
    fontWeight: "800",
  },
});
