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
  Pressable,
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
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [following, setFollowing] = useState(!cityTarget);

  const mapRef = useRef<MapView>(null);
  const followingRef = useRef(!cityTarget);
  const viewingCityRef = useRef(!!cityTarget); // ref síncrona para uso nos callbacks
  const subscriptionRef = useRef<Location.LocationSubscription | null>(null);
  const acquiredRef = useRef(false);
  const anchorPointsFetchedRef = useRef(false);

  const [routes, setRoutes] = useState<Route[]>([]);
  const [anchorPoints, setAnchorPoints] = useState<AnchorPoint[]>([]);
  const [gpsLoading, setGpsLoading] = useState(true);

  useEffect(() => {
    RoutesService.findAll().then((data) => setRoutes(data));
  }, []);

  // anima para a cidade quando o mapa montar
  useEffect(() => {
    if (!lat || !lng) return;

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    const zoomLevel = zoom ? parseInt(zoom) : 12;
    const delta = 1 / Math.pow(2, zoomLevel - 8);

    // mostra o banner e trava o GPS
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
    if (!location || anchorPointsFetchedRef.current) return;
    anchorPointsFetchedRef.current = true;

    const { latitude, longitude } = location.coords;

    const fetchAnchorPoints = async () => {
      const [place] = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });
      const cityName = place?.city ?? place?.subregion;
      if (!cityName) return;
      const city = await CitiesService.findByName(cityName);
      if (!city) return;
      const points = await AnchorPointsService.findAllByCity(city.id);
      setAnchorPoints(points);
    };

    fetchAnchorPoints();
  }, [location]);

  const routeCoordinates = useMemo(() => {
    return routes.map((route) => ({
      id: route.id,
      color: route.color ?? "#2563EB",
      coordinates: (() => {
        try {
          return polyline
            .decode(route.polyline)
            .map(([latitude, longitude]) => ({ latitude, longitude }));
        } catch {
          return [];
        }
      })(),
    }));
  }, [routes]);

  const animateToLocation = useCallback((loc: Location.LocationObject) => {
    // nao move o mapa enquanto estiver visualizando uma cidade
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
      setErrorMsg("Permissão de localização negada.");
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

  const restart = useCallback(async () => {
    setAcquiring(true);
    setErrorMsg(null);
    followingRef.current = true;
    setFollowing(true);
    stopWatch();
    await startWatch();
  }, [startWatch, stopWatch]);

  useEffect(() => {
    startWatch();
    return stopWatch;
  }, []);

  const handleRecenter = useCallback(() => {
    followingRef.current = true;
    setFollowing(true);
    if (location) animateToLocation(location);
  }, [location, animateToLocation]);

  // fecha o banner e volta a seguir o usuário
  const handleDismissCity = useCallback(() => {
    viewingCityRef.current = false;
    setViewingCity(false);
    followingRef.current = true;
    setFollowing(true);
    if (location) animateToLocation(location);
  }, [location, animateToLocation]);

  const { latitude, longitude, accuracy } = location?.coords ?? {};
  const accuracyOk = (accuracy ?? Infinity) <= ACCURACY_THRESHOLD_METERS;
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.mapWrapper}>
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
                strokeColor="rgba(37,99,235,0.4)"
                fillColor="rgba(37,99,235,0.08)"
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

        {/* Banner: visualizando cidade — com botão fechar */}
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
            <Text style={styles.acquiringText}>Refinando precisão GPS...</Text>
          </View>
        )}

        {!following && !viewingCity && (
          <TouchableOpacity style={styles.recenterBtn} onPress={handleRecenter}>
            <Text style={styles.recenterText}>📍 Centralizar</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.infoWrapper}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>📍 Dados do GPS</Text>
          {accuracy != null && (
            <View
              style={[
                styles.badge,
                accuracyOk ? styles.badgeGood : styles.badgePoor,
              ]}
            >
              <Text
                style={[
                  styles.badgeText,
                  accuracyOk ? styles.badgeTextGood : styles.badgeTextPoor,
                ]}
              >
                {accuracyOk ? "GPS preciso" : "Sinal fraco"}
              </Text>
            </View>
          )}
        </View>

        {errorMsg ? (
          <Text style={styles.errorText}>{errorMsg}</Text>
        ) : latitude && longitude ? (
          <View style={styles.dataGrid}>
            <InfoRow label="Latitude" value={latitude.toFixed(7)} />
            <InfoRow label="Longitude" value={longitude.toFixed(7)} />
            <InfoRow
              label="Precisão"
              value={`~${accuracy?.toFixed(0) ?? "?"}m`}
              highlight={!accuracyOk}
            />
          </View>
        ) : (
          <Text style={styles.mutedText}>Obtendo posição...</Text>
        )}

        <TouchableOpacity
          style={[
            styles.button,
            (gpsLoading || acquiring) && styles.buttonDisabled,
          ]}
          onPress={restart}
          disabled={gpsLoading || acquiring}
        >
          {gpsLoading || acquiring ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Atualizar localização</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function InfoRow({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={[styles.infoValue, highlight && styles.infoValueWarn]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  mapWrapper: { height: "60%", width: "100%", overflow: "hidden" },
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

  cityBanner: {
    position: "absolute",
    top: 12,
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
    top: 12,
    right: 12,
    backgroundColor: "rgba(255,255,255,0.92)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    elevation: 3,
  },
  recenterText: { fontSize: 13, color: "#374151" },

  infoWrapper: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 20,
    justifyContent: "center",
    gap: 16,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: { fontSize: 16, fontWeight: "600", color: "#111827" },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeGood: { backgroundColor: "#dcfce7" },
  badgePoor: { backgroundColor: "#fee2e2" },
  badgeText: { fontSize: 12, fontWeight: "500" },
  badgeTextGood: { color: "#166534" },
  badgeTextPoor: { color: "#991b1b" },
  dataGrid: { gap: 8 },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: "#e5e7eb",
  },
  infoLabel: { fontSize: 13, color: "#6b7280" },
  infoValue: { fontSize: 13, color: "#111827", fontFamily: "monospace" },
  infoValueWarn: { color: "#dc2626" },
  mutedText: { fontSize: 14, color: "#9ca3af" },
  errorText: { fontSize: 14, color: "#dc2626" },
  button: {
    marginTop: 8,
    backgroundColor: "#2563EB",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonDisabled: { backgroundColor: "#93c5fd" },
  buttonText: { color: "#fff", fontSize: 14, fontWeight: "600" },
});
