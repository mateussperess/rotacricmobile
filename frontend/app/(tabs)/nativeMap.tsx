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
  BootstrapOfflineService,
  AnchorPointsOfflineRepository,
  RoutesOfflineRepository,
} from "@/services/database/offlineRepositories";
import { useAuth } from "@/components/contexts/AuthContext";
import { AnchorPointMarker } from "@/components/anchorPointIcon";
import { IconSymbol } from "@/components/ui/icon-symbol";
import {
  AnchorPoint,
  AnchorPointsService,
} from "@/services/anchorpoints/anchorPointService";
import { CitiesService } from "@/services/cities/citiesService";
import { Route, RoutesService } from "@/services/routes/routeService";
import { useWeather } from "@/hooks/use-weather";
import {
  useNetworkStatus,
  NetworkStatusInlineBadge,
} from "@/components/NetworkStatusBanner";
import polyline from "@mapbox/polyline";
import * as Location from "expo-location";
import NetInfo from "@react-native-community/netinfo";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Animated,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Circle, Marker, Polyline, Region } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";

type LocationData = Location.LocationObject | null;

const ACCURACY_THRESHOLD_METERS = 50;
const MAX_WAIT_MS = 15000;
const SHEET_COLLAPSED = 90;
const SHEET_EXPANDED = 380;

const ICON_MAP: Record<string, React.FC<{ width: number; height: number }>> = {
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

const CATEGORY_LABELS: Record<string, string> = {
  beverage_storage: "Depósito de Bebidas",
  food: "Alimentação",
  gas_station: "Posto de Gasolina",
  hospital: "Hospital",
  hotel: "Hotel",
  pharmacy: "Farmácia",
  repair: "Reparo",
  store: "Lojas e Mercados",
  tourism: "Turismo",
};

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
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatDist(meters: number): string {
  return meters < 1000
    ? `${Math.round(meters)} m`
    : `${(meters / 1000).toFixed(1)} km`;
}

const MOCK_ROUTE_INFO = {
  label: "ROTA CRIC — Principal",
  distance: "42 km",
  time: "3h 20min",
  elevation: "+280 m",
};

const AnchorMarker = React.memo(({ ap }: { ap: AnchorPoint }) => {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 300);
    return () => clearTimeout(t);
  }, []);

  return (
    <Marker
      coordinate={{ latitude: ap.lat, longitude: ap.lng }}
      title={ap.name}
      description={ap.phone ?? ap.business_hours ?? undefined}
      tracksViewChanges={!ready}
    >
      <AnchorPointMarker
        icon_name={ap.category?.icon_name}
        on_route={ap.on_route}
      />
    </Marker>
  );
});

AnchorMarker.displayName = "AnchorMarker";

const UserMarker = React.memo(
  ({ latitude, longitude }: { latitude: number; longitude: number }) => {
    const [ready, setReady] = useState(false);

    useEffect(() => {
      const t = setTimeout(() => setReady(true), 300);
      return () => clearTimeout(t);
    }, []);

    return (
      <Marker
        coordinate={{ latitude, longitude }}
        anchor={{ x: 0.5, y: 0.5 }}
        flat
        tracksViewChanges={!ready}
      >
        <View style={styles.userDot} />
      </Marker>
    );
  },
);

UserMarker.displayName = "UserMarker";

export default function NativeMap() {
  const { primaryColor } = useAuth();
  const { lat, lng, zoom, t, apId, apName } = useLocalSearchParams<{
    lat?: string;
    lng?: string;
    zoom?: string;
    t?: string;
    apId?: string;
    apName?: string;
  }>();

  const cityTarget =
    lat && lng
      ? {
          latitude: parseFloat(lat),
          longitude: parseFloat(lng),
          zoom: zoom ? parseInt(zoom) : 12,
        }
      : null;

  const [viewingCity, setViewingCity] = useState(!!cityTarget);
  const [selectedSingleApId, setSelectedSingleApId] = useState<string | null>(null);
  const [singleApName, setSingleApName] = useState<string | null>(null);
  const [location, setLocation] = useState<LocationData>(null);
  const [acquiring, setAcquiring] = useState(true);
  const [following, setFollowing] = useState(!cityTarget);
  const [cityName, setCityName] = useState<string | null>(null);
  const [anchorPoints, setAnchorPoints] = useState<AnchorPoint[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [gpsLoading, setGpsLoading] = useState(true);

  const activeLat = location?.coords.latitude ?? cityTarget?.latitude ?? 0;
  const activeLng = location?.coords.longitude ?? cityTarget?.longitude ?? 0;
  const { data: weatherData } = useWeather(activeLat, activeLng);
  const { statusState, pendingCount } = useNetworkStatus();
  const [showOfflineCardModal, setShowOfflineCardModal] = useState(false);

  // ── Animações ──
  const sheetAnim = useRef(new Animated.Value(SHEET_COLLAPSED)).current;
  const chevronAnim = useRef(new Animated.Value(0)).current;
  const sheetOpen = useRef(false);
  const dragStart = useRef(0);
  const modalAnim = useRef(new Animated.Value(0)).current;

  const openModal = useCallback(() => {
    setShowFilterModal(true);
    Animated.timing(modalAnim, {
      toValue: 1,
      duration: 280,
      useNativeDriver: true,
    }).start();
  }, [modalAnim]);

  const closeModal = useCallback(() => {
    Animated.timing(modalAnim, {
      toValue: 0,
      duration: 220,
      useNativeDriver: true,
    }).start(() => setShowFilterModal(false));
  }, [modalAnim]);

  // states do filtro das categorias dos anchor points e rotas
  const [categoryFilter, setCategoryFilter] = useState<Set<string>>(new Set());
  const [includeEventRoutes, setIncludeEventRoutes] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);

  const animateSheet = (open: boolean) => {
    Animated.parallel([
      Animated.spring(sheetAnim, {
        toValue: open ? SHEET_EXPANDED : SHEET_COLLAPSED,
        useNativeDriver: false,
        tension: 60,
        friction: 12,
      }),
      Animated.timing(chevronAnim, {
        toValue: open ? 1 : 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const toggleSheet = () => {
    sheetOpen.current = !sheetOpen.current;
    animateSheet(sheetOpen.current);
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        dragStart.current = sheetOpen.current
          ? SHEET_EXPANDED
          : SHEET_COLLAPSED;
      },
      onPanResponderMove: (_, g) => {
        const next = Math.max(
          SHEET_COLLAPSED,
          Math.min(SHEET_EXPANDED, dragStart.current - g.dy),
        );
        sheetAnim.setValue(next);
      },
      onPanResponderRelease: (_, g) => {
        const snap = g.dy < -30 || (sheetOpen.current && g.dy < 30);
        sheetOpen.current = snap;
        animateSheet(snap);
      },
    }),
  ).current;

  // ── Refs do mapa ──
  const mapRef = useRef<MapView>(null);
  const followingRef = useRef(!cityTarget);
  const viewingCityRef = useRef(!!cityTarget);
  const subscriptionRef = useRef<Location.LocationSubscription | null>(null);
  const geocodedRef = useRef<boolean>(false);
  const acquiredRef = useRef(false);
  const anchorFetchedRef = useRef(false);

  const loadMapData = useCallback(async () => {
    try {
      const netState = await NetInfo.fetch();
      const isStable =
        netState.isConnected === true && netState.isInternetReachable !== false;

      if (isStable) {
        await BootstrapOfflineService.syncBootstrapData();
        const [pts, rts] = await Promise.all([
          AnchorPointsService.findAll().catch(() => []),
          RoutesService.findAll().catch(() => []),
        ]);
        if (pts && pts.length > 0) setAnchorPoints(pts);
        if (rts && rts.length > 0) setRoutes(rts);
      } else {
        // Conexão instável ou offline: carregar estritamente do SQLite local
        const localPts = await AnchorPointsOfflineRepository.getAll();
        const localRoutes = await RoutesOfflineRepository.getAll();
        if (localPts) setAnchorPoints(localPts);
        if (localRoutes) setRoutes(localRoutes);
      }
    } catch {
      const localPts = await AnchorPointsOfflineRepository.getAll();
      const localRoutes = await RoutesOfflineRepository.getAll();
      if (localPts) setAnchorPoints(localPts);
      if (localRoutes) setRoutes(localRoutes);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadMapData();
    }, [loadMapData])
  );

  useEffect(() => {
    let unsubscribe = () => {};
    try {
      if (NetInfo && typeof NetInfo.addEventListener === "function") {
        unsubscribe = NetInfo.addEventListener((state) => {
          const isStable =
            state.isConnected === true && state.isInternetReachable === true;
          if (isStable) {
            loadMapData();
          }
        });
      }
    } catch {}
    return () => {
      try {
        unsubscribe();
      } catch {}
    };
  }, [loadMapData]);

  useEffect(() => {
    if (!lat || !lng) return;
    const latitude = parseFloat(lat),
      longitude = parseFloat(lng);
    const zoomLevel = zoom ? parseInt(zoom) : 12;
    const delta = 1 / Math.pow(2, zoomLevel - 8);
    viewingCityRef.current = true;
    setViewingCity(true);
    followingRef.current = false;
    setFollowing(false);
    const timer = setTimeout(() => {
      mapRef.current?.animateToRegion(
        { latitude, longitude, latitudeDelta: delta, longitudeDelta: delta },
        500,
      );
    }, 300);
    return () => clearTimeout(timer);
  }, [lat, lng, t, zoom]);

  useEffect(() => {
    if (apId) {
      setSelectedSingleApId(apId);
      setSingleApName(apName || null);
      if (lat && lng) {
        const latitude = parseFloat(lat);
        const longitude = parseFloat(lng);
        viewingCityRef.current = true;
        setViewingCity(true);
        followingRef.current = false;
        setFollowing(false);
        const timer = setTimeout(() => {
          mapRef.current?.animateToRegion(
            { latitude, longitude, latitudeDelta: 0.015, longitudeDelta: 0.015 },
            600
          );
        }, 350);
        return () => clearTimeout(timer);
      }
    }
  }, [apId, apName, lat, lng, t]);

  useEffect(() => {
    if (!location || geocodedRef.current) return;

    if (
      cityName &&
      cityName !== "Localizando..." &&
      cityName !== "Erro ao obter localização" &&
      cityName !== "Rota CRIC"
    ) {
      geocodedRef.current = true;
      return;
    }

    const { latitude, longitude } = location.coords;
    (async () => {
      try {
        const netState = await NetInfo.fetch();
        if (!netState.isConnected) return;

        const results = await Location.reverseGeocodeAsync({
          latitude,
          longitude,
        }).catch(() => null);

        if (results && results.length > 0) {
          const place = results[0];
          const name = place?.city ?? place?.subregion ?? null;
          if (name) {
            setCityName(name);
            geocodedRef.current = true;
          }
        }
      } catch {
        // Geocodificação reversa exige internet. Ignorar silenciosamente offline.
      }
    })();
  }, [location, cityName]);

  const routeCoordinates = useMemo(() => {
    const activeRoutes = includeEventRoutes
      ? routes
      : routes.filter((r) => !r.is_event_route);

    return activeRoutes.map((route) => ({
      id: route.id,
      color: route.color ?? "#2563EB",
      coordinates: (() => {
        try {
          return polyline
            .decode(route.polyline)
            .map(([la, lo]) => ({ latitude: la, longitude: lo }));
        } catch {
          return [];
        }
      })(),
    }));
  }, [routes, includeEventRoutes]);

  const animateToLocation = useCallback((loc: Location.LocationObject) => {
    if (!followingRef.current || !mapRef.current || viewingCityRef.current)
      return;
    const { latitude, longitude, accuracy } = loc.coords;
    const delta = Math.max((accuracy ?? 100) / 50000, 0.005);
    mapRef.current.animateToRegion(
      { latitude, longitude, latitudeDelta: delta, longitudeDelta: delta },
      300,
    );
  }, []);

  const startWatch = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setAcquiring(false);
        return;
      }
      acquiredRef.current = false;
      const timeout = setTimeout(() => {
        if (!acquiredRef.current) {
          acquiredRef.current = true;
          setAcquiring(false);
        }
      }, MAX_WAIT_MS);
      subscriptionRef.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 1000,
          distanceInterval: 1,
        },
        (loc) => {
          setLocation(loc);
          setGpsLoading(false);
          animateToLocation(loc);
          const acc = loc.coords.accuracy ?? Infinity;
          if (acc <= ACCURACY_THRESHOLD_METERS && !acquiredRef.current) {
            acquiredRef.current = true;
            clearTimeout(timeout);
            setAcquiring(false);
          }
        },
      );
    } catch (err) {
      console.warn("[GPS Watch Error Ignored]", err);
      setAcquiring(false);
    }
  }, [animateToLocation]);

  const stopWatch = useCallback(() => {
    subscriptionRef.current?.remove();
    subscriptionRef.current = null;
  }, []);

  useEffect(() => {
    startWatch();
    return stopWatch;
  }, [startWatch, stopWatch]);

  const handleRecenter = useCallback(() => {
    followingRef.current = true;
    setFollowing(true);
    if (location) animateToLocation(location);
  }, [location, animateToLocation]);

  const handleDismissCity = useCallback(() => {
    viewingCityRef.current = false;
    setViewingCity(false);
    followingRef.current = true;
    setFollowing(true);
    if (location) animateToLocation(location);
  }, [location, animateToLocation]);

  const { latitude, longitude, accuracy } = location?.coords ?? {};
  const firstCoord = routeCoordinates[0]?.coordinates[0];

  const initialRegion: Region = cityTarget
    ? {
        latitude: cityTarget.latitude,
        longitude: cityTarget.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }
    : {
        latitude: latitude ?? firstCoord?.latitude ?? -15.7942,
        longitude: longitude ?? firstCoord?.longitude ?? -47.8822,
        latitudeDelta: 0.04,
        longitudeDelta: 0.04,
      };

  const visibleAnchorPoints = useMemo(() => {
    if (selectedSingleApId) {
      return anchorPoints.filter((ap) => ap.id.toString() === selectedSingleApId);
    }
    if (categoryFilter.size === 0) return anchorPoints;
    return anchorPoints.filter(
      (ap) =>
        ap.category?.icon_name && categoryFilter.has(ap.category.icon_name),
    );
  }, [anchorPoints, categoryFilter, selectedSingleApId]);

  const nearbyPoints = useMemo(() => {
    if (!latitude || !longitude || visibleAnchorPoints.length === 0) return [];
    return [...visibleAnchorPoints]
      .map((ap) => ({
        ...ap,
        distM: haversineMeters(latitude, longitude, ap.lat, ap.lng),
      }))
      .sort((a, b) => a.distM - b.distM)
      .slice(0, 4);
  }, [visibleAnchorPoints, latitude, longitude]);

  const mapHeight = sheetAnim.interpolate({
    inputRange: [SHEET_COLLAPSED, SHEET_EXPANDED],
    outputRange: ["92%", "62%"],
  });

  const chevronRotate = chevronAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: primaryColor }]} edges={["top"]}>
      <View style={styles.container}>
        {/* ── Mapa ── */}
        <Animated.View style={[styles.mapWrapper, { height: mapHeight }]}>
          <MapView
            ref={mapRef}
            style={styles.map}
            initialRegion={initialRegion}
            showsUserLocation={false}
            showsMyLocationButton={false}
            onPanDrag={() => {
              followingRef.current = false;
              setFollowing(false);
            }}
          >
            {routeCoordinates.map((route) => (
              <Polyline
                key={route.id}
                coordinates={route.coordinates}
                strokeColor={route.color}
                strokeWidth={4}
                lineJoin="round"
              />
            ))}

            {visibleAnchorPoints.map((ap) => (
              <AnchorMarker key={ap.id} ap={ap} />
            ))}

            {latitude && longitude && (
              <>
                <UserMarker latitude={latitude} longitude={longitude} />
                <Circle
                  center={{ latitude, longitude }}
                  radius={accuracy ?? 50}
                  strokeColor="rgba(39,50,115,0.3)"
                  fillColor="rgba(39,50,115,0.06)"
                  strokeWidth={1}
                />
              </>
            )}
          </MapView>

          {/* Container de Controles do Topo (Posição, Clima e Indicador Inline) */}
          <View style={styles.topControlsContainer}>
            <View style={styles.topControlsRow}>
              <View style={styles.positionCard}>
                <View style={styles.positionIconWrap}>
                  <Text style={styles.positionIcon}>➤</Text>
                </View>
                <View style={{ flex: 1, marginRight: 4 }}>
                  <Text style={styles.positionLabel}>Você está em</Text>
                  <Text style={styles.positionCity} numberOfLines={1}>
                    {cityName
                      ? `${cityName} — RS`
                      : acquiring
                        ? "Localizando..."
                        : "Fora da rota"}
                  </Text>
                </View>
                {weatherData && (
                  <View style={styles.weatherBadge}>
                    <Text style={styles.weatherEmoji}>{weatherData.emoji}</Text>
                    <Text style={styles.weatherTemp}>{weatherData.temperature}°C</Text>
                  </View>
                )}
              </View>

              {/* Badge de estado de rede integrado à direita com animação de entrada/saída */}
              <NetworkStatusInlineBadge
                statusState={statusState}
                pendingCount={pendingCount}
                onPress={() => setShowOfflineCardModal(true)}
              />
            </View>

            {/* Sub-banner para exibição de Cidade ou Ponto de Apoio Selecionado */}
            {selectedSingleApId ? (
              <View style={[styles.cityBanner, { backgroundColor: primaryColor }]}>
                <Text style={styles.cityBannerText} numberOfLines={1}>
                  Visualizando {singleApName || "ponto de apoio"}
                </Text>
                <Pressable
                  onPress={() => {
                    setSelectedSingleApId(null);
                    setSingleApName(null);
                    setViewingCity(false);
                    followingRef.current = true;
                    setFollowing(true);
                    if (location) animateToLocation(location);
                  }}
                  style={styles.cityBannerClose}
                  hitSlop={8}
                >
                  <Text style={styles.cityBannerCloseText}>✕</Text>
                </Pressable>
              </View>
            ) : (
              viewingCity && cityTarget && (
                <View style={[styles.cityBanner, { backgroundColor: primaryColor }]}>
                  <Text style={styles.cityBannerText} numberOfLines={1}>
                    Visualizando cidade
                  </Text>
                  <Pressable
                    onPress={handleDismissCity}
                    style={styles.cityBannerClose}
                    hitSlop={8}
                  >
                    <Text style={styles.cityBannerCloseText}>✕</Text>
                  </Pressable>
                </View>
              )
            )}
          </View>

          {/* Banner de refinamento de GPS */}
          {acquiring && (
            <View style={styles.acquiringBanner}>
              <ActivityIndicator size="small" color="#2563EB" />
              <Text style={styles.acquiringText}>Refinando GPS...</Text>
            </View>
          )}

          {/* Deck Flutuante de Botões de Ação do Mapa (FAB Deck) */}
          <View style={styles.fabDeck}>
            <TouchableOpacity
              activeOpacity={0.8}
              style={[
                styles.fabBtn,
                categoryFilter.size > 0 && styles.fabBtnActive,
              ]}
              onPress={openModal}
            >
              <Text style={styles.fabBtnIcon}>⚙️</Text>
              {categoryFilter.size > 0 && (
                <View style={styles.filterBadge}>
                  <Text style={styles.filterBadgeText}>
                    {categoryFilter.size}
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            {!following && !viewingCity && (
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.fabBtn}
                onPress={handleRecenter}
              >
                <Text style={styles.fabBtnIcon}>📍</Text>
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>

        {/* ── Bottom Sheet (Menu Expandível) ── */}
        <Animated.View style={[styles.sheet, { height: sheetAnim }]}>
          {/* Handle de drag */}
          <View {...panResponder.panHandlers} style={styles.handleArea}>
            <View style={styles.handle} />
          </View>

          {/* Header clicável do Bottom Sheet */}
          <Pressable onPress={toggleSheet} style={styles.sheetHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.sheetLabel}>{MOCK_ROUTE_INFO.label}</Text>
              <Text style={styles.sheetRoute} numberOfLines={1}>
                {cityName ? `Você está em ${cityName}` : "ROTA CRIC"}
              </Text>
            </View>
            <View style={styles.expandTogglePill}>
              <Text style={styles.expandToggleText}>
                {sheetOpen.current ? "Recolher" : "Menu"}
              </Text>
              <Animated.Text
                style={[
                  styles.sheetChevron,
                  { transform: [{ rotate: chevronRotate }] },
                ]}
              >
                ▲
              </Animated.Text>
            </View>
          </Pressable>

          {/* Conteúdo do Menu Expandível */}
          <ScrollView
            style={styles.sheetScroll}
            showsVerticalScrollIndicator={false}
            removeClippedSubviews={true}
          >
            {/* Grid de Estatísticas da Rota */}
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <View style={styles.statIconWrap}>
                  <Text style={styles.statIcon}>🚴</Text>
                </View>
                <Text style={styles.statLabel}>Distância</Text>
                <Text style={styles.statValue}>{MOCK_ROUTE_INFO.distance}</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <View style={styles.statIconWrap}>
                  <Text style={styles.statIcon}>🕐</Text>
                </View>
                <Text style={styles.statLabel}>Tempo est.</Text>
                <Text style={styles.statValue}>{MOCK_ROUTE_INFO.time}</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <View style={styles.statIconWrap}>
                  <Text style={styles.statIcon}>↑</Text>
                </View>
                <Text style={styles.statLabel}>Elevação</Text>
                <Text style={[styles.statValue, { color: "#D97706" }]}>
                  {MOCK_ROUTE_INFO.elevation}
                </Text>
              </View>
            </View>

            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>PRÓXIMOS PONTOS DE APOIO</Text>
              <Text style={styles.sectionCountText}>
                {nearbyPoints.length} próximos
              </Text>
            </View>

            {gpsLoading ? (
              <ActivityIndicator
                color={primaryColor || "#2563EB"}
                style={{ marginVertical: 16 }}
              />
            ) : nearbyPoints.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  Nenhum ponto de apoio encontrado próximo à sua localização.
                </Text>
              </View>
            ) : (
              nearbyPoints.map((ap) => {
                const IconComponent = ap.category?.icon_name
                  ? ICON_MAP[ap.category.icon_name]
                  : null;

                return (
                  <Pressable
                    key={ap.id}
                    style={({ pressed }) => [
                      styles.anchorRow,
                      pressed && styles.anchorRowPressed,
                    ]}
                    onPress={() => {
                      mapRef.current?.animateToRegion(
                        {
                          latitude: ap.lat,
                          longitude: ap.lng,
                          latitudeDelta: 0.005,
                          longitudeDelta: 0.005,
                        },
                        500,
                      );
                      followingRef.current = false;
                      setFollowing(false);
                    }}
                  >
                    <View
                      style={[
                        styles.anchorRowIconWrap,
                        ap.on_route && styles.anchorRowIconOnRoute,
                      ]}
                    >
                      {IconComponent ? (
                        <IconComponent width={26} height={26} />
                      ) : (
                        <Text style={styles.anchorRowIcon}>📍</Text>
                      )}
                    </View>
                    <View style={styles.anchorRowInfo}>
                      <Text style={styles.anchorRowName} numberOfLines={1}>
                        {ap.name}
                      </Text>
                      <Text style={styles.anchorRowSub}>
                        {ap.category?.icon_name
                          ? CATEGORY_LABELS[ap.category.icon_name] || "Ponto de Apoio"
                          : "Ponto de Apoio"}
                        {ap.on_route ? " • Na Rota" : ""}
                      </Text>
                    </View>
                    <View style={styles.anchorRowDistChip}>
                      <Text style={styles.anchorRowDist}>
                        {formatDist(ap.distM)}
                      </Text>
                    </View>
                  </Pressable>
                );
              })
            )}
          </ScrollView>
        </Animated.View>
        {showFilterModal && (
          <Animated.View style={[styles.modalOverlay, { opacity: modalAnim }]}>
            <Pressable style={StyleSheet.absoluteFill} onPress={closeModal} />
            <Animated.View
              style={[
                styles.modalBox,
                {
                  transform: [
                    {
                      translateY: modalAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [-24, 0],
                      }),
                    },
                    {
                      scale: modalAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.95, 1],
                      }),
                    },
                  ],
                },
              ]}
            >
              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <View style={styles.modalHeaderTitleRow}>
                  <View style={styles.modalHeaderIconWrap}>
                    <Text style={{ fontSize: 16 }}>⚙️</Text>
                  </View>
                  <View>
                    <Text style={styles.modalTitle}>Filtros do Mapa</Text>
                    <Text style={styles.modalSubtitle}>Categorias e opções de exibição</Text>
                  </View>
                </View>

                {categoryFilter.size > 0 && (
                  <Pressable
                    onPress={() => setCategoryFilter(new Set())}
                    style={styles.modalClearBtn}
                  >
                    <Text style={styles.modalClearText}>Limpar</Text>
                  </Pressable>
                )}
              </View>

              {/* Modal Scroll Content */}
              <ScrollView
                style={styles.modalScroll}
                contentContainerStyle={{ gap: 12, paddingBottom: 8 }}
                showsVerticalScrollIndicator={false}
              >
                <Text style={styles.modalSectionLabel}>CATEGORIAS DE PONTOS DE APOIO</Text>
                <View style={styles.categoryGrid}>
                  {Object.entries(ICON_MAP).map(([key, IconComponent]) => {
                    const active = categoryFilter.has(key);
                    return (
                      <Pressable
                        key={key}
                        style={({ pressed }) => [
                          styles.categoryCard,
                          active && styles.categoryCardActive,
                          pressed && styles.categoryCardPressed,
                        ]}
                        onPress={() => {
                          setCategoryFilter((prev) => {
                            const next = new Set(prev);
                            next.has(key) ? next.delete(key) : next.add(key);
                            return next;
                          });
                        }}
                      >
                        <View
                          style={[
                            styles.categoryCardIcon,
                            active && styles.categoryCardIconActive,
                          ]}
                        >
                          <IconComponent width={20} height={20} />
                        </View>
                        <Text
                          style={[
                            styles.categoryCardText,
                            active && styles.categoryCardTextActive,
                          ]}
                          numberOfLines={1}
                        >
                          {CATEGORY_LABELS[key]}
                        </Text>
                        {active && (
                          <View style={styles.categoryCheckBadge}>
                            <Text style={styles.categoryCheckText}>✓</Text>
                          </View>
                        )}
                      </Pressable>
                    );
                  })}
                </View>

                <Text style={[styles.modalSectionLabel, { marginTop: 8 }]}>EXIBIÇÃO DE ROTAS</Text>
                <Pressable
                  style={({ pressed }) => [
                    styles.routeOptionCard,
                    includeEventRoutes && styles.routeOptionCardActive,
                    pressed && styles.categoryCardPressed,
                  ]}
                  onPress={() => setIncludeEventRoutes((prev) => !prev)}
                >
                  <View
                    style={[
                      styles.routeOptionIcon,
                      includeEventRoutes && styles.routeOptionIconActive,
                    ]}
                  >
                    <Text style={{ fontSize: 16 }}>🚩</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[
                        styles.routeOptionTitle,
                        includeEventRoutes && styles.routeOptionTitleActive,
                      ]}
                    >
                      Exibir rotas de eventos
                    </Text>
                    <Text style={styles.routeOptionSub}>
                      Inclui rotas especiais de passeios e eventos temporários
                    </Text>
                  </View>
                  {includeEventRoutes && (
                    <View style={styles.categoryCheckBadge}>
                      <Text style={styles.categoryCheckText}>✓</Text>
                    </View>
                  )}
                </Pressable>
              </ScrollView>

              {/* Modal Footer */}
              <TouchableOpacity
                activeOpacity={0.85}
                style={[styles.modalDone, { backgroundColor: primaryColor || "#2563EB" }]}
                onPress={closeModal}
              >
                <Text style={styles.modalDoneText}>
                  {categoryFilter.size > 0
                    ? `Aplicar Filtros (${categoryFilter.size})`
                    : "Aplicar Filtros"}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          </Animated.View>
        )}
        {/* Card Modal Explicativo de Estado de Conectividade */}
        {showOfflineCardModal && (
          <View style={styles.modalOverlay}>
            <Pressable
              style={StyleSheet.absoluteFill}
              onPress={() => setShowOfflineCardModal(false)}
            />
            <View
              style={[
                styles.expandedCard,
                statusState === "reconnected"
                  ? styles.borderReconnected
                  : statusState === "offline"
                    ? styles.borderOffline
                    : styles.borderSyncing,
              ]}
            >
              <View style={styles.expandedHeader}>
                <View style={styles.titleRow}>
                  <Text style={styles.expandedTitle}>
                    {statusState === "reconnected"
                      ? "Conexão Reestabelecida"
                      : statusState === "offline"
                        ? "Dispositivo Off-line"
                        : "Sincronizando Dados"}
                  </Text>
                </View>

                <Pressable
                  onPress={() => setShowOfflineCardModal(false)}
                  style={styles.closeBtn}
                >
                  <Text style={styles.closeBtnText}>✕</Text>
                </Pressable>
              </View>

              <Text style={styles.expandedSubText}>
                {statusState === "reconnected"
                  ? "Você está online novamente. As informações e carimbos salvos localmente foram sincronizados."
                  : statusState === "offline"
                    ? pendingCount > 0
                      ? `Você está sem internet. Há ${pendingCount} carimbo(s) salvo(s) neste celular que serão enviados automaticamente ao reconectar.`
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
                  onPress={() => setShowOfflineCardModal(false)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.collapseBtnText}>Recolher</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#2563EB",
  },
  container: {
    flex: 1,
    backgroundColor: "#F7F8FC",
  },
  mapWrapper: { width: "100%", overflow: "hidden" },
  map: { flex: 1 },
  userDot: {
    width: 18,
    height: 18,
    backgroundColor: "#2563EB",
    borderRadius: 9,
    borderWidth: 3,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  topControlsContainer: {
    position: "absolute",
    top: 10,
    left: 12,
    right: 12,
    zIndex: 10,
    gap: 8,
  },
  topControlsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  positionCard: {
    flex: 1,
    height: 48,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  positionIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#EEF2FF",
    alignItems: "center",
    justifyContent: "center",
  },
  positionIcon: { fontSize: 14, color: "#2563EB" },
  positionLabel: {
    fontSize: 10,
    color: "#94A3B8",
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  positionCity: { fontSize: 14, fontWeight: "700", color: "#0F172A" },

  cityBanner: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#2563EB",
    paddingLeft: 12,
    paddingRight: 8,
    paddingVertical: 6,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
    maxWidth: "100%",
  },
  cityBannerText: { fontSize: 12, color: "#FFFFFF", fontWeight: "600" },
  cityBannerClose: {
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  cityBannerCloseText: { color: "#FFFFFF", fontSize: 11, fontWeight: "800" },

  acquiringBanner: {
    position: "absolute",
    top: 102,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(255, 255, 255, 0.94)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    elevation: 3,
  },
  acquiringText: { fontSize: 12, color: "#334155", fontWeight: "600" },

  /* Deck Flutuante de Ações */
  fabDeck: {
    position: "absolute",
    bottom: 14,
    right: 14,
    gap: 10,
    alignItems: "center",
    zIndex: 20,
  },
  fabBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 5,
  },
  fabBtnActive: {
    backgroundColor: "#EFF6FF",
    borderWidth: 1.5,
    borderColor: "#2563EB",
  },
  fabBtnIcon: { fontSize: 18 },
  filterBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    backgroundColor: "#2563EB",
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  filterBadgeText: { fontSize: 10, color: "#FFFFFF", fontWeight: "800" },

  /* Bottom Sheet Otimizado */
  sheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 12,
    overflow: "hidden",
  },
  handleArea: { alignItems: "center", paddingTop: 10, paddingBottom: 8 },
  handle: { width: 36, height: 4, backgroundColor: "#CBD5E1", borderRadius: 2 },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingBottom: 12,
  },
  sheetBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  sheetLabel: {
    fontSize: 10,
    color: "#2563EB",
    fontWeight: "800",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  sheetRoute: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
  },
  expandTogglePill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    gap: 4,
  },
  expandToggleText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#475569",
  },
  sheetChevron: { fontSize: 12, color: "#475569" },
  sheetScroll: { paddingHorizontal: 18 },

  /* Stats Grid */
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  statItem: { alignItems: "center", gap: 3, flex: 1 },
  statIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statIcon: { fontSize: 14 },
  statDivider: { width: 1, backgroundColor: "#E2E8F0", marginVertical: 4 },
  statLabel: { fontSize: 10, color: "#64748B", fontWeight: "600" },
  statValue: { fontSize: 14, fontWeight: "800", color: "#0F172A" },

  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: "#64748B",
    letterSpacing: 1.2,
  },
  sectionCountText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#2563EB",
  },

  anchorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginBottom: 6,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  anchorRowPressed: {
    backgroundColor: "#F8FAFC",
  },
  anchorRowIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  anchorRowIconOnRoute: {
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  anchorRowIcon: { fontSize: 18 },
  anchorRowInfo: { flex: 1 },
  anchorRowName: { fontSize: 14, fontWeight: "700", color: "#0F172A" },
  anchorRowSub: { fontSize: 11, color: "#64748B", marginTop: 1 },
  anchorRowDistChip: {
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  anchorRowDist: { fontSize: 12, color: "#2563EB", fontWeight: "800" },
  emptyContainer: {
    paddingVertical: 16,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 13,
    color: "#94A3B8",
    fontStyle: "italic",
    textAlign: "center",
  },
  weatherBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  weatherEmoji: { fontSize: 13 },
  weatherTemp: { fontSize: 12, fontWeight: "800", color: "#0F172A" },

  /* Modal de Filtros Otimizado */
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(15, 23, 42, 0.45)",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 40,
    zIndex: 9999,
  },
  modalBox: {
    maxHeight: "85%",
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 16,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  modalHeaderTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  modalHeaderIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#EEF2FF",
    alignItems: "center",
    justifyContent: "center",
  },
  modalTitle: { fontSize: 16, fontWeight: "800", color: "#0F172A" },
  modalSubtitle: { fontSize: 11, color: "#64748B", marginTop: 1 },
  modalClearBtn: {
    backgroundColor: "#FEF2F2",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#FEE2E2",
  },
  modalClearText: { fontSize: 11, color: "#EF4444", fontWeight: "700" },

  modalScroll: { maxHeight: 380 },
  modalSectionLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: "#64748B",
    letterSpacing: 1,
  },

  /* Grid 2 colunas */
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryCard: {
    width: "48.5%",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 14,
    backgroundColor: "#F8FAFC",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
  },
  categoryCardActive: {
    backgroundColor: "#EFF6FF",
    borderColor: "#2563EB",
  },
  categoryCardPressed: {
    opacity: 0.8,
  },
  categoryCardIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
  },
  categoryCardIconActive: {
    backgroundColor: "#DBEAFE",
  },
  categoryCardText: {
    flex: 1,
    fontSize: 12,
    fontWeight: "600",
    color: "#475569",
  },
  categoryCardTextActive: {
    color: "#1E40AF",
    fontWeight: "800",
  },
  categoryCheckBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
  },
  categoryCheckText: { color: "#FFFFFF", fontSize: 10, fontWeight: "900" },

  /* Card de filtro de rotas */
  routeOptionCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: "#F8FAFC",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
  },
  routeOptionCardActive: {
    backgroundColor: "#EFF6FF",
    borderColor: "#2563EB",
  },
  routeOptionIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
  },
  routeOptionIconActive: {
    backgroundColor: "#DBEAFE",
  },
  routeOptionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#334155",
  },
  routeOptionTitleActive: {
    color: "#1E40AF",
    fontWeight: "800",
  },
  routeOptionSub: {
    fontSize: 10,
    color: "#64748B",
    marginTop: 2,
  },

  modalDone: {
    backgroundColor: "#2563EB",
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 14,
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  modalDoneText: { color: "#FFFFFF", fontWeight: "800", fontSize: 15 },

  /* Card Expandido de Conectividade */
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
    alignSelf: "center",
  },
  borderOffline: {
    borderWidth: 1.5,
    borderColor: "rgba(245, 158, 11, 0.6)",
  },
  borderSyncing: {
    borderWidth: 1.5,
    borderColor: "rgba(56, 189, 248, 0.6)",
  },
  borderReconnected: {
    borderWidth: 1.5,
    borderColor: "rgba(16, 185, 129, 0.6)",
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
