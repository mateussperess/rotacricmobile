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

import { LEAFLET_CSS, LEAFLET_JS } from "@/assets/leafletBundle";
import OFFLINE_TILES from "@/assets/tilesOffline";

type LocationData = Location.LocationObject | null;

const ACCURACY_THRESHOLD_METERS = 50;
const MAX_WAIT_MS = 15000;

const INJECT_THROTTLE_MS = 50;

const createMapHtml = (lat: number, lng: number, accuracy: number) => {
  const tilesJson = JSON.stringify(OFFLINE_TILES);

  return `
<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <style>
      ${LEAFLET_CSS}
      * { margin: 0; padding: 0; box-sizing: border-box; }
      #map { height: 100vh; width: 100vw; }
    </style>
  </head>
  <body>
    <div id="map"></div>
    <script>
      ${LEAFLET_JS}
    </script>
    <script>
      const OFFLINE_TILES = ${tilesJson};

      const OfflineTileLayer = L.TileLayer.extend({
        createTile: function(coords, done) {
          const img = document.createElement('img');
          const key = coords.z + '/' + coords.x + '/' + coords.y;
          const b64 = OFFLINE_TILES[key];

          if (b64) {
            img.src = 'data:image/png;base64,' + b64;
            img.onload = () => done(null, img);
            img.onerror = (e) => done(e, img);
          } else {
            const s = ['a','b','c'][Math.floor(Math.random()*3)];
            img.src = 'https://' + s + '.tile.openstreetmap.org/' + key + '.png';
            img.crossOrigin = 'anonymous';
            img.onload = () => done(null, img);
            img.onerror = (e) => done(e, img);
          }
          return img;
        }
      });

      try {
        const map = L.map('map', { zoomControl: true, attributionControl: false })
                     .setView([${lat}, ${lng}], 13);

        new OfflineTileLayer('', { maxZoom: 14, minZoom: 10 }).addTo(map);

        const icon = L.divIcon({
          className: '',
          html: '<div style="width:18px;height:18px;background:#2563eb;border:3px solid #fff;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.4)"></div>',
          iconSize: [18, 18],
          iconAnchor: [9, 9]
        });

        window.userMarker = L.marker([${lat}, ${lng}], { icon }).addTo(map);
        window.userCircle = L.circle([${lat}, ${lng}], {
          radius: ${accuracy},
          color: '#2563eb',
          fillColor: '#2563eb',
          fillOpacity: 0.08,
          weight: 1
        }).addTo(map);

        window.updatePosition = function(lat, lng, accuracy, follow) {
          const latlng = [lat, lng];
          if (window.userMarker) window.userMarker.setLatLng(latlng);
          if (window.userCircle) {
            window.userCircle.setLatLng(latlng);
            window.userCircle.setRadius(accuracy);
          }
          if (follow && map) {
            map.setView(latlng, map.getZoom(), { animate: true, duration: 0.3 });
          }
        };

        map.on('dragstart', function() {
          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage('dragstart');
          }
        });

        let tilesLoading = 0;
        let mapReadySent = false;

        function checkReady() {
          if (tilesLoading === 0 && !mapReadySent) {
            mapReadySent = true;
            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage('mapReady');
            }
          }
        }

        map.on('tileloadstart', function() { tilesLoading++; });
        map.on('tileload',      function() { tilesLoading--; checkReady(); });
        map.on('tileerror',     function() { tilesLoading--; checkReady(); });

        setTimeout(checkReady, 300);

      } catch(err) {
        console.error('Erro ao criar mapa:', err);
      }
    </script>
  </body>
</html>
`;
};

function useLocationWatch(
  onUpdate: (loc: Location.LocationObject) => void,
  onAcquired: () => void,
) {
  const subscriptionRef = useRef<Location.LocationSubscription | null>(null);
  const acquiredRef = useRef(false);

  const start = useCallback(async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") return false;

    acquiredRef.current = false;

    const timeout = setTimeout(() => {
      if (!acquiredRef.current) {
        acquiredRef.current = true;
        onAcquired();
      }
    }, MAX_WAIT_MS);

    subscriptionRef.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.BestForNavigation,
        timeInterval: 1000,
      },
      (loc) => {
        onUpdate(loc);
        const acc = loc.coords.accuracy ?? Infinity;
        if (acc <= ACCURACY_THRESHOLD_METERS && !acquiredRef.current) {
          acquiredRef.current = true;
          clearTimeout(timeout);
          onAcquired();
        }
      },
    );

    return true;
  }, [onUpdate, onAcquired]);

  const stop = useCallback(() => {
    subscriptionRef.current?.remove();
    subscriptionRef.current = null;
  }, []);

  return { start, stop };
}

export default function Map() {
  const [location, setLocation] = useState<LocationData>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [acquiring, setAcquiring] = useState(true);
  const mapReadyRef = useRef(false);
  const [mapVisible, setMapVisible] = useState(false);
  const webViewRef = useRef<WebView>(null);

  const followingRef = useRef(true);
  const [following, setFollowing] = useState(true);

  const initialHtmlRef = useRef<string | null>(null);

  const pendingLocRef = useRef<Location.LocationObject | null>(null);
  const lastInjectRef = useRef(0);

  const injectUpdate = useCallback((loc: Location.LocationObject) => {
    const now = Date.now();
    if (now - lastInjectRef.current < INJECT_THROTTLE_MS) return;
    lastInjectRef.current = now;

    const { latitude, longitude, accuracy } = loc.coords;
    const js = `
      if (window.updatePosition) {
        window.updatePosition(${latitude}, ${longitude}, ${accuracy ?? 50}, ${followingRef.current});
      }
      true;
    `;
    webViewRef.current?.injectJavaScript(js);
  }, []);

  const handleUpdate = useCallback(
    (loc: Location.LocationObject) => {
      setLocation(loc);
      setLoading(false);

      if (!initialHtmlRef.current) {
        const { latitude, longitude, accuracy } = loc.coords;
        initialHtmlRef.current = createMapHtml(
          latitude,
          longitude,
          accuracy ?? 50,
        );
      }

      if (mapReadyRef.current) {
        injectUpdate(loc);
      } else {
        pendingLocRef.current = loc;
      }
    },
    [injectUpdate],
  );

  const handleAcquired = useCallback(() => setAcquiring(false), []);

  const { start, stop } = useLocationWatch(handleUpdate, handleAcquired);

  const restartWatch = useCallback(async () => {
    setLoading(true);
    setAcquiring(true);
    setErrorMsg(null);
    followingRef.current = true;
    setFollowing(true);
    stop();
    const ok = await start();
    if (!ok) {
      setErrorMsg("Permissão de localização negada.");
      setLoading(false);
      setAcquiring(false);
    }
  }, [start, stop]);

  useEffect(() => {
    restartWatch();
    return () => stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleMapLoad = useCallback(() => {
    if (mapReadyRef.current) return;
    mapReadyRef.current = true;
    setMapVisible(true);
    if (pendingLocRef.current) {
      injectUpdate(pendingLocRef.current);
      pendingLocRef.current = null;
    }
  }, [injectUpdate]);

  const handleMessage = useCallback(
    (event: any) => {
      const data = event.nativeEvent.data;
      if (data === "dragstart") {
        followingRef.current = false;
        setFollowing(false);
      } else if (data === "mapReady") {
        handleMapLoad();
      }
    },
    [handleMapLoad],
  );

  const handleRecenter = useCallback(() => {
    followingRef.current = true;
    setFollowing(true);
    if (location) injectUpdate(location);
  }, [location, injectUpdate]);

  const { latitude, longitude, accuracy } = location?.coords ?? {};
  const accuracyOk = (accuracy ?? Infinity) <= ACCURACY_THRESHOLD_METERS;

  if (loading && !location) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.mapLoadingOverlay}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={[styles.placeholderText, { marginTop: 12 }]}>
            Buscando sinal GPS...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.mapWrapper}>
        {/* FIX #5: source usa o HTML congelado no ref — nunca muda, WebView não recarrega */}
        {initialHtmlRef.current && (
          <WebView
            ref={webViewRef}
            originWhitelist={["*"]}
            source={{ html: initialHtmlRef.current }}
            style={styles.map}
            javaScriptEnabled
            onMessage={handleMessage}
          />
        )}

        {!mapVisible && (
          <View style={styles.mapLoadingOverlay}>
            <ActivityIndicator size="large" color="#2563eb" />
            <Text style={[styles.placeholderText, { marginTop: 12 }]}>
              Carregando mapa...
            </Text>
          </View>
        )}

        {acquiring && mapVisible && location && (
          <View style={styles.acquiringBanner}>
            <ActivityIndicator size="small" color="#2563eb" />
            <Text style={styles.acquiringText}>Refinando precisão GPS...</Text>
          </View>
        )}

        {/* FIX #2: agora usa `following` (estado) em vez de followingRef.current */}
        {!following && mapVisible && (
          <TouchableOpacity
            style={styles.recenterButton}
            onPress={handleRecenter}
          >
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
          onPress={restartWatch}
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
  mapWrapper: {
    height: "60%",
    width: "100%",
    overflow: "hidden",
    borderBottomWidth: 0.5,
    borderBottomColor: "#d1d5db",
  },
  map: { flex: 1 },
  mapLoadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#e5e7eb",
    zIndex: 10,
  },
  placeholderText: { color: "#6b7280", fontSize: 14 },
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
  recenterButton: {
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
  mutedText: { fontSize: 14, color: "#9ca3af" },
  errorText: { fontSize: 14, color: "#dc2626" },
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
