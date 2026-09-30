import BeverageStorage from "@/assets/images/anchorpoint_categories_logos/beverage_storage.svg";
import Food from "@/assets/images/anchorpoint_categories_logos/food.svg";
import GasStation from "@/assets/images/anchorpoint_categories_logos/gas_station.svg";
import Hospital from "@/assets/images/anchorpoint_categories_logos/hospital.svg";
import Hotel from "@/assets/images/anchorpoint_categories_logos/hotel.svg";
import Pharmacy from "@/assets/images/anchorpoint_categories_logos/pharmacy.svg";
import Repair from "@/assets/images/anchorpoint_categories_logos/repair.svg";
import Store from "@/assets/images/anchorpoint_categories_logos/store.svg";
import Tourism from "@/assets/images/anchorpoint_categories_logos/tourism.svg";
import { CityImageCarousel } from "@/components/CityImageCarousel";
import { NetworkStatusBanner, useNetworkStatus } from "@/components/NetworkStatusBanner";
import { WeatherCard } from "@/components/WeatherCard";
import { useAuth } from "@/components/contexts/AuthContext";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useCityImages } from "@/hooks/use-city-images";
import { useCityRouteDistance } from "@/hooks/use-city-route-distance";

import {
    AnchorPoint,
    AnchorPointsService,
} from "@/services/anchorpoints/anchorPointService";
import { CitiesService, City } from "@/services/cities/citiesService";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Animated,
    LayoutAnimation,
    NativeScrollEvent,
    NativeSyntheticEvent,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    useWindowDimensions,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const CRIC_BLUE = "#2563EB";

type Tab = "sobre" | "trecho" | "apoio";
type ApoioFilter = "all" | "on_route" | "off_route";
const TABS: Tab[] = ["sobre", "trecho", "apoio"];

const TABS_CONFIG: {
  key: Tab;
  label: string;
  icon: "building.2.fill" | "bicycle" | "mappin.and.ellipse";
}[] = [
  { key: "sobre", label: "Sobre", icon: "building.2.fill" },
  { key: "trecho", label: "Trecho", icon: "bicycle" },
  { key: "apoio", label: "Pontos de Apoio", icon: "mappin.and.ellipse" },
];

export default function CidadeDetalhe() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user, primaryColor } = useAuth();
  const isAdmin = Boolean(user?.is_staff || user?.is_superuser);
  const { width: windowWidth } = useWindowDimensions();
  const tabWidth = Math.max((windowWidth - 48) / 3, 80);
  const pagerRef = useRef<ScrollView>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const [city, setCity] = useState<City | null>(null);
  const [anchorPoints, setAnchorPoints] = useState<AnchorPoint[]>([]);
  const [loadingCity, setLoadingCity] = useState(true);
  const [loadingAnchor, setLoadingAnchor] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("sobre");
  const [apoioFilter, setApoioFilter] = useState<ApoioFilter>("all");
  const router = useRouter();
  const { isOffline } = useNetworkStatus();
  const { data: routeDistance, loading: loadingDistance } =
    useCityRouteDistance(id);
  const { images: cityImages, loading: loadingImages } = useCityImages(id);

  const indicatorTranslateX = scrollX.interpolate({
    inputRange: [0, windowWidth, windowWidth * 2],
    outputRange: [0, tabWidth, tabWidth * 2],
    extrapolate: "clamp",
  });

  const handleTabPress = (tabIndex: number) => {
    const tab = TABS[tabIndex];
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setActiveTab(tab);
    if (pagerRef.current) {
      pagerRef.current.scrollTo({ x: tabIndex * windowWidth, animated: true });
    }
  };

  const handleMomentumScrollEnd = (
    e: NativeSyntheticEvent<NativeScrollEvent>,
  ) => {
    const offsetX = e.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / windowWidth);
    const tab = TABS[index];
    if (tab && tab !== activeTab) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setActiveTab(tab);
    }
  };

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
    const targetLat = city.lat ?? (city as any).latitude ?? -28.6775;
    const targetLng = city.lng ?? (city as any).longitude ?? -49.3703;
    const targetZoom = city.zoom || 12;
    router.push({
      pathname: "/(tabs)/nativeMap",
      params: {
        lat: String(targetLat),
        lng: String(targetLng),
        zoom: String(targetZoom),
        t: String(Date.now()),
      },
    });
  };

  if (loadingCity) {
    return (
      <SafeAreaView
        style={[styles.safeArea, { backgroundColor: primaryColor }]}
        edges={["top"]}
      >
        <View style={styles.container}>
          <ActivityIndicator
            size="large"
            color={primaryColor}
            style={{ flex: 1 }}
          />
        </View>
      </SafeAreaView>
    );
  }

  if (!city) {
    return (
      <SafeAreaView
        style={[styles.safeArea, { backgroundColor: primaryColor }]}
        edges={["top"]}
      >
        <View style={styles.container}>
          <View style={styles.centered}>
            <Text style={styles.errorText}>Cidade não encontrada.</Text>
          </View>
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
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: primaryColor }]}
      edges={["top"]}
    >
      <View style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
        >
          {/* ── Header Rolante da Cidade ── */}
          <View style={[styles.header, { backgroundColor: primaryColor }]}>
            {/* Barra Superior: Botão Voltar Estilizado + Tag Rota */}
            <View style={styles.headerTopBar}>
              <Pressable
                onPress={() => router.back()}
                style={styles.backBtn}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <View style={styles.backIconCircle}>
                  <IconSymbol name="chevron.left" size={14} color="#FFFFFF" />
                </View>
                <Text style={styles.backLabel}>Cidades</Text>
              </Pressable>

              <View style={styles.routeTag}>
                <Text style={styles.routeTagText}>ROTA CRIC</Text>
              </View>
            </View>

            {/* Nome da Cidade */}
            <Text style={styles.cityName}>{city.name}</Text>

            {/* Linha de Badges Informativos (GPS, Pontos de Apoio, Distância) */}
            <View style={styles.metaRow}>
              <View style={styles.metaBadge}>
                <IconSymbol
                  name="mappin.circle.fill"
                  size={13}
                  color="rgba(255,255,255,0.85)"
                />
                <Text style={styles.metaBadgeText}>
                  {city.lat.toFixed(3)}°, {city.lng.toFixed(3)}°
                </Text>
              </View>

              <View style={styles.metaBadge}>
                <IconSymbol
                  name="mappin.and.ellipse"
                  size={12}
                  color="rgba(255,255,255,0.85)"
                />
                <Text style={styles.metaBadgeText}>
                  {anchorPoints.length} ponto
                  {anchorPoints.length !== 1 ? "s" : ""} de apoio
                </Text>
              </View>

              {routeDistance && routeDistance.totalDistanceKm > 0 && (
                <View style={styles.metaBadge}>
                  <IconSymbol
                    name="bicycle"
                    size={13}
                    color="rgba(255,255,255,0.85)"
                  />
                  <Text style={styles.metaBadgeText}>
                    {routeDistance.totalDistanceKm} km
                  </Text>
                </View>
              )}
            </View>

            {/* Tabs Card com Divisores e Indicador Animado */}
            <View style={styles.tabs}>
              {TABS_CONFIG.map((tab, index) => (
                <React.Fragment key={tab.key}>
                  {index > 0 && <View style={styles.tabDivider} />}
                  <Pressable
                    style={styles.tab}
                    onPress={() => handleTabPress(index)}
                  >
                    <IconSymbol
                      name={tab.icon}
                      size={20}
                      color={
                        activeTab === tab.key
                          ? "#FFFFFF"
                          : "rgba(255,255,255,0.55)"
                      }
                    />
                    <Text
                      style={[
                        styles.tabText,
                        activeTab === tab.key && styles.tabTextActive,
                      ]}
                    >
                      {tab.label}
                    </Text>
                  </Pressable>
                </React.Fragment>
              ))}
              <Animated.View
                style={[
                  styles.tabIndicatorContainer,
                  {
                    width: tabWidth,
                    transform: [{ translateX: indicatorTranslateX }],
                  },
                ]}
              >
                <View style={styles.tabIndicatorBar} />
              </Animated.View>
            </View>
          </View>

          {/* ── Conteúdo da Aba Ativa ── */}
          <View style={styles.body}>
            {/* ── ABA 0: SOBRE ── */}
            {activeTab === "sobre" && (
              <View style={styles.card}>
                <WeatherCard lat={city.lat} lng={city.lng} />

                {/* Carrossel de imagens (oculto em modo off-line) */}
                {(() => {
                  if (isOffline) return null;

                  const displayImages =
                    cityImages.length > 0
                      ? cityImages
                      : city?.banner_image
                        ? [
                            {
                              id: `banner-${city.id}`,
                              city_id: city.id,
                              url: city.banner_image,
                              caption: city.name,
                              order: 0,
                              created_at: new Date().toISOString(),
                            },
                          ]
                        : [];

                  if (loadingImages || displayImages.length === 0) return null;
                  return <CityImageCarousel images={displayImages} />;
                })()}

                <Text style={styles.cardTitle}>Sobre a cidade</Text>
                <Text style={styles.cardText}>
                  {city.about?.trim()
                    ? city.about
                    : "Informações sobre esta cidade em breve."}
                </Text>
              </View>
            )}

            {/* ── ABA 1: TRECHO ── */}
            {activeTab === "trecho" && (
              <>
                <View style={styles.card}>
                  <Text style={styles.cardTitle}>Rotas pela cidade</Text>

                  {loadingDistance ? (
                    <ActivityIndicator
                      color="#2563EB"
                      style={{ marginVertical: 8 }}
                    />
                  ) : routeDistance && routeDistance.routes.length > 0 ? (
                    <>
                      {/* Stat de distância total */}
                      <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                          <Text style={styles.statIcon}>🚴</Text>
                          <Text style={styles.statValue}>
                            {routeDistance.totalDistanceKm} km
                          </Text>
                          <Text style={styles.statLabel}>Total na cidade</Text>
                        </View>
                        <View style={styles.statItem}>
                          <Text style={styles.statIcon}>🛣️</Text>
                          <Text style={styles.statValue}>
                            {routeDistance.routes.length}
                          </Text>
                          <Text style={styles.statLabel}>
                            {routeDistance.routes.length === 1 ? "Rota" : "Rotas"}
                          </Text>
                        </View>
                        <View style={styles.statItem}>
                          <Text style={styles.statIcon}>📍</Text>
                          <Text style={styles.statValue}>
                            {routeDistance.radiusKm} km
                          </Text>
                          <Text style={styles.statLabel}>Raio usado</Text>
                        </View>
                      </View>

                      {/* Divider */}
                      <View style={styles.divider} />

                      {/* Lista de rotas individuais */}
                      {routeDistance.routes.map((route) => (
                        <View key={route.routeId} style={styles.routeItem}>
                          <View style={styles.routeItemLeft}>
                            <View style={styles.routeDot} />
                            <Text style={styles.routeName}>
                              {route.routeName}
                            </Text>
                          </View>
                          <Text style={styles.routeDistance}>
                            {route.distanceKm} km
                          </Text>
                        </View>
                      ))}
                    </>
                  ) : (
                    <Text style={styles.comingSoon}>
                      Nenhuma rota cadastrada passando por esta cidade.
                    </Text>
                  )}
                </View>

                {/* Botão ver no mapa */}
                <Pressable style={styles.mapBtn} onPress={handleGoToMap}>
                  <Text style={styles.mapBtnText}>Ver no mapa</Text>
                </Pressable>
              </>
            )}

            {/* ── ABA 2: PONTOS DE APOIO ── */}
            {activeTab === "apoio" && (
              <>
                {isAdmin && (
                  <Pressable
                    style={styles.adminApoioBtn}
                    onPress={() => router.push("/(tabs)/admin")}
                  >
                    <IconSymbol
                      size={18}
                      name="plus.circle.fill"
                      color="#FFFFFF"
                    />
                    <Text style={styles.adminApoioBtnText}>
                      Painel Admin: Gerenciar Pontos & Carimbos
                    </Text>
                  </Pressable>
                )}

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
                              <Text style={styles.anchorDetail}>
                                📞 {ap.phone}
                              </Text>
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
          </View>
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
  container: { flex: 1, backgroundColor: "#F3F4F6" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorText: { fontSize: 16, color: "#6B7280" },

  header: {
    backgroundColor: CRIC_BLUE,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerTopBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  backIconCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  backLabel: {
    fontSize: 13,
    color: "#FFFFFF",
    fontWeight: "700",
  },
  routeTag: {
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
  routeTagText: {
    fontSize: 10,
    fontWeight: "800",
    color: "rgba(255, 255, 255, 0.8)",
    letterSpacing: 1.5,
  },
  cityName: {
    fontSize: 30,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -0.5,
    marginBottom: 10,
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 8,
    marginBottom: 14,
  },
  metaBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
  },
  metaBadgeText: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.9)",
    fontWeight: "600",
  },

  tabs: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    position: "relative",
    marginTop: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 4,
    paddingHorizontal: 4,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  tabActive: {},
  tabDivider: {
    width: 1,
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  tabIndicatorContainer: {
    position: "absolute",
    bottom: 3,
    left: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  tabIndicatorBar: {
    width: 24,
    height: 3,
    backgroundColor: "#FFFFFF",
    borderRadius: 2,
    shadowColor: "#FFFFFF",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
    elevation: 3,
  },
  tabText: {
    fontSize: 12,
    color: "rgba(255,255,255,0.55)",
    fontWeight: "600",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  tabTextActive: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 12,
  },

  body: { padding: 20, gap: 16, paddingBottom: 40 },

  contentContainer: {
    flex: 1,
  },

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
    backgroundColor: CRIC_BLUE,
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
    borderColor: CRIC_BLUE,
  },
  filterChipIcon: { fontSize: 13 },
  filterChipText: { fontSize: 12, fontWeight: "600", color: "#6B7280" },
  filterChipTextActive: { color: CRIC_BLUE },

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

  divider: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginVertical: 4,
  },
  routeItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  routeItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  routeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#2563EB",
  },
  routeName: {
    fontSize: 13,
    color: "#374151",
    fontWeight: "500",
    flex: 1,
  },
  routeDistance: {
    fontSize: 13,
    fontWeight: "700",
    color: "#2563EB",
  },
  adminApoioBtn: {
    backgroundColor: CRIC_BLUE,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: CRIC_BLUE,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  adminApoioBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
});
