import { City } from "@/services/cities/citiesService";
import { Feather } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useWeather } from "../hooks/use-weather";

const CRIC_BLUE = "#2563EB";

interface CityMeta {
  order: number;
  kmStart: number;
  kmEnd: number;
  subtitle: string;
  distance: string;
  elevation: string;
}

interface CityWithMeta extends City {
  anchorCount: number;
}

interface CityCardProps {
  item: CityWithMeta;
  meta?: CityMeta;
  onPress: () => void;
}

export function CityCard({ item, meta, onPress }: CityCardProps) {
  const { data: weather, loading: weatherLoading } = useWeather(
    item.lat,
    item.lng,
  );

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={onPress}
    >
      {/* Faixa colorida */}
      <View style={[styles.cardAccent, { backgroundColor: CRIC_BLUE }]} />

      <View style={styles.cardBody}>
        {/* KM + clima */}
        <View style={styles.cardMeta}>
          {meta && (
            <Text style={styles.kmLabel}>
              KM {meta.kmStart} – {meta.kmEnd} KM
            </Text>
          )}
          <View style={styles.weatherChip}>
            {weatherLoading ? (
              <Text style={styles.weatherIcon}>···</Text>
            ) : weather ? (
              <>
                <Text style={styles.weatherIcon}>{weather.emoji}</Text>
                <Text style={[styles.weatherTemp, { color: CRIC_BLUE }]}>
                  {weather.temperature}°
                </Text>
              </>
            ) : (
              <Text style={styles.weatherIcon}>—</Text>
            )}
          </View>
        </View>

        {/* Nome + ícone */}
        <View style={styles.cardTitleRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.cityName}>{item.name}</Text>
            {meta?.subtitle && (
              <Text style={styles.citySubtitle}>{meta.subtitle}</Text>
            )}
          </View>
          <View
            style={[styles.locationIcon, { backgroundColor: CRIC_BLUE + "18" }]}
          >
            <Feather name="map-pin" size={18} color={CRIC_BLUE} />
          </View>
        </View>

        {/* About */}
        {!!item.about?.trim() && (
          <Text style={styles.cityAbout} numberOfLines={2}>
            {item.about}
          </Text>
        )}

        {/* Footer */}
        <View style={styles.cardFooter}>
          <View style={styles.footerStats}>
            {meta && (
              <>
                <Text style={styles.footerStat}>🚴 {meta.distance}</Text>
                <Text style={styles.footerStat}>↑ {meta.elevation}</Text>
              </>
            )}
            {item.anchorCount > 0 && (
              <Text style={styles.footerStat}>📍 {item.anchorCount}</Text>
            )}
          </View>
          <Text style={[styles.detailsBtnText, { color: CRIC_BLUE }]}>
            Ver detalhes ›
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardPressed: { opacity: 0.85, transform: [{ scale: 0.985 }] },
  cardAccent: { height: 4 },
  cardBody: { paddingHorizontal: 16, paddingVertical: 14 },

  cardMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  kmLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#9CA3AF",
    letterSpacing: 0.5,
  },
  weatherChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#F7F8FC",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    minWidth: 52,
    justifyContent: "center",
  },
  weatherIcon: { fontSize: 12 },
  weatherTemp: { fontSize: 12, fontWeight: "700" },

  cardTitleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 8,
  },
  cityName: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
    letterSpacing: -0.3,
  },
  citySubtitle: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
    marginTop: 2,
  },
  locationIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  cityAbout: {
    fontSize: 12,
    color: "#6B7280",
    lineHeight: 17,
    marginBottom: 10,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 10,
    borderTopWidth: 0.5,
    borderTopColor: "#F3F4F6",
  },
  footerStats: { flexDirection: "row", gap: 12 },
  footerStat: { fontSize: 12, color: "#6B7280", fontWeight: "500" },
  detailsBtnText: { fontSize: 13, fontWeight: "700" },
});
