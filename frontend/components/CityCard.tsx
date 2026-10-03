import { useAuth } from "@/components/contexts/AuthContext";
import { City } from "@/services/cities/citiesService";
import { Feather } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useCityRouteDistance } from "../hooks/use-city-route-distance";
import { useWeather } from "../hooks/use-weather";

import { getCityFallbackImage, resolveImageUrl } from "@/utils/imageUtils";

interface CityMeta {
  order: number;
  kmStart: number;
  kmEnd: number;
  subtitle: string;
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
  const { primaryColor } = useAuth();
  
  const [fallbackIndex, setFallbackIndex] = useState(0);

  const imageUri = React.useMemo(() => {
    return resolveImageUrl(item.banner_image, item.name, fallbackIndex);
  }, [item.banner_image, item.name, fallbackIndex]);

  const { data: weather, loading: weatherLoading } = useWeather(
    item.lat,
    item.lng
  );

  const { data: routeDistance, loading: distanceLoading } =
    useCityRouteDistance(item.id);

  const distanceLabel = distanceLoading
    ? "···"
    : routeDistance && routeDistance.totalDistanceKm > 0
      ? `${routeDistance.totalDistanceKm} km`
      : meta
        ? `${meta.kmEnd - meta.kmStart} km`
        : null;

  const stepNumber = meta !== undefined ? (meta.order + 1).toString().padStart(2, "0") : null;

  const handleImageError = () => {
    setFallbackIndex((prev) => prev + 1);
  };

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={onPress}
    >
      {/* Banner / Cover Header da Cidade */}
      <View style={styles.imageContainer}>
        <Image
          key={`${imageUri}-${fallbackIndex}`}
          source={{ uri: imageUri }}
          style={styles.bannerImage}
          resizeMode="cover"
          onError={handleImageError}
        />
        {/* Sombra/Gradiente visual inferior da imagem */}
        <View style={styles.imageOverlay} />

        {/* Badges Flutuantes sobre a Imagem */}
        <View style={styles.floatingBadgesRow}>
          {stepNumber ? (
            <View style={[styles.stepBadge, { backgroundColor: primaryColor }]}>
              <Text style={styles.stepBadgeText}>ETAPA {stepNumber}</Text>
            </View>
          ) : (
            <View />
          )}

          {/* Weather Badge no banner */}
          <View style={styles.glassWeatherChip}>
            {weatherLoading ? (
              <Text style={styles.glassWeatherText}>···</Text>
            ) : weather ? (
              <>
                <Text style={styles.weatherIcon}>{weather.emoji}</Text>
                <Text style={styles.glassWeatherTemp}>{weather.temperature}°</Text>
              </>
            ) : (
              <Text style={styles.glassWeatherText}>—</Text>
            )}
          </View>
        </View>
      </View>

      <View style={styles.cardBody}>
        {/* Faixa KM do trecho */}
        {meta && (
          <View style={styles.bannerKmRow}>
            <View
              style={[
                styles.kmPill,
                { backgroundColor: primaryColor + "12" },
              ]}
            >
              <Feather name="navigation" size={11} color={primaryColor} />
              <Text style={[styles.kmPillText, { color: primaryColor }]}>
                KM {meta.kmStart} até KM {meta.kmEnd}
              </Text>
            </View>
          </View>
        )}

        {/* Nome + Ícone */}
        <View style={styles.cardTitleRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.cityName}>{item.name}</Text>
            {meta?.subtitle && (
              <Text style={styles.citySubtitle}>{meta.subtitle}</Text>
            )}
          </View>
          <View
            style={[styles.locationIcon, { backgroundColor: primaryColor + "14" }]}
          >
            <Feather name="map-pin" size={18} color={primaryColor} />
          </View>
        </View>

        {/* Sobre a cidade */}
        {!!item.about?.trim() && (
          <Text style={styles.cityAbout} numberOfLines={2}>
            {item.about}
          </Text>
        )}

        {/* Footer com indicadores */}
        <View style={styles.cardFooter}>
          <View style={styles.footerStats}>
            {distanceLabel && (
              <View style={styles.statChip}>
                <Text style={styles.statChipIcon}>🚴</Text>
                <Text style={styles.statChipText}>{distanceLabel}</Text>
              </View>
            )}

            {meta?.elevation && (
              <View style={styles.statChip}>
                <Text style={styles.statChipIcon}>⛰️</Text>
                <Text style={styles.statChipText}>{meta.elevation}</Text>
              </View>
            )}

            {item.anchorCount > 0 && (
              <View style={styles.statChip}>
                <Text style={styles.statChipIcon}>📍</Text>
                <Text style={styles.statChipText}>{item.anchorCount}</Text>
              </View>
            )}
          </View>

          <View style={styles.actionBtn}>
            <Text style={[styles.detailsBtnText, { color: primaryColor }]}>
              Ver
            </Text>
            <View
              style={[
                styles.chevronCircle,
                { backgroundColor: primaryColor + "15" },
              ]}
            >
              <Feather name="chevron-right" size={14} color={primaryColor} />
            </View>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    marginHorizontal: 16,
    marginBottom: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.05)",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  cardPressed: {
    opacity: 0.94,
    transform: [{ scale: 0.985 }],
  },
  imageContainer: {
    height: 135,
    width: "100%",
    position: "relative",
    backgroundColor: "#E2E8F0",
  },
  bannerImage: {
    width: "100%",
    height: "100%",
  },
  imageOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(15, 23, 42, 0.25)",
  },
  floatingBadgesRow: {
    position: "absolute",
    top: 12,
    left: 12,
    right: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  stepBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  stepBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.8,
  },
  glassWeatherChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(15, 23, 42, 0.65)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
  },
  glassWeatherText: {
    color: "#FFFFFF",
    fontSize: 11,
  },
  glassWeatherTemp: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
  },
  noImageHeader: {
    width: "100%",
  },
  cardAccent: {
    height: 4,
  },
  cardBody: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  cardMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  stepBadgeLight: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  stepBadgeLightText: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.6,
  },
  kmLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#64748B",
    letterSpacing: 0.5,
  },
  weatherChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 14,
  },
  weatherIcon: {
    fontSize: 12,
  },
  weatherText: {
    fontSize: 11,
    color: "#64748B",
  },
  weatherTemp: {
    fontSize: 11,
    fontWeight: "700",
  },
  bannerKmRow: {
    marginBottom: 8,
  },
  kmPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    alignSelf: "flex-start",
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 8,
  },
  kmPillText: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  cardTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 6,
  },
  cityName: {
    fontSize: 19,
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: -0.4,
  },
  citySubtitle: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "600",
    marginTop: 1,
  },
  locationIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  cityAbout: {
    fontSize: 12.5,
    color: "#475569",
    lineHeight: 18,
    marginTop: 4,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  footerStats: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    flexWrap: "wrap",
    flex: 1,
  },
  statChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  statChipIcon: {
    fontSize: 11,
  },
  statChipText: {
    fontSize: 11,
    color: "#475569",
    fontWeight: "600",
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginLeft: 8,
  },
  detailsBtnText: {
    fontSize: 12,
    fontWeight: "700",
  },
  chevronCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
});

