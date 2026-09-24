import { useAuth } from "@/components/contexts/AuthContext";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { AnchorPointsService } from "@/services/anchorpoints/anchorPointService";
import { CitiesService } from "@/services/cities/citiesService";
import { Stamp, StampService } from "@/services/stamps/stampService";
import * as Location from "expo-location";
import { router, useFocusEffect } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Pressable,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const CRIC_BLUE = "#2563EB";

function haversineMeters(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatDistance(meters?: number | null): string | null {
  if (meters === undefined || meters === null || isNaN(meters)) return null;
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
}

function formatScannedDate(dateVal?: any): string {
  if (!dateVal) return "Coletado";
  let target = dateVal;
  if (typeof dateVal === "object" && !(dateVal instanceof Date)) {
    if (dateVal.toISOString && typeof dateVal.toISOString === "function") {
      target = dateVal.toISOString();
    } else {
      return "Coletado";
    }
  }
  try {
    const d = new Date(target);
    if (isNaN(d.getTime())) return "Coletado";
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    return `${day}/${month}/${year} às ${hours}:${minutes}`;
  } catch {
    return "Coletado";
  }
}

function resolveCityName(
  ap: any,
  citiesList: any[],
  cityMap: Map<string, string>
): string {
  if (!ap) return "Rota CRIC";
  const explicitCityId = (ap.city_id || ap.city?.id)?.toString();
  if (explicitCityId && cityMap.has(explicitCityId)) {
    return cityMap.get(explicitCityId)!;
  }
  if (ap.city?.name) {
    return ap.city.name;
  }
  const apLat = Number(ap.lat ?? ap.latitude);
  const apLng = Number(ap.lng ?? ap.longitude);
  if (
    !isNaN(apLat) &&
    !isNaN(apLng) &&
    apLat !== 0 &&
    apLng !== 0 &&
    citiesList &&
    citiesList.length > 0
  ) {
    let minDistance = Infinity;
    let closestCityName = "Rota CRIC";
    for (const city of citiesList) {
      const cLat = Number(city.lat ?? city.latitude);
      const cLng = Number(city.lng ?? city.longitude);
      if (!isNaN(cLat) && !isNaN(cLng) && cLat !== 0 && cLng !== 0) {
        const dist = haversineMeters(apLat, apLng, cLat, cLng);
        if (dist < minDistance) {
          minDistance = dist;
          closestCityName = city.name;
        }
      }
    }
    return closestCityName;
  }
  return "Rota CRIC";
}

function StampCard({ stamp }: { stamp: any }) {
  const { primaryColor } = useAuth();
  const handleOpenOnMap = () => {
    if (stamp.apLat !== null && stamp.apLng !== null) {
      router.push({
        pathname: "/(tabs)/nativeMap",
        params: {
          apId: stamp.anchorPointId,
          apName: stamp.name,
          lat: stamp.apLat.toString(),
          lng: stamp.apLng.toString(),
          t: Date.now().toString(),
        },
      });
    }
  };

  return (
    <View style={[styles.card, !stamp.collected && styles.cardLocked]}>
      <View style={styles.cardHeaderRow}>
        <View
          style={[
            styles.stampIconContainer,
            { backgroundColor: stamp.collected ? primaryColor : "#F1F5F9" },
          ]}
        >
          {stamp.collected ? (
            <IconSymbol name="star.fill" size={24} color="#FFFFFF" />
          ) : (
            <IconSymbol name="lock.fill" size={22} color="#94A3B8" />
          )}
          {stamp.collected && (
            <View style={[styles.checkBadge, { backgroundColor: primaryColor }]}>
              <IconSymbol
                name="checkmark.circle.fill"
                size={12}
                color="white"
              />
            </View>
          )}
        </View>

        <View style={styles.cardContent}>
          <Text
            style={[
              styles.stampName,
              !stamp.collected && styles.textLockedTitle,
            ]}
          >
            {stamp.name}
          </Text>

          <View style={styles.row}>
            <IconSymbol name="mappin.and.ellipse" size={12} color="#64748B" />
            <Text style={styles.localText}>{stamp.local}</Text>
          </View>

          {/* Badge de Distância GPS visível em TODOS os carimbos */}
          {stamp.distText ? (
            <View style={[styles.distBadge, { borderColor: primaryColor + "30", backgroundColor: primaryColor + "10" }]}>
              <IconSymbol name="mappin.circle.fill" size={11} color={primaryColor} />
              <Text style={[styles.distBadgeText, { color: primaryColor }]}>
                A {stamp.distText} de você
              </Text>
            </View>
          ) : null}

          {stamp.collected ? (
            <View style={styles.row}>
              <IconSymbol name="clock.fill" size={10} color={primaryColor} />
              <Text style={[styles.dateText, { color: primaryColor }]}>{stamp.collectedAt}</Text>
            </View>
          ) : (
            <Text style={styles.lockedLabel}>Bloqueado — Não coletado</Text>
          )}
        </View>

        {stamp.collected ? (
          <IconSymbol name="award.fill" size={22} color={primaryColor} />
        ) : (
          <IconSymbol name="lock.fill" size={18} color="#94A3B8" />
        )}
      </View>

      {/* Botão Ver no Mapa ativo e clicável em TODOS os carimbos */}
      {stamp.apLat !== null && stamp.apLng !== null && (
        <View style={styles.cardFooterAction}>
          <Pressable style={[styles.btnViewOnMap, { borderColor: primaryColor + "40", backgroundColor: primaryColor + "10" }]} onPress={handleOpenOnMap}>
            <IconSymbol name="map.fill" size={14} color={primaryColor} />
            <Text style={[styles.btnViewOnMapText, { color: primaryColor }]}>
              {stamp.collected
                ? "Ver Ponto no Mapa"
                : "Localizar Ponto no Mapa"}
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

export default function CarimbosScreen() {
  const { isLoggedIn, primaryColor, isAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [displayStamps, setDisplayStamps] = useState<any[]>([]);
  const [stats, setStats] = useState({ collected: 0, total: 0, progress: 0 });

  const loadStamps = async () => {
    try {
      setLoading(true);

      // Tentar obter a localização GPS atual em segundo plano
      let userLocation: Location.LocationObject | null = null;
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === "granted") {
          userLocation = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
        }
      } catch (e) {
        console.log("GPS não disponível para cálculo de distância:", e);
      }

      const [anchorPointsData, stampsData, userStampsData, citiesData] =
        await Promise.all([
          AnchorPointsService.findAll().catch(() => []),
          StampService.findAll().catch(() => []),
          StampService.getUserStamps().catch(() => []),
          CitiesService.findAll().catch(() => []),
        ]);

      const cityMap = new Map<string, string>();
      (citiesData || []).forEach((c) => cityMap.set(c.id.toString(), c.name));

      const apMap = new Map<string, any>();
      (anchorPointsData || []).forEach((ap: any) => {
        apMap.set(ap.id.toString(), ap);
      });

      // Mapear carimbos coletados pelo usuário separando ID do carimbo e ID do ponto de apoio
      const collectedByStampId = new Map<string, any>();
      const collectedByApId = new Map<string, any>();
      (userStampsData || []).forEach((us: any) => {
        const sId = (us.stamp_id || us.stamp?.id)?.toString();
        const apId = (us.anchor_point_id || us.stamp?.anchor_point_id)?.toString();
        if (sId) collectedByStampId.set(sId, us);
        if (apId) collectedByApId.set(apId, us);
      });

      // Mapear catálogo de carimbos ativos vinculados a pontos de apoio válidos
      const stampsListMap = new Map<string, any>();
      (stampsData || []).forEach((s: Stamp) => {
        const apId = s.anchor_point_id ? s.anchor_point_id.toString() : null;
        const ap = apId ? apMap.get(apId) : null;
        // Excluir carimbos inativos ou órfãos (cujo ponto de apoio foi removido ou não existe)
        const hasValidAnchorPoint = !apId || Boolean(ap);

        if (s.active !== false && s.id && hasValidAnchorPoint) {
          stampsListMap.set(s.id.toString(), s);
        }
      });

      // Incluir na lista visual apenas carimbos que o usuário realmente coletou off-line/localmente
      (userStampsData || []).forEach((us: any) => {
        const sId = (us.stamp_id || us.stamp?.id || us.id)?.toString();
        const apId = (us.anchor_point_id || us.stamp?.anchor_point_id)?.toString();
        const ap = apId ? apMap.get(apId) : null;

        // Se o carimbo estava vinculado a um ponto de apoio que foi excluído, ignorar
        if (apId && !ap) return;

        if (sId && !stampsListMap.has(sId)) {
          stampsListMap.set(sId, {
            id: sId,
            anchor_point_id: apId,
            name: us.stamp?.name || us.name || "Carimbo Coletado",
            active: true,
          });
        }
      });

      let items: any[] = [];
      const validStampsList = Array.from(stampsListMap.values());

      if (validStampsList.length > 0) {
        items = validStampsList.map((stamp: any) => {
          const stampIdStr = stamp.id.toString();
          const apIdStr = stamp.anchor_point_id ? stamp.anchor_point_id.toString() : null;

          const collectedEntry =
            collectedByStampId.get(stampIdStr) ||
            (apIdStr ? collectedByApId.get(apIdStr) : null);

          const isCollected = Boolean(collectedEntry);

          const ap = apIdStr ? apMap.get(apIdStr) : stamp.anchor_point;
          const apName = ap?.name || stamp.name || "Ponto de Apoio";
          const cityName = resolveCityName(ap, citiesData || [], cityMap);
          const localText = `${apName} • ${cityName}`;

          const rawLat = ap?.lat ?? ap?.latitude;
          const rawLng = ap?.lng ?? ap?.longitude;
          const apLat =
            rawLat !== undefined && rawLat !== null && !isNaN(Number(rawLat))
              ? Number(rawLat)
              : null;
          const apLng =
            rawLng !== undefined && rawLng !== null && !isNaN(Number(rawLng))
              ? Number(rawLng)
              : null;

          let distMeters: number | null = null;
          if (userLocation && apLat !== null && apLng !== null) {
            distMeters = haversineMeters(
              userLocation.coords.latitude,
              userLocation.coords.longitude,
              apLat,
              apLng,
            );
          }

          return {
            id: stampIdStr,
            anchorPointId: apIdStr,
            name: stamp.name || `Carimbo ${apName}`,
            local: localText,
            apLat,
            apLng,
            distText: formatDistance(distMeters),
            collected: isCollected,
            collectedAt: isCollected
              ? formatScannedDate(collectedEntry.scanned_at || collectedEntry.created_at)
              : null,
          };
        });
      }

      setDisplayStamps(items);

      const collectedCount = items.filter((i) => i.collected).length;
      const totalCount = items.length;
      const progressPercent =
        totalCount > 0 ? (collectedCount / totalCount) * 100 : 0;

      setStats({
        collected: collectedCount,
        total: totalCount,
        progress: progressPercent,
      });
    } catch (err) {
      console.error("Erro ao carregar carimbos dinâmicos:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadStamps();
    }, [isLoggedIn])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadStamps();
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: primaryColor }]} edges={["top"]}>
      <View style={styles.container}>
        <View style={[styles.headerBlue, { backgroundColor: primaryColor }]}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <Text style={styles.brand}>ROTA CRIC</Text>
            {isAdmin && (
              <View style={styles.adminPill}>
                <Text style={styles.adminPillText}>MODO ADMIN</Text>
              </View>
            )}
          </View>
          <Text style={styles.heroTitle}>Meus Carimbos</Text>
          <Text style={styles.heroSub}>
            Colete carimbos nos pontos da rota, ganhe seu certificado oficial e
            descontos especiais nos pontos de apoio parceiros.
          </Text>
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{stats.collected}</Text>
              <Text style={styles.statLabel}>Coletados</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statValue}>
                {stats.total - stats.collected}
              </Text>
              <Text style={styles.statLabel}>Restantes</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statValue}>
                {Math.round(stats.progress)}%
              </Text>
              <Text style={styles.statLabel}>Progresso</Text>
            </View>
          </View>
          <View style={styles.progressBarBg}>
            <View
              style={[styles.progressBarFill, { width: `${stats.progress}%` }]}
            />
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[primaryColor]}
            />
          }
        >
          {!isLoggedIn && (
            <View style={styles.guestBanner}>
              <View style={styles.guestBannerHeader}>
                <IconSymbol name="lock.fill" size={20} color="#2563EB" />
                <Text style={styles.guestBannerTitle}>Modo Visitante</Text>
              </View>
              <Text style={styles.guestBannerText}>
                Você está visualizando todos os pontos de carimbo da Rota CRIC.
                Faça login na sua conta para registrá-los e acompanhar suas
                conquistas.
              </Text>
              <TouchableOpacity
                style={styles.guestBannerButton}
                onPress={() => router.push("/profile")}
              >
                <Text style={styles.guestBannerButtonText}>Fazer Login</Text>
              </TouchableOpacity>
            </View>
          )}

          <Text style={styles.sectionLabel}>
            PONTOS DA ROTA ({stats.collected}/{stats.total})
          </Text>

          {loading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color={CRIC_BLUE} />
              <Text style={styles.loadingText}>
                Calculando distâncias e carregando carimbos...
              </Text>
            </View>
          ) : displayStamps.length === 0 ? (
            <View style={styles.emptyCard}>
              <IconSymbol name="star.fill" size={36} color="#94A3B8" />
              <Text style={styles.emptyTitle}>Nenhum carimbo cadastrado</Text>
              <Text style={styles.emptySub}>
                Os administradores do RotaCRIC em breve cadastrarão carimbos
                digitais nos pontos de apoio da rota.
              </Text>
            </View>
          ) : (
            displayStamps.map((stamp) => (
              <StampCard key={stamp.id} stamp={stamp} />
            ))
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: CRIC_BLUE,
  },
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  headerBlue: {
    backgroundColor: CRIC_BLUE,
    paddingHorizontal: 24,
    paddingTop: 36,
    paddingBottom: 32,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  brand: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 2.5,
    color: "rgba(255,255,255,0.45)",
    marginBottom: 6,
  },
  heroTitle: {
    fontSize: 30,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  heroSub: {
    fontSize: 13,
    color: "rgba(255,255,255,0.65)",
    lineHeight: 19,
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 14,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    marginBottom: 16,
  },
  statBox: { flex: 1, alignItems: "center", gap: 4 },
  statDivider: { width: 1, backgroundColor: "rgba(255,255,255,0.15)" },
  statValue: { fontSize: 18, fontWeight: "800", color: "#fff" },
  statLabel: {
    fontSize: 10,
    color: "rgba(255,255,255,0.5)",
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#fff",
    borderRadius: 3,
  },
  content: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 48,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#94A3B8",
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  cardLocked: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E2E8F0",
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  stampIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  checkBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: CRIC_BLUE,
    borderRadius: 10,
    width: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  cardContent: { flex: 1, marginLeft: 12 },
  stampName: { fontSize: 14, fontWeight: "700", color: "#0F172A" },
  textLockedTitle: { color: "#334155", fontWeight: "700" },
  row: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 3 },
  localText: { fontSize: 12, color: "#64748B" },
  distBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#EFF6FF",
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginTop: 4,
    borderWidth: 1,
    borderColor: "#DBEAFE",
  },
  distBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#2563EB",
  },
  dateText: { fontSize: 11, color: CRIC_BLUE, fontWeight: "600" },
  lockedLabel: {
    fontSize: 11,
    color: "#64748B",
    fontStyle: "italic",
    marginTop: 4,
  },

  cardFooterAction: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  btnViewOnMap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  btnViewOnMapText: {
    color: "#2563EB",
    fontSize: 12,
    fontWeight: "700",
  },

  guestBanner: {
    backgroundColor: "#EFF6FF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#DBEAFE",
  },
  guestBannerHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  guestBannerTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1E40AF",
  },
  guestBannerText: {
    fontSize: 12,
    color: "#3B82F6",
    lineHeight: 18,
    marginBottom: 12,
  },
  guestBannerButton: {
    backgroundColor: CRIC_BLUE,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignSelf: "flex-start",
  },
  guestBannerButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },

  loginContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 28,
  },
  lockCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  loginTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1F2937",
    letterSpacing: -0.3,
  },
  loginSub: {
    textAlign: "center",
    color: "#6B7280",
    marginTop: 8,
    lineHeight: 20,
    fontSize: 13,
  },
  gamificationCard: {
    width: "100%",
    backgroundColor: "#EFF6FF",
    borderRadius: 16,
    padding: 16,
    marginVertical: 24,
    borderWidth: 1,
    borderColor: "#DBEAFE",
  },
  gamificationTitle: { fontSize: 14, fontWeight: "700", color: "#1E40AF" },
  gamificationText: {
    fontSize: 12,
    color: "#1E40AF",
    marginTop: 4,
    lineHeight: 18,
  },
  miniIcon: {
    width: 36,
    height: 36,
    backgroundColor: "#fff",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#DBEAFE",
  },
  primaryButton: {
    width: "100%",
    backgroundColor: CRIC_BLUE,
    paddingVertical: 15,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: CRIC_BLUE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  primaryButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },

  loadingBox: {
    padding: 40,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    color: "#64748B",
    fontSize: 13,
  },
  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginTop: 10,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E293B",
    marginTop: 10,
  },
  emptySub: {
    fontSize: 13,
    color: "#64748B",
    textAlign: "center",
    marginTop: 4,
    lineHeight: 18,
  },
  adminPill: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  adminPillText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
});
