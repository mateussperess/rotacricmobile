import { CityCard } from "@/components/CityCard";
import { useAuth } from "@/components/contexts/AuthContext";
import { useTotalDistance } from "@/hooks/use-total-distance";
import { AnchorPointsService } from "@/services/anchorpoints/anchorPointService";
import { CitiesService, City } from "@/services/cities/citiesService";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const CRIC_BLUE = "#2563EB";

const CITY_ORDER: Record<
  string,
  {
    order: number;
    kmStart: number;
    kmEnd: number;
    subtitle: string;
    distance: string;
    elevation: string;
  }
> = {
  Charqueadas: {
    order: 0,
    kmStart: 0,
    kmEnd: 18,
    subtitle: "Ponto de Partida",
    distance: "18 km",
    elevation: "+80m",
  },
  Butiá: {
    order: 1,
    kmStart: 18,
    kmEnd: 32,
    subtitle: "Patrimônio do Carvão",
    distance: "14 km",
    elevation: "+120m",
  },
  "Arroio dos Ratos": {
    order: 2,
    kmStart: 32,
    kmEnd: 42,
    subtitle: "Trecho do Vale",
    distance: "10 km",
    elevation: "+60m",
  },
  "São Jerônimo": {
    order: 3,
    kmStart: 42,
    kmEnd: 58,
    subtitle: "Centro Histórico",
    distance: "16 km",
    elevation: "+90m",
  },
  "General Câmara": {
    order: 4,
    kmStart: 58,
    kmEnd: 75,
    subtitle: "Beira do Rio",
    distance: "17 km",
    elevation: "+50m",
  },
  Triunfo: {
    order: 5,
    kmStart: 75,
    kmEnd: 95,
    subtitle: "Vale do Rio dos Sinos",
    distance: "20 km",
    elevation: "+110m",
  },
  "Barão do Triunfo": {
    order: 6,
    kmStart: 95,
    kmEnd: 140,
    subtitle: "Serra Gaúcha",
    distance: "45 km",
    elevation: "+280m",
  },
  "Minas do Leão": {
    order: 7,
    kmStart: 140,
    kmEnd: 160,
    subtitle: "Legado Mineiro",
    distance: "20 km",
    elevation: "+70m",
  },
  "Vale Verde": {
    order: 8,
    kmStart: 160,
    kmEnd: 180,
    subtitle: "Chegada",
    distance: "20 km",
    elevation: "+40m",
  },
};

type CityWithMeta = City & { anchorCount: number };

export default function Cidades() {
  const { primaryColor } = useAuth();
  const [cities, setCities] = useState<CityWithMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const { data: distanceData } = useTotalDistance();
  const totalKm = distanceData ? Math.round(distanceData.totalKm) : "180";
  const totalCities = cities.length;
  const totalAnchors = cities.reduce((acc, c) => acc + c.anchorCount, 0);

  const fetchCities = useCallback(async () => {
    try {
      const [data, allPoints] = await Promise.all([
        CitiesService.findAll(),
        AnchorPointsService.findAll().catch(() => []),
      ]);

      if (!data) {
        setLoading(false);
        setRefreshing(false);
        return;
      }

      const points = allPoints || [];
      const withMeta = data.map((city) => {
        const count = points.filter(
          (ap) =>
            (ap.city_id || (ap as any).city?.id)?.toString() ===
            city.id.toString(),
        ).length;
        return { ...city, anchorCount: count };
      });

      setCities(withMeta);
    } catch (e) {
      console.warn("Erro ao buscar cidades:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchCities();
  }, [fetchCities]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchCities();
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: primaryColor }]}
      edges={["top"]}
    >
      <View style={styles.mainContainer}>
        <FlatList
          data={cities}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[primaryColor]}
              tintColor="#ffffff"
            />
          }
          ListHeaderComponent={
            <View>
              {/* Header Hero */}
              <View style={[styles.hero, { backgroundColor: primaryColor }]}>
                <View style={styles.brandBadge}>
                  <Feather name="compass" size={12} color="#FFFFFF" />
                  <Text style={styles.brandText}>ROTA CRIC</Text>
                </View>

                <Text style={styles.heroTitle}>Cidades da Rota</Text>
                <Text style={styles.heroSub}>
                  Conheça cada município que compõe esta rota histórica pelo
                  carvão gaúcho.
                </Text>

                {/* Container de Estatísticas */}
                <View style={styles.statsRow}>
                  <View style={styles.statBox}>
                    <View style={styles.statIconWrapper}>
                      <Feather name="map" size={14} color="#FFFFFF" />
                    </View>
                    <Text style={styles.statValue}>
                      {loading ? "···" : totalCities}
                    </Text>
                    <Text style={styles.statLabel}>CIDADES</Text>
                  </View>

                  <View style={styles.statDivider} />

                  <View style={styles.statBox}>
                    <View style={styles.statIconWrapper}>
                      <Feather name="navigation" size={14} color="#FFFFFF" />
                    </View>
                    <Text style={styles.statValue}>{totalKm} km</Text>
                    <Text style={styles.statLabel}>EXTENSÃO TOTAL</Text>
                  </View>

                  <View style={styles.statDivider} />

                  <View style={styles.statBox}>
                    <View style={styles.statIconWrapper}>
                      <Feather name="map-pin" size={14} color="#FFFFFF" />
                    </View>
                    <Text style={styles.statValue}>
                      {loading ? "···" : totalAnchors}
                    </Text>
                    <Text style={styles.statLabel}>PONTOS DE APOIO</Text>
                  </View>
                </View>
              </View>

              {/* Rótulo da Seção */}
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionLabel}>MUNICÍPIOS DA ROTA</Text>
                {cities.length > 0 && (
                  <View style={styles.countBadge}>
                    <Text style={styles.countBadgeText}>
                      {cities.length} CIDADES
                    </Text>
                  </View>
                )}
              </View>
            </View>
          }
          ListEmptyComponent={
            loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={primaryColor} />
                <Text style={styles.loadingText}>
                  Carregando cidades da rota...
                </Text>
              </View>
            ) : (
              <View style={styles.emptyContainer}>
                <Feather name="map-pin" size={32} color="#94A3B8" />
                <Text style={styles.emptyText}>Nenhuma cidade encontrada.</Text>
                <Text style={styles.emptySubtext}>
                  Puxe para baixo para tentar atualizar a lista.
                </Text>
              </View>
            )
          }
          renderItem={({ item }) => (
            <CityCard
              item={item}
              meta={CITY_ORDER[item.name]}
              onPress={() => router.push(`/cidades/${item.id}`)}
            />
          )}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: CRIC_BLUE,
  },
  mainContainer: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  listContent: {
    paddingBottom: 40,
  },
  hero: {
    backgroundColor: CRIC_BLUE,
    paddingHorizontal: 22,
    paddingTop: 28,
    paddingBottom: 32,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  brandBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    backgroundColor: "rgba(255, 255, 255, 0.16)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  brandText: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 2,
    color: "#FFFFFF",
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  heroSub: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.78)",
    lineHeight: 19,
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.18)",
  },
  statBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
  },
  statIconWrapper: {
    marginBottom: 2,
    opacity: 0.85,
  },
  statDivider: {
    width: 1,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    marginVertical: 4,
  },
  statValue: {
    fontSize: 17,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -0.3,
  },
  statLabel: {
    fontSize: 10,
    color: "rgba(255, 255, 255, 0.7)",
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 14,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: "#64748B",
    letterSpacing: 1.2,
  },
  countBadge: {
    backgroundColor: "#E2E8F0",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  countBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#475569",
    letterSpacing: 0.5,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 50,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "500",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 50,
    gap: 8,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#475569",
  },
  emptySubtext: {
    fontSize: 12,
    color: "#94A3B8",
  },
});
