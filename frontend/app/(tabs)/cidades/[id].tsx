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
import { useNetworkStatus } from "@/components/NetworkStatusBanner";
import { WeatherCard } from "@/components/WeatherCard";
import { useAuth } from "@/components/contexts/AuthContext";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useCityImages } from "@/hooks/use-city-images";
import { useCityRouteDistance } from "@/hooks/use-city-route-distance";

import {
    AnchorPointCategory,
    AnchorPointCategoryService,
} from "@/services/anchorpoints/anchorPointCategoryService";
import {
    AnchorPoint,
    AnchorPointsService,
} from "@/services/anchorpoints/anchorPointService";
import { CitiesService, City } from "@/services/cities/citiesService";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
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
const TABS: Tab[] = ["sobre", "trecho", "apoio"];

const TABS_CONFIG: {
  key: Tab;
  label: string;
  icon: "building.2.fill" | "bicycle" | "mappin.and.ellipse";
}[] = [
  { key: "sobre", label: "Sobre", icon: "building.2.fill" },
  { key: "trecho", label: "Trecho", icon: "bicycle" },
  { key: "apoio", label: "Apoio", icon: "mappin.and.ellipse" },
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
  const [categories, setCategories] = useState<AnchorPointCategory[]>([]);
  const [loadingCity, setLoadingCity] = useState(true);
  const [loadingAnchor, setLoadingAnchor] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("sobre");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
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

  useEffect(() => {
    AnchorPointCategoryService.findAll()
      .then((data) => {
        if (data && Array.isArray(data)) {
          setCategories(data.filter((c) => c.is_active !== false));
        }
      })
      .catch(() => {});
  }, []);

  const availableCategories = useMemo(() => {
    const catMap = new Map<
      string,
      { id: string; name: string; icon_name?: string }
    >();

    categories.forEach((cat) => {
      catMap.set(cat.id.toString(), {
        id: cat.id.toString(),
        name: cat.name,
        icon_name: cat.icon_name,
      });
    });

    anchorPoints.forEach((ap) => {
      if (ap.category) {
        const cId = ap.category.id.toString();
        if (!catMap.has(cId)) {
          catMap.set(cId, {
            id: cId,
            name: ap.category.name,
            icon_name: ap.category.icon_name,
          });
        }
      }
    });

    return Array.from(catMap.values());
  }, [categories, anchorPoints]);

  const filteredPoints = anchorPoints.filter((ap) => {
    if (selectedCategory === "all") return true;
    const apCatId = (ap.category_id || ap.category?.id)?.toString();
    const apCatName = ap.category?.name?.toLowerCase().trim();
    const selectedCatObj = availableCategories.find(
      (c) => c.id === selectedCategory,
    );
    const targetCatName = selectedCatObj?.name?.toLowerCase().trim();

    return (
      apCatId === selectedCategory ||
      (apCatName && targetCatName && apCatName === targetCatName)
    );
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
          nestedScrollEnabled
        >
          {/* ── Header da Cidade ── */}
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

              <View style={styles.adminPill}>
                <Text style={styles.adminPillText}>
                  {isAdmin ? "ADMINISTRADOR" : "ROTA CRIC"}
                </Text>
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

          {/* ── Conteúdo com Pager Horizontal Animado ── */}
          <Animated.ScrollView
            ref={pagerRef}
            horizontal
            pagingEnabled
            nestedScrollEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { x: scrollX } } }],
              { useNativeDriver: true },
            )}
            onMomentumScrollEnd={handleMomentumScrollEnd}
            scrollEventThrottle={16}
            style={styles.contentContainer}
            contentContainerStyle={{ width: windowWidth * TABS.length }}
          >
            {/* ── ABA 0: SOBRE ── */}
            <View style={{ width: windowWidth }}>
              <View style={styles.body}>
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

                    return (
                      <CityImageCarousel
                        images={displayImages}
                        cityName={city?.name}
                      />
                    );
                  })()}

                  <Text style={styles.cardTitle}>Sobre a cidade</Text>
                  <Text style={styles.cardText}>
                    {city.about?.trim()
                      ? city.about
                      : "Informações sobre esta cidade em breve."}
                  </Text>
                </View>
              </View>
            </View>

            {/* ── ABA 1: TRECHO ── */}
            <View style={{ width: windowWidth }}>
              <View style={styles.body}>
                {/* ── CARD: CONEXÕES DO TRECHO (ROTA CRIC) ── */}
                {routeDistance &&
                  routeDistance.connectedCities &&
                  routeDistance.connectedCities.length > 0 && (
                    <View style={styles.card}>
                      <Text style={styles.cardTitle}>
                        Conexões do Trecho (Rota CRIC)
                      </Text>
                      <Text style={styles.cardSubtitle}>
                        Cidades vizinhas conectadas por este percurso:
                      </Text>
                      <View style={styles.divider} />
                      {routeDistance.connectedCities.map((conn) => (
                        <Pressable
                          key={conn.cityId}
                          style={styles.connectionItem}
                          onPress={() =>
                            router.push(`/(tabs)/cidades/${conn.cityId}`)
                          }
                        >
                          <View style={styles.connectionLeft}>
                            <Text style={styles.connectionIcon}>🚴‍♂️</Text>
                            <View style={{ flex: 1 }}>
                              <Text style={styles.connectionName}>
                                {conn.cityName}
                              </Text>
                              <Text style={styles.connectionSub}>
                                {conn.routeName || "Conexão Rota CRIC"}
                              </Text>
                            </View>
                          </View>
                          <View style={styles.connectionRight}>
                            <Text style={styles.connectionDist}>
                              {conn.distanceKm} km
                            </Text>
                            <Text style={styles.connectionArrow}>➔</Text>
                          </View>
                        </Pressable>
                      ))}
                    </View>
                  )}

                {/* Botão ver no mapa */}
                <Pressable style={styles.mapBtn} onPress={handleGoToMap}>
                  <Text style={styles.mapBtnText}>Ver no mapa</Text>
                </Pressable>
              </View>
            </View>

            {/* ── ABA 2: PONTOS DE APOIO ── */}
            <View style={{ width: windowWidth }}>
              <View style={styles.body}>
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

                {/* Filtros por Categoria de Ponto de Apoio */}
                <View style={styles.filterWrapContainer}>
                  <Pressable
                    style={[
                      styles.filterChip,
                      selectedCategory === "all" && styles.filterChipActive,
                    ]}
                    onPress={() => setSelectedCategory("all")}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        selectedCategory === "all" &&
                          styles.filterChipTextActive,
                      ]}
                    >
                      Todos ({anchorPoints.length})
                    </Text>
                  </Pressable>

                  {availableCategories.map((cat) => {
                    const IconComponent = cat.icon_name
                      ? ICON_MAP[cat.icon_name]
                      : null;
                    const count = anchorPoints.filter((ap) => {
                      const apCatId = (
                        ap.category_id || ap.category?.id
                      )?.toString();
                      const apCatName = ap.category?.name?.toLowerCase().trim();
                      return (
                        apCatId === cat.id ||
                        (apCatName &&
                          apCatName === cat.name.toLowerCase().trim())
                      );
                    }).length;

                    const isSelected = selectedCategory === cat.id;

                    return (
                      <Pressable
                        key={cat.id}
                        style={[
                          styles.filterChip,
                          isSelected && styles.filterChipActive,
                        ]}
                        onPress={() => setSelectedCategory(cat.id)}
                      >
                        {IconComponent ? (
                          <IconComponent width={14} height={14} />
                        ) : null}
                        <Text
                          style={[
                            styles.filterChipText,
                            isSelected && styles.filterChipTextActive,
                          ]}
                        >
                          {cat.name} ({count})
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>

                {/* Lista */}
                {loadingAnchor ? (
                  <ActivityIndicator
                    color="#2563EB"
                    style={{ marginTop: 32 }}
                  />
                ) : filteredPoints.length === 0 ? (
                  <View style={styles.card}>
                    <Text style={styles.cardText}>
                      {anchorPoints.length === 0
                        ? "Nenhum ponto de apoio cadastrado para esta cidade."
                        : "Nenhum ponto de apoio encontrado com esta categoria."}
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
              </View>
            </View>
          </Animated.ScrollView>
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
  adminPill: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  adminPillText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 1.2,
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

  // Filtros de Categoria
  filterWrapContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 4,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: "#fff",
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
  },
  filterChipActive: {
    backgroundColor: "#EEF2FF",
    borderColor: CRIC_BLUE,
  },
  filterChipText: { fontSize: 12, fontWeight: "600", color: "#6B7280" },
  filterChipTextActive: { color: CRIC_BLUE, fontWeight: "700" },

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
  cardSubtitle: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: -2,
    marginBottom: 4,
  },
  connectionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    marginVertical: 4,
  },
  connectionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  connectionIcon: {
    fontSize: 18,
  },
  connectionName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },
  connectionSub: {
    fontSize: 12,
    color: "#6B7280",
  },
  connectionRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  connectionDist: {
    fontSize: 13,
    fontWeight: "700",
    color: CRIC_BLUE,
  },
  connectionArrow: {
    fontSize: 14,
    color: "#9CA3AF",
  },
});
