import * as Location from "expo-location";

import React, { useCallback, useEffect, useRef, useState } from "react";

import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { WebView } from "react-native-webview";

type LocationData = Location.LocationObject | null;

const ACCURACY_THRESHOLD_METERS = 50; // quando o gps atinge < 50m de precisão
const MAX_WAIT_MS = 15000; // desiste depois de 15 segundos
const createMapHtml = (lat: number, lng: number, accuracy: number) => `
<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      #map { height: 100vh; width: 100vw; }
    </style>
  </head>

  <body>
    <div id="map"></div>
    <script>
      let map = L.map('map', { zoomControl: true, attributionControl: false })
                 .setView([${lat}, ${lng}], 17);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19
      }).addTo(map);

      var icon = L.divIcon({
        className: '',
        html: '<div style="width:18px;height:18px;background:#2563eb;border:3px solid #fff;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.4)"></div>',
        iconSize: [18, 18],
        iconAnchor: [9, 9]
      });

      L.marker([${lat}, ${lng}], { icon: icon }).addTo(map)
        .bindPopup('Você está aqui<br><small>Precisão: ~${accuracy.toFixed(0)}m</small>')
        .openPopup();

      L.circle([${lat}, ${lng}], {
        radius: ${accuracy},
        color: '#2563eb',
        fillColor: '#2563eb',
        fillOpacity: 0.08,
        weight: 1
      }).addTo(map);
    </script>
  </body>
</html>
`;

// espera uma leitura GPS com boa precisão usando watchPositionAsync

async function getAccurateLocation(
  onUpdate: (loc: Location.LocationObject) => void,
): Promise<Location.LocationObject> {
  return new Promise(async (resolve, reject) => {
    let settled = false;
    let bestLocation: Location.LocationObject | null = null;

    const timeout = setTimeout(() => {
      if (!settled) {
        settled = true;
        subscription?.remove();

        // retorna sempre o melhor que tiver, mesmo fora do threshold
        if (bestLocation) resolve(bestLocation);
        else reject(new Error("Timeout sem localização"));
      }
    }, MAX_WAIT_MS);

    const subscription = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.BestForNavigation,
        timeInterval: 500,
        distanceInterval: 0,
      },

      (loc) => {
        const acc = loc.coords.accuracy ?? Infinity;
        // sempre atualiza o melhor resultado e notifica a UI

        if (!bestLocation || acc < (bestLocation.coords.accuracy ?? Infinity)) {
          bestLocation = loc;

          onUpdate(loc); // atualiza o mapa em tempo real
        }

        // se uma precisão boa foi atingida, resolve
        if (acc <= ACCURACY_THRESHOLD_METERS && !settled) {
          settled = true;
          clearTimeout(timeout);
          subscription.remove();
          resolve(loc);
        }
      },
    );
  });
}

export default function Map() {
  const [location, setLocation] = useState<LocationData>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [acquiring, setAcquiring] = useState(false); // true enquanto refina o GPS
  const webViewRef = useRef<WebView>(null);

  const fetchLocation = useCallback(async () => {
    setLoading(true);
    setAcquiring(true);
    setErrorMsg(null);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permissão de localização negada.");
        return;
      }

      await getAccurateLocation((loc) => {
        // atualiza em tempo real conforme GPS refina
        setLocation(loc);
        setLoading(false); // e mostra o mapa assim que tiver qualquer leitura
      });
    } catch (e) {
      if (!location) setErrorMsg("Não foi possível obter a localização.");
      throw e;
    } finally {
      setAcquiring(false);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLocation();
  }, [fetchLocation]);

  if (loading && !location) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.mapPlaceholder}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={[styles.placeholderText, { marginTop: 12 }]}>
            Buscando sinal GPS...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const { latitude, longitude, accuracy } = location?.coords ?? {};
  const accuracyOk = (accuracy ?? Infinity) <= ACCURACY_THRESHOLD_METERS;

  return (
    <SafeAreaView style={styles.container}>
      {/* Mapa */}

      <View style={styles.mapWrapper}>
        {latitude && longitude ? (
          <WebView
            ref={webViewRef}
            originWhitelist={["*"]}
            source={{
              html: createMapHtml(latitude, longitude, accuracy ?? 50),
            }}
            style={styles.map}
            javaScriptEnabled
          />
        ) : (
          <View style={styles.mapPlaceholder}>
            {loading ? (
              <>
                <ActivityIndicator size="large" color="#2563eb" />

                <Text style={[styles.placeholderText, { marginTop: 12 }]}>
                  Buscando sinal GPS...
                </Text>
              </>
            ) : (
              <Text style={styles.placeholderText}>Mapa indisponível</Text>
            )}
          </View>
        )}

        {/* Banner de refinamento sobreposto ao mapa */}

        {acquiring && location && (
          <View style={styles.acquiringBanner}>
            <ActivityIndicator size="small" color="#2563eb" />

            <Text style={styles.acquiringText}>Refinando precisão GPS...</Text>
          </View>
        )}
      </View>

      {/* Painel */}

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
        ) : !location ? (
          <Text style={styles.mutedText}>Obtendo posição...</Text>
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
        ) : null}

        <TouchableOpacity
          style={[
            styles.button,

            (loading || acquiring) && styles.buttonDisabled,
          ]}
          onPress={fetchLocation}
          disabled={loading || acquiring}
          activeOpacity={0.75}
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

  // Mapa
  mapWrapper: {
    height: "60%",
    width: "100%",
    overflow: "hidden",
    borderBottomWidth: 0.5,
    borderBottomColor: "#d1d5db",
  },

  map: { flex: 1 },

  mapPlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#e5e7eb",
  },

  placeholderText: { color: "#6b7280", fontSize: 14 },

  // banner de refinamento
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
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },

  acquiringText: { fontSize: 13, color: "#374151" },

  // painel

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

  // badge

  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },

  badgeGood: { backgroundColor: "#dcfce7" },

  badgePoor: { backgroundColor: "#fee2e2" },

  badgeText: { fontSize: 12, fontWeight: "500" },

  badgeTextGood: { color: "#166534" },

  badgeTextPoor: { color: "#991b1b" },

  mutedText: { fontSize: 14, color: "#9ca3af" },

  errorText: { fontSize: 14, color: "#dc2626" },

  // grid

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

  // botao

  button: {
    marginTop: 8,
    backgroundColor: "#2563eb",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },

  buttonDisabled: { backgroundColor: "#93c5fd" },

  buttonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});
