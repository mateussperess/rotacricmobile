import { CityCard } from "@/components/CityCard";
import { useTotalDistance } from "@/hooks/use-total-distance";
import { AnchorPointsService } from "@/services/anchorpoints/anchorPointService";
import { CitiesService, City } from "@/services/cities/citiesService";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const CRIC_BLUE = "#2563EB";

// mock dos dados pra trocar pelos reais dps
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
  const [cities, setCities] = useState<CityWithMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const { data: distanceData } = useTotalDistance();
  const totalKm = distanceData ? Math.round(distanceData.totalKm) : "—";
  const totalCities = cities.length;

  useEffect(() => {
    const fetchCities = async () => {
      const data = await CitiesService.findAll();
      if (!data) {
        setLoading(false);
        return;
      }

      const withMeta = await Promise.all(
        data.map(async (city) => {
          const points = await AnchorPointsService.findAllByCity(city.id);
          return { ...city, anchorCount: points?.length ?? 0 };
        }),
      );

      setCities(withMeta);
      setLoading(false);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    };
    fetchCities();
  }, [fadeAnim]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <View style={styles.hero} />
        <ActivityIndicator
          size="large"
          color={CRIC_BLUE}
          style={{ flex: 1, marginTop: 40 }}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <Animated.View
        style={{ flex: 1, opacity: fadeAnim, backgroundColor: "#F3F4F6" }}
      >
        <FlatList
          data={cities}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <View>
              <View style={styles.hero}>
                <Text style={styles.brand}>ROTA CRIC</Text>
                <Text style={styles.heroTitle}>Cidades da Rota</Text>
                <Text style={styles.heroSub}>
                  Conheça cada município que compõe esta rota histórica pelo
                  carvão gaúcho.
                </Text>
                <View style={styles.statsRow}>
                  <View style={styles.statBox}>
                    <Text style={styles.statValue}>{totalCities}</Text>
                    <Text style={styles.statLabel}>Cidades</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statBox}>
                    <Text style={styles.statValue}>{totalKm} km</Text>
                    <Text style={styles.statLabel}>Extensão total</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statBox}>
                    <Text style={styles.statValue}>
                      {cities.reduce((acc, c) => acc + c.anchorCount, 0)}
                    </Text>
                    <Text style={styles.statLabel}>Pontos de apoio</Text>
                  </View>
                </View>
              </View>

              <Text style={styles.sectionLabel}>MUNICÍPIOS</Text>
            </View>
          }
          renderItem={({ item }) => (
            <CityCard
              item={item}
              meta={CITY_ORDER[item.name]}
              onPress={() => router.push(`/cidades/${item.id}`)}
            />
          )}
        />
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: CRIC_BLUE,
  },
  listContent: {
    paddingBottom: 40,
  },
  hero: {
    backgroundColor: CRIC_BLUE,
    paddingHorizontal: 24,
    paddingTop: 20,
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
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#9CA3AF",
    letterSpacing: 1.5,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
});
