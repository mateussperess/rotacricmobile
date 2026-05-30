import {
  AnchorPoint,
  AnchorPointsService,
} from "@/services/anchorpoints/anchorPointService";
import { CitiesService } from "@/services/cities/citiesService";
import { Route, RoutesService } from "@/services/routes/routeService";
import polyline from "@mapbox/polyline";
import * as Location from "expo-location";
import { useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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

export default function NativeMap() {
  const { lat, lng, zoom, t } = useLocalSearchParams<{
    lat?: string;
    lng?: string;
    zoom?: string;
    t?: string;
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
  const [location, setLocation] = useState<LocationData>(null);
  const [acquiring, setAcquiring] = useState(true);
  const [following, setFollowing] = useState(!cityTarget);
  const [cityName, setCityName] = useState<string | null>(null);
  const [anchorPoints, setAnchorPoints] = useState<AnchorPoint[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [gpsLoading, setGpsLoading] = useState(true);

  // ── Animações ──
  const sheetAnim = useRef(new Animated.Value(SHEET_COLLAPSED)).current;
  const chevronAnim = useRef(new Animated.Value(0)).current;
  const sheetOpen = useRef(false);
  const dragStart = useRef(0);

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
  const acquiredRef = useRef(false);
  const anchorFetchedRef = useRef(false);

  useEffect(() => {
    RoutesService.findAll().then(setRoutes);
  }, []);

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
  }, [lat, lng, t]);

  useEffect(() => {
    if (!location || anchorFetchedRef.current) return;
    anchorFetchedRef.current = true;
    const { latitude, longitude } = location.coords;
    (async () => {
      const [place] = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });
      const name = place?.city ?? place?.subregion ?? null;
      setCityName(name);
      if (!name) return;
      const city = await CitiesService.findByName(name);
      if (!city) return;
      const points = await AnchorPointsService.findAllByCity(city.id);
      setAnchorPoints(points);
    })();
  }, [location]);

  const routeCoordinates = useMemo(
    () =>
      routes.map((route) => ({
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
      })),
    [routes],
  );

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
        accuracy: Location.Accuracy.BestForNavigation,
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
  }, [animateToLocation]);

  const stopWatch = useCallback(() => {
    subscriptionRef.current?.remove();
    subscriptionRef.current = null;
  }, []);

  useEffect(() => {
    startWatch();
    return stopWatch;
  }, []);

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

  const nearbyPoints = useMemo(() => {
    if (!latitude || !longitude || anchorPoints.length === 0) return [];
    return [...anchorPoints]
      .map((ap) => ({
        ...ap,
        distM: haversineMeters(latitude, longitude, ap.lat, ap.lng),
      }))
      .sort((a, b) => a.distM - b.distM)
      .slice(0, 4);
  }, [anchorPoints, latitude, longitude]);

  const mapHeight = sheetAnim.interpolate({
    inputRange: [SHEET_COLLAPSED, SHEET_EXPANDED],
    outputRange: ["92%", "62%"],
  });

  const chevronRotate = chevronAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  return (
    <SafeAreaView style={styles.container}>
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
          {anchorPoints.map((ap) => (
            <Marker
              key={ap.id}
              coordinate={{ latitude: ap.lat, longitude: ap.lng }}
              title={ap.name}
              description={ap.phone ?? ap.business_hours ?? undefined}
            />
          ))}
          {latitude && longitude && (
            <>
              <Circle
                center={{ latitude, longitude }}
                radius={accuracy ?? 50}
                strokeColor="rgba(39,50,115,0.3)"
                fillColor="rgba(39,50,115,0.06)"
                strokeWidth={1}
              />
              <Marker
                coordinate={{ latitude, longitude }}
                anchor={{ x: 0.5, y: 0.5 }}
                flat
              >
                <View style={styles.userDot} />
              </Marker>
            </>
          )}
        </MapView>

        {/* Card posição */}
        <View style={styles.positionCard}>
          <View style={styles.positionIconWrap}>
            <Text style={styles.positionIcon}>➤</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.positionLabel}>Você está em</Text>
            <Text style={styles.positionCity}>
              {cityName
                ? `${cityName} — RS`
                : acquiring
                  ? "Localizando..."
                  : "Fora da rota"}
            </Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={styles.positionLabel}>Próx. ponto</Text>
            <Text style={styles.positionNext}>
              {nearbyPoints[0] ? formatDist(nearbyPoints[0].distM) : "—"}
            </Text>
          </View>
        </View>

        {viewingCity && cityTarget && (
          <View style={styles.cityBanner}>
            <Text style={styles.cityBannerText}>Visualizando cidade</Text>
            <Pressable
              onPress={handleDismissCity}
              style={styles.cityBannerClose}
            >
              <Text style={styles.cityBannerCloseText}>✕</Text>
            </Pressable>
          </View>
        )}

        {acquiring && (
          <View style={styles.acquiringBanner}>
            <ActivityIndicator size="small" color="#2563EB" />
            <Text style={styles.acquiringText}>Refinando GPS...</Text>
          </View>
        )}

        {!following && !viewingCity && (
          <TouchableOpacity style={styles.recenterBtn} onPress={handleRecenter}>
            <Text style={styles.recenterText}>📍</Text>
          </TouchableOpacity>
        )}
      </Animated.View>

      {/* ── Bottom Sheet ── */}
      <Animated.View style={[styles.sheet, { height: sheetAnim }]}>
        {/* Handle de drag */}
        <View {...panResponder.panHandlers} style={styles.handleArea}>
          <View style={styles.handle} />
        </View>

        {/* Header clicável */}
        <Pressable onPress={toggleSheet} style={styles.sheetHeader}>
          <View>
            <Text style={styles.sheetLabel}>{MOCK_ROUTE_INFO.label}</Text>
            <Text style={styles.sheetRoute}>
              {cityName ? `Você está em ${cityName}` : "ROTA CRIC"}
            </Text>
          </View>
          <Animated.Text
            style={[
              styles.sheetChevron,
              { transform: [{ rotate: chevronRotate }] },
            ]}
          >
            ▲
          </Animated.Text>
        </Pressable>

        {/* Conteúdo */}
        <ScrollView
          style={styles.sheetScroll}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statIcon}>🚴</Text>
              <Text style={styles.statLabel}>Distância</Text>
              <Text style={styles.statValue}>{MOCK_ROUTE_INFO.distance}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statIcon}>🕐</Text>
              <Text style={styles.statLabel}>Tempo est.</Text>
              <Text style={styles.statValue}>{MOCK_ROUTE_INFO.time}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statIcon}>↑</Text>
              <Text style={styles.statLabel}>Elevação</Text>
              <Text style={[styles.statValue, { color: "#F59E0B" }]}>
                {MOCK_ROUTE_INFO.elevation}
              </Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>PRÓXIMOS PONTOS DE APOIO</Text>
          {gpsLoading ? (
            <ActivityIndicator color="#2563EB" style={{ marginVertical: 12 }} />
          ) : nearbyPoints.length === 0 ? (
            <Text style={styles.emptyText}>
              Nenhum ponto de apoio encontrado próximo.
            </Text>
          ) : (
            nearbyPoints.map((ap) => (
              <View key={ap.id} style={styles.anchorRow}>
                <Text style={styles.anchorRowIcon}>📍</Text>
                <Text style={styles.anchorRowName} numberOfLines={1}>
                  {ap.name}
                </Text>
                <Text style={styles.anchorRowDist}>{formatDist(ap.distM)}</Text>
              </View>
            ))
          )}
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F8FC" },
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
  positionCard: {
    position: "absolute",
    top: 12,
    left: 12,
    right: 12,
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  positionIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#EEF2FF",
    alignItems: "center",
    justifyContent: "center",
  },
  positionIcon: { fontSize: 16, color: "#2563EB" },
  positionLabel: {
    fontSize: 10,
    color: "#9CA3AF",
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  positionCity: { fontSize: 15, fontWeight: "700", color: "#111827" },
  positionNext: { fontSize: 15, fontWeight: "700", color: "#2563EB" },
  cityBanner: {
    position: "absolute",
    top: 76,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#2563EB",
    paddingLeft: 14,
    paddingRight: 10,
    paddingVertical: 8,
    borderRadius: 20,
    elevation: 4,
  },
  cityBannerText: { fontSize: 13, color: "#fff", fontWeight: "600" },
  cityBannerClose: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  cityBannerCloseText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  acquiringBanner: {
    position: "absolute",
    bottom: 12,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(255,255,255,0.92)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    elevation: 3,
  },
  acquiringText: { fontSize: 13, color: "#374151" },
  recenterBtn: {
    position: "absolute",
    bottom: 12,
    right: 12,
    backgroundColor: "#fff",
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  recenterText: { fontSize: 18 },
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
    overflow: "hidden",
  },
  handleArea: { alignItems: "center", paddingTop: 10, paddingBottom: 6 },
  handle: { width: 40, height: 4, backgroundColor: "#E5E7EB", borderRadius: 2 },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  sheetLabel: {
    fontSize: 11,
    color: "#2563EB",
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  sheetRoute: {
    fontSize: 17,
    fontWeight: "800",
    color: "#111827",
    marginTop: 2,
  },
  sheetChevron: { fontSize: 18, color: "#9CA3AF" },
  sheetScroll: { paddingHorizontal: 20 },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#F7F8FC",
    borderRadius: 14,
    paddingVertical: 14,
    marginBottom: 20,
  },
  statItem: { alignItems: "center", gap: 4, flex: 1 },
  statDivider: { width: 1, backgroundColor: "#E5E7EB" },
  statIcon: { fontSize: 18 },
  statLabel: { fontSize: 10, color: "#9CA3AF", fontWeight: "600" },
  statValue: { fontSize: 15, fontWeight: "700", color: "#111827" },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: "#9CA3AF",
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  anchorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: "#F3F4F6",
  },
  anchorRowIcon: { fontSize: 16 },
  anchorRowName: { flex: 1, fontSize: 14, fontWeight: "600", color: "#111827" },
  anchorRowDist: { fontSize: 13, color: "#2563EB", fontWeight: "700" },
  emptyText: {
    fontSize: 13,
    color: "#9CA3AF",
    fontStyle: "italic",
    paddingVertical: 8,
  },
});
