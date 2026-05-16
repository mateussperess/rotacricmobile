import polyline from "@mapbox/polyline";
import * as Location from "expo-location";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
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

// testandouma polyline longa do RotaCRIC pra ver se o mapa renderiza sem precisar do GPS
const ENCODED_POLYLINE =
  "nyzuD`nazHa@vCS~@Sj@y@h@WJi@LcDJaCVgALqGj@UBOHuC`@sFd@`@fENt@FPbAb@f@PdAj@h@TfCtAxB|AtC|Ad@^xAnBv@n@Zp@`IxNpBlElLbU~@dCRdALpAAC@vAGfBKnAeApKcA`L_@lEkApKO`EwAxg@]pM_@|IcAl_@aAlLmBrPcB`PqCdYm@bMa@nUyAxv@@`CP~DjEza@b@jFdAnHl@tGrAfPpAxNPdCBvACfB?CoFd]cIdg@]hCe@xT_Ka@oIQoBAQDwAvAGPF^Z^d@\hAp@z@Df_@|@";

export default function NativeMap() {
  const [location, setLocation] = useState<LocationData>(null);
  const [acquiring, setAcquiring] = useState(true);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [following, setFollowing] = useState(true);

  const mapRef = useRef<MapView>(null);
  const followingRef = useRef(true);
  const subscriptionRef = useRef<Location.LocationSubscription | null>(null);
  const acquiredRef = useRef(false);

  const routeCoordinates = useMemo(() => {
    try {
      const points = polyline.decode(ENCODED_POLYLINE);
      return points.map(([latitude, longitude]: [number, number]) => ({
        latitude,
        longitude,
      }));
    } catch (error) {
      console.error("Erro ao decodificar polyline:", error);
      return [];
    }
  }, []);

  const animateToLocation = useCallback((loc: Location.LocationObject) => {
    if (!followingRef.current || !mapRef.current) return;
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
      setLoading(false);
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
        setLoading(false);
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
    setLoading(true);
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

  const { latitude, longitude, accuracy } = location?.coords ?? {};
  const accuracyOk = (accuracy ?? Infinity) <= ACCURACY_THRESHOLD_METERS;

  // const initialRegion: Region = {
  //   latitude: latitude ?? -15.7942,
  //   longitude: longitude ?? -47.8822,
  //   latitudeDelta: 0.01,
  //   longitudeDelta: 0.01,
  // };

  const initialRegion: Region = {
    latitude: latitude ?? routeCoordinates[0]?.latitude ?? -15.7942,
    longitude: longitude ?? routeCoordinates[0]?.longitude ?? -47.8822,
    latitudeDelta: 0.04,
    longitudeDelta: 0.04,
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.mutedText}>Buscando sinal GPS...</Text>
        </View>
      </SafeAreaView>
    );
  }

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
          {/* TRECHO ADICIONADO: Renderiza a linha do traçado */}
          {routeCoordinates.length > 0 && (
            <Polyline
              coordinates={routeCoordinates}
              strokeColor="#273273" // Cor azul escuro correspondente ao formulário
              strokeWidth={4}
              lineJoin="round"
            />
          )}

          {latitude && longitude && (
            <>
              {/* Círculo de precisão */}
              <Circle
                center={{ latitude, longitude }}
                radius={accuracy ?? 50}
                strokeColor="rgba(37,99,235,0.4)"
                fillColor="rgba(37,99,235,0.08)"
                strokeWidth={1}
              />
              {/* Marker customizado */}
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

        {acquiring && (
          <View style={styles.acquiringBanner}>
            <ActivityIndicator size="small" color="#2563eb" />
            <Text style={styles.acquiringText}>Refinando precisão GPS...</Text>
          </View>
        )}

        {!following && (
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
            (loading || acquiring) && styles.buttonDisabled,
          ]}
          onPress={restart}
          disabled={loading || acquiring}
        >
          {loading || acquiring ? (
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
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  mapWrapper: { height: "60%", width: "100%", overflow: "hidden" },
  map: { flex: 1 },
  userDot: {
    width: 18,
    height: 18,
    backgroundColor: "#2563eb",
    borderRadius: 9,
    borderWidth: 3,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
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
    backgroundColor: "#2563eb",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonDisabled: { backgroundColor: "#93c5fd" },
  buttonText: { color: "#fff", fontSize: 14, fontWeight: "600" },
});
