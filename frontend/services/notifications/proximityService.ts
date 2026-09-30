import * as Location from "expo-location";
import { Platform, Alert, Linking } from "react-native";
import { GEOFENCE_TASK_NAME } from "./backgroundGeofenceTask";
import { getDatabase, runReadOnly } from "../database/database";
import { notificationService } from "./notificationService";

interface AnchorPointCoords {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

// Cooldown de 1 hora por ponto para o monitoramento de primeiro plano (Foreground)
const FOREGROUND_COOLDOWN_MS = 60 * 60 * 1000;
const lastForegroundNotified: Record<string, number> = {};

function calculateDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Raio da Terra em metros
  const rad1 = (lat1 * Math.PI) / 180;
  const rad2 = (lat2 * Math.PI) / 180;
  const deltaLat = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLng = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(rad1) * Math.cos(rad2) * Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}


class ProximityService {
  private isConfigured = false;
  private locationSubscription: Location.LocationSubscription | null = null;
  private hasPromptedBgPermission = false;

  /**
   * Inicializa o serviço de proximidade para pontos de apoio (Geofencing Nativo em 2º plano + Fallback 1º plano)
   */
  async startGeofencing(radiusMeters = 150): Promise<boolean> {
    try {
      // 1. Verifica/Solicita permissão de localização em Primeiro Plano (Durante o uso do app)
      let fgPermission = await Location.getForegroundPermissionsAsync();
      if (!fgPermission.granted && fgPermission.canAskAgain) {
        fgPermission = await Location.requestForegroundPermissionsAsync();
      }

      if (!fgPermission.granted) {
        console.warn("Permissão de localização em primeiro plano não foi concedida pelo usuário.");
        return false;
      }

      // 2. Busca os pontos de apoio cadastrados no SQLite local
      const anchorPoints = await this.fetchActiveAnchorPoints();
      if (!anchorPoints || anchorPoints.length === 0) {
        return false;
      }

      // 3. Tenta obter a permissão de segundo plano (Background Location - "Permitir o tempo todo")
      let isBackgroundAuthorized = false;
      try {
        let bgPermission = await Location.getBackgroundPermissionsAsync();
        if (!bgPermission.granted && bgPermission.canAskAgain) {
          bgPermission = await Location.requestBackgroundPermissionsAsync();
        }
        isBackgroundAuthorized = bgPermission.granted;

        // Se ainda não estiver autorizado e ainda não exibimos a mensagem de aviso nesta sessão
        if (!isBackgroundAuthorized && !this.hasPromptedBgPermission) {
          this.hasPromptedBgPermission = true;
          this.promptUserForBackgroundPermission();
        }
      } catch {
        isBackgroundAuthorized = false;
      }

      // 4. Se tiver permissão de Segundo Plano, ativa o Geofencing Nativo no SO (funciona com App Fechado)
      if (isBackgroundAuthorized) {
        const regions: Location.LocationRegion[] = anchorPoints
          .filter((ap) => ap.lat !== 0 && ap.lng !== 0 && !isNaN(ap.lat) && !isNaN(ap.lng))
          .map((ap) => ({
            identifier: String(ap.id),
            latitude: Number(ap.lat),
            longitude: Number(ap.lng),
            radius: radiusMeters,
            notifyOnEnter: true,
            notifyOnExit: false,
          }));

        if (regions.length > 0) {
          const targetRegions = regions.slice(0, 100);
          try {
            const isAlreadyStarted = await Location.hasStartedGeofencingAsync(GEOFENCE_TASK_NAME);
            if (isAlreadyStarted) {
              await Location.stopGeofencingAsync(GEOFENCE_TASK_NAME);
            }
            await Location.startGeofencingAsync(GEOFENCE_TASK_NAME, targetRegions);
            this.isConfigured = true;
          } catch (geofenceErr) {
            console.warn("Aviso ao ativar Geofencing nativo no SO:", geofenceErr);
          }
        }
      } else {
        console.info(
          "ℹ️ Geofencing com app fechado exige permissão 'Permitir o tempo todo' (Build Nativa). Ativando rastreamento de proximidade com app aberto."
        );
      }

      // 5. Ativa também o monitor de primeiro plano (Foreground Proximity Watcher) como fallback universal
      this.startForegroundProximityWatcher(anchorPoints, radiusMeters).catch(() => {});

      return true;
    } catch (error) {
      console.warn("Aviso ao inicializar o serviço de proximidade:", error);
      return false;
    }
  }

  /**
   * Exibe diálogo explicativo e abre as Configurações do Celular para selecionar "Permitir o tempo todo"
   */
  private promptUserForBackgroundPermission() {
    Alert.alert(
      "📍 Notificação com App Fechado",
      "Para receber alertas quando estiver perto de um Ponto de Apoio mesmo com o aplicativo fechado, altere a permissão de localização para 'Permitir o tempo todo'.",
      [
        { text: "Agora Não", style: "cancel" },
        {
          text: "Abrir Configurações",
          onPress: () => {
            try {
              Linking.openSettings();
            } catch (e) {
              console.warn("Não foi possível abrir configurações:", e);
            }
          },
        },
      ]
    );
  }

  /**
   * Monitora a posição GPS em primeiro plano e calcula a distância até os pontos de apoio em tempo real
   */
  private async startForegroundProximityWatcher(
    anchorPoints: AnchorPointCoords[],
    radiusMeters: number
  ) {
    if (this.locationSubscription) {
      this.locationSubscription.remove();
      this.locationSubscription = null;
    }

    try {
      this.locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 10000, // a cada 10 segundos
          distanceInterval: 20, // a cada 20 metros de deslocamento
        },
        async (userLoc) => {
          if (!userLoc.coords) return;
          const { latitude, longitude } = userLoc.coords;
          const now = Date.now();

          for (const ap of anchorPoints) {
            if (ap.lat === 0 || ap.lng === 0) continue;

            const dist = calculateDistanceMeters(latitude, longitude, ap.lat, ap.lng);

            if (dist <= radiusMeters) {
              const lastNotified = lastForegroundNotified[ap.id] || 0;
              if (now - lastNotified > FOREGROUND_COOLDOWN_MS) {
                lastForegroundNotified[ap.id] = now;
                await notificationService.notify(
                  "📍 Ponto de Apoio Próximo!",
                  `Você está perto de "${ap.name}". Venha registrar sua passagem e carimbar seu passaporte!`,
                  "stamp",
                  {
                    screen: "/(tabs)/nativeMap",
                    anchor_point_id: ap.id,
                  }
                );
              }
            }
          }
        }
      );
    } catch (e) {
      console.warn("Não foi possível iniciar o monitor de localização em primeiro plano:", e);
    }
  }

  /**
   * Busca pontos de apoio com coordenadas válidas salvos no SQLite
   */
  private async fetchActiveAnchorPoints(): Promise<AnchorPointCoords[]> {
    try {
      return await runReadOnly(async () => {
        const db = await getDatabase();
        if (!db) return [];

        const rows = await db.getAllAsync<any>(
          `SELECT id, name, lat, lng FROM anchor_points WHERE active = 1 AND lat != 0 AND lng != 0;`
        );

        return rows.map((r) => ({
          id: String(r.id),
          name: String(r.name || ""),
          lat: Number(r.lat),
          lng: Number(r.lng),
        }));
      });
    } catch (e) {
      console.error("Erro ao buscar pontos de apoio para Geofencing:", e);
      return [];
    }
  }

  /**
   * Para o rastreamento de Geofencing e localização
   */
  async stopGeofencing(): Promise<void> {
    try {
      if (this.locationSubscription) {
        this.locationSubscription.remove();
        this.locationSubscription = null;
      }
      const isStarted = await Location.hasStartedGeofencingAsync(GEOFENCE_TASK_NAME);
      if (isStarted) {
        await Location.stopGeofencingAsync(GEOFENCE_TASK_NAME);
      }
      this.isConfigured = false;
    } catch (e) {
      console.warn("Erro ao parar Geofencing:", e);
    }
  }
}

export const proximityService = new ProximityService();
