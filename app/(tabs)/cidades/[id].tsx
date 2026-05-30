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

export default function CidadeDetalhe() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [city, setCity] = useState<City | null>(null);
  const [anchorPoints, setAnchorPoints] = useState<AnchorPoint[]>([]);
  const [loadingCity, setLoadingCity] = useState(true);
  const [loadingAnchor, setLoadingAnchor] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("sobre");
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

  const handleGoToMap = () => {
    if (!city) return;
    router.push({
      pathname: "/(tabs)/nativeMap",
      params: {
        lat: city.lat,
        lng: city.lng,
        zoom: city.zoom,
        t: Date.now(),
      },
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
          <>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Sobre a cidade</Text>
              <Text style={styles.cardText}>
                {city.about?.trim()
                  ? city.about
                  : "Informações sobre esta cidade em breve."}
              </Text>
            </View>
          </>
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
            {loadingAnchor ? (
              <ActivityIndicator color="#2563EB" style={{ marginTop: 32 }} />
            ) : anchorPoints.length === 0 ? (
              <View style={styles.card}>
                <Text style={styles.cardText}>
                  Nenhum ponto de apoio cadastrado para esta cidade.
                </Text>
              </View>
            ) : (
              <>
                {anchorPoints.map((ap) => (
                  <View key={ap.id} style={styles.anchorCard}>
                    <View style={styles.anchorIcon}>
                      <Text style={styles.anchorIconText}>📍</Text>
                    </View>
                    <View style={styles.anchorInfo}>
                      <Text style={styles.anchorName}>{ap.name}</Text>
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
                ))}
                <Text style={styles.anchorCount}>
                  {anchorPoints.length} ponto
                  {anchorPoints.length !== 1 ? "s" : ""} de apoio em {city.name}
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

  // Header
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

  // Tabs
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

  // Body
  body: { padding: 20, gap: 16, paddingBottom: 40 },

  // Card genérico
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
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  cardText: { fontSize: 15, color: "#374151", lineHeight: 22 },
  comingSoon: {
    fontSize: 13,
    color: "#9CA3AF",
    fontStyle: "italic",
    marginTop: 4,
  },

  // Stats (trecho)
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 8,
  },
  statItem: { alignItems: "center", gap: 4 },
  statIcon: { fontSize: 20 },
  statValue: { fontSize: 16, fontWeight: "700", color: "#111827" },
  statLabel: { fontSize: 11, color: "#9CA3AF" },

  // Botão mapa
  mapBtn: {
    backgroundColor: "#2563EB",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  mapBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },

  // Anchor points
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
  anchorIconText: { fontSize: 18 },
  anchorInfo: { flex: 1, gap: 4 },
  anchorName: { fontSize: 15, fontWeight: "700", color: "#111827" },
  anchorDetail: { fontSize: 13, color: "#6B7280" },
  anchorCount: {
    textAlign: "center",
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 4,
  },
});
