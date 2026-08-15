import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useWeather } from "../hooks/use-weather";

interface WeatherCardProps {
  lat: number;
  lng: number;
}

export function WeatherCard({ lat, lng }: WeatherCardProps) {
  const { data, loading, error } = useWeather(lat, lng);

  if (loading) {
    return (
      <View style={[styles.card, styles.centered]}>
        <ActivityIndicator color="#2563EB" />
        <Text style={styles.loadingText}>Carregando clima...</Text>
      </View>
    );
  }

  if (error || !data) {
    return (
      <View style={[styles.card, styles.centered]}>
        <Text style={styles.errorEmoji}>🌐</Text>
        <Text style={styles.errorText}>
          {error ?? "Erro ao carregar clima."}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      {/* ── Topo: condição atual ── */}
      <View style={styles.topRow}>
        <View>
          <Text style={styles.sectionLabel}>CLIMA AGORA</Text>
          <Text style={styles.tempMain}>{data.temperature}°C</Text>
          <Text style={styles.conditionLabel}>
            {data.emoji} {data.label}
          </Text>
        </View>
        <View style={styles.emojiCircle}>
          <Text style={styles.emojiMain}>{data.emoji}</Text>
        </View>
      </View>

      {/* ── Divider ── */}
      <View style={styles.divider} />

      {/* ── Detalhes ── */}
      <View style={styles.detailsRow}>
        <DetailItem icon="🌡️" label="Sensação" value={`${data.feelsLike}°C`} />
        <DetailItem
          icon="💧"
          label="Chuva"
          value={`${data.precipitation} mm`}
        />
        <DetailItem icon="💨" label="Vento" value={`${data.windspeed} km/h`} />
      </View>

      {/* ── Divider ── */}
      <View style={styles.divider} />

      {/* ── Previsão 5 dias ── */}
      <Text style={styles.forecastTitle}>Próximos dias</Text>
      <View style={styles.forecastRow}>
        {data.forecast.map((day, i) => (
          <View key={i} style={styles.forecastDay}>
            <Text style={styles.forecastDayName}>{day.date}</Text>
            <Text style={styles.forecastEmoji}>{day.emoji}</Text>
            <Text style={styles.forecastMax}>{day.maxTemp}°</Text>
            <Text style={styles.forecastMin}>{day.minTemp}°</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function DetailItem({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.detailItem}>
      <Text style={styles.detailIcon}>{icon}</Text>
      <Text style={styles.detailValue}>{value}</Text>
      <Text style={styles.detailLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 1,
    gap: 12,
  },
  centered: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 100,
    gap: 8,
  },
  loadingText: { fontSize: 13, color: "#9CA3AF" },
  errorEmoji: { fontSize: 28 },
  errorText: { fontSize: 13, color: "#9CA3AF", textAlign: "center" },

  // Topo
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#9CA3AF",
    letterSpacing: 1,
    marginBottom: 4,
  },
  tempMain: {
    fontSize: 48,
    fontWeight: "800",
    color: "#111827",
    lineHeight: 52,
  },
  conditionLabel: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
  },
  emojiCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#EEF2FF",
    alignItems: "center",
    justifyContent: "center",
  },
  emojiMain: { fontSize: 36 },

  divider: {
    height: 1,
    backgroundColor: "#F3F4F6",
  },

  // Detalhes
  detailsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  detailItem: { alignItems: "center", gap: 2 },
  detailIcon: { fontSize: 18 },
  detailValue: { fontSize: 15, fontWeight: "700", color: "#111827" },
  detailLabel: { fontSize: 11, color: "#9CA3AF" },

  // Previsão
  forecastTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#9CA3AF",
    letterSpacing: 0.8,
  },
  forecastRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  forecastDay: { alignItems: "center", gap: 3, flex: 1 },
  forecastDayName: { fontSize: 11, fontWeight: "600", color: "#6B7280" },
  forecastEmoji: { fontSize: 20 },
  forecastMax: { fontSize: 13, fontWeight: "700", color: "#111827" },
  forecastMin: { fontSize: 12, color: "#9CA3AF" },
});
