import BeverageStorage from "@/assets/images/anchorpoint_categories_logos/beverage_storage.svg";
import Food from "@/assets/images/anchorpoint_categories_logos/food.svg";
import GasStation from "@/assets/images/anchorpoint_categories_logos/gas_station.svg";
import Hospital from "@/assets/images/anchorpoint_categories_logos/hospital.svg";
import Hotel from "@/assets/images/anchorpoint_categories_logos/hotel.svg";
import Pharmacy from "@/assets/images/anchorpoint_categories_logos/pharmacy.svg";
import Repair from "@/assets/images/anchorpoint_categories_logos/repair.svg";
import Store from "@/assets/images/anchorpoint_categories_logos/store.svg";
import Tourism from "@/assets/images/anchorpoint_categories_logos/tourism.svg";

import {
  AnchorPoint,
  AnchorPointsService,
} from "@/services/anchorpoints/anchorPointService";
import { CitiesService, City } from "@/services/cities/citiesService";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Tab = "sobre" | "trecho" | "apoio";
type ApoioFilter = "all" | "on_route" | "off_route";

export default function CidadeDetalhe() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [city, setCity] = useState<City | null>(null);
  const [anchorPoints, setAnchorPoints] = useState<AnchorPoint[]>([]);
  const [loadingCity, setLoadingCity] = useState(true);
  const [loadingAnchor, setLoadingAnchor] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("sobre");
  const [apoioFilter, setApoioFilter] = useState<ApoioFilter>("all");
  const router = useRouter();

  useEffect(() => {
    CitiesService.findOne(id).then((data) => {
      if (data) setCity(data);
      setLoadingCity(false);
    });
  }, [id]);

  useEffect(() => {
    if (!id) return;
    setLoadingAnchor(true);
    AnchorPointsService.findAllByCity(id).then((data) => {
      setAnchorPoints(data ?? []);
      setLoadingAnchor(false);
    });
  }, [id]);

  const filteredPoints = anchorPoints.filter((ap) => {
    if (apoioFilter === "on_route") return ap.on_route === true;
    if (apoioFilter === "off_route") return ap.on_route === false;
    return true;
  });

  const handleGoToMap = () => {
    if (!city) return;
    router.push({
      pathname: "/(tabs)/nativeMap",
      params: { lat: city.lat, lng: city.lng, zoom: city.zoom, t: Date.now() },
    });
  };

  if (loadingCity) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#2563EB" style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  if (!city) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Text style={styles.errorText}>Cidade não encontrada.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const APOIO_FILTERS: { key: ApoioFilter; label: string; icon: string }[] = [
    { key: "all", label: "Todos", icon: "" },
    { key: "on_route", label: "Na rota", icon: "" },
    { key: "off_route", label: "Fora da rota", icon: "" },
  ];

  const ICON_MAP: Record<
    string,
    React.FC<{ width: number; height: number }>
  > = {
    beverage_storage: BeverageStorage,
    food: Food,
    gas_station: GasStation,
    hospital: Hospital,
    hotel: Hotel,
    pharmacy: Pharmacy,
    repair: Repair,
    store: Store,
    tourism: Tourism,
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
          <Text style={styles.backLabel}>Cidades</Text>
        </Pressable>

        <Text style={styles.cityName}>{city.name}</Text>
        <Text style={styles.cityCoords}>
          {city.lat.toFixed(4)}, {city.lng.toFixed(4)}
        </Text>

        {/* Tabs */}
        <View style={styles.tabs}>
          {(["sobre", "trecho", "apoio"] as Tab[]).map((tab) => (
            <Pressable
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab && styles.tabTextActive,
                ]}
              >
                {tab === "sobre"
                  ? "Sobre"
                  : tab === "trecho"
                    ? "Trecho"
                    : "Pontos de Apoio"}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* ── Conteúdo ── */}
      <ScrollView
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
      >
        {/* ── ABA: SOBRE ── */}
        {activeTab === "sobre" && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Sobre a cidade</Text>
            <Text style={styles.cardText}>
              {city.about?.trim()
                ? city.about
                : "Informações sobre esta cidade em breve."}
            </Text>
          </View>
        )}

        {/* ── ABA: TRECHO ── */}
        {activeTab === "trecho" && (
          <>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Resumo do trecho</Text>
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statIcon}>🚴</Text>
                  <Text style={styles.statValue}>—</Text>
                  <Text style={styles.statLabel}>Distância</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statIcon}>⏱</Text>
                  <Text style={styles.statValue}>—</Text>
                  <Text style={styles.statLabel}>Tempo est.</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statIcon}>↑</Text>
                  <Text style={styles.statValue}>—</Text>
                  <Text style={styles.statLabel}>Elevação</Text>
                </View>
              </View>
              <Text style={styles.comingSoon}>
                Dados do trecho disponíveis em breve.
              </Text>
            </View>
            <Pressable style={styles.mapBtn} onPress={handleGoToMap}>
              <Text style={styles.mapBtnText}>Ver no mapa</Text>
            </Pressable>
          </>
        )}

        {/* ── ABA: PONTOS DE APOIO ── */}
        {activeTab === "apoio" && (
          <>
            {/* Filtros */}
            <View style={styles.filterRow}>
              {APOIO_FILTERS.map((f) => (
                <Pressable
                  key={f.key}
                  style={[
                    styles.filterChip,
                    apoioFilter === f.key && styles.filterChipActive,
                  ]}
                  onPress={() => setApoioFilter(f.key)}
                >
                  <Text style={styles.filterChipIcon}>{f.icon}</Text>
                  <Text
                    style={[
                      styles.filterChipText,
                      apoioFilter === f.key && styles.filterChipTextActive,
                    ]}
                  >
                    {f.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Lista */}
            {loadingAnchor ? (
              <ActivityIndicator color="#2563EB" style={{ marginTop: 32 }} />
            ) : filteredPoints.length === 0 ? (
              <View style={styles.card}>
                <Text style={styles.cardText}>
                  {anchorPoints.length === 0
                    ? "Nenhum ponto de apoio cadastrado para esta cidade."
                    : "Nenhum ponto de apoio encontrado com este filtro."}
                </Text>
              </View>
            ) : (
              <>
                {filteredPoints.map((ap) => {
                  const IconComponent = ap.category?.icon_name
                    ? ICON_MAP[ap.category.icon_name]
                    : null;

                  return (
                    <View key={ap.id} style={styles.anchorCard}>
                      <View
                        style={[
                          styles.anchorIcon,
                          ap.on_route && styles.anchorIconOnRoute,
                        ]}
                      >
                        {IconComponent ? (
                          <IconComponent width={22} height={22} />
                        ) : (
                          <Text style={styles.anchorIconText}>📍</Text>
                        )}
                      </View>
                      <View style={styles.anchorInfo}>
                        <View style={styles.anchorNameRow}>
                          <Text style={styles.anchorName}>{ap.name}</Text>
                          {ap.on_route && (
                            <View style={styles.onRouteBadge}>
                              <Text style={styles.onRouteBadgeText}>
                                Na rota
                              </Text>
                            </View>
                          )}
                        </View>
                        {ap.business_hours && (
                          <Text style={styles.anchorDetail}>
                            🕐 {ap.business_hours}
                          </Text>
                        )}
                        {ap.phone && (
                          <Text style={styles.anchorDetail}>📞 {ap.phone}</Text>
                        )}
                      </View>
                    </View>
                  );
                })}
                <Text style={styles.anchorCount}>
                  {filteredPoints.length} ponto
                  {filteredPoints.length !== 1 ? "s" : ""} em {city.name}
                </Text>
              </>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F8FC" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorText: { fontSize: 16, color: "#6B7280" },

  header: {
    backgroundColor: "#2563EB",
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 0,
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 16,
  },
  backArrow: { fontSize: 24, color: "rgba(255,255,255,0.7)", lineHeight: 24 },
  backLabel: {
    fontSize: 14,
    color: "rgba(255,255,255,0.7)",
    fontWeight: "500",
  },
  cityName: {
    fontSize: 32,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  cityCoords: {
    fontSize: 12,
    color: "rgba(255,255,255,0.5)",
    marginBottom: 20,
  },

  tabs: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.1)",
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabActive: { borderBottomColor: "#fff" },
  tabText: { fontSize: 13, color: "rgba(255,255,255,0.5)", fontWeight: "500" },
  tabTextActive: { color: "#fff", fontWeight: "700" },

  body: { padding: 20, gap: 16, paddingBottom: 40 },

  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 1,
    gap: 8,
  },
  cardTitle: { fontSize: 16, fontWeight: "700", color: "#111827" },
  cardText: { fontSize: 15, color: "#374151", lineHeight: 22 },
  comingSoon: {
    fontSize: 13,
    color: "#9CA3AF",
    fontStyle: "italic",
    marginTop: 4,
  },

  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 8,
  },
  statItem: { alignItems: "center", gap: 4 },
  statIcon: { fontSize: 20 },
  statValue: { fontSize: 16, fontWeight: "700", color: "#111827" },
  statLabel: { fontSize: 11, color: "#9CA3AF" },

  mapBtn: {
    backgroundColor: "#2563EB",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  mapBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },

  // Filtros
  filterRow: {
    flexDirection: "row",
    gap: 8,
  },
  filterChip: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingVertical: 9,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: "#fff",
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
  },
  filterChipActive: {
    backgroundColor: "#EEF2FF",
    borderColor: "#2563EB",
  },
  filterChipIcon: { fontSize: 13 },
  filterChipText: { fontSize: 12, fontWeight: "600", color: "#6B7280" },
  filterChipTextActive: { color: "#2563EB" },

  // Anchor cards
  anchorCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 1,
  },
  anchorIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#EEF2FF",
    alignItems: "center",
    justifyContent: "center",
  },
  anchorIconOnRoute: {
    backgroundColor: "#dce9fc",
  },
  anchorIconText: { fontSize: 18 },
  anchorInfo: { flex: 1, gap: 4 },
  anchorNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  anchorName: { fontSize: 15, fontWeight: "700", color: "#111827" },
  onRouteBadge: {
    backgroundColor: "#dce9fc",
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  onRouteBadgeText: { fontSize: 11, fontWeight: "700", color: "#2563EB" },
  anchorDetail: { fontSize: 13, color: "#6B7280" },
  anchorCount: {
    textAlign: "center",
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 4,
  },
});
