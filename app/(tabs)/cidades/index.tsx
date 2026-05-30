import { CitiesService, City } from "@/services/cities/citiesService";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Cidades() {
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchCities = async () => {
      const data = await CitiesService.findAll();
      if (data) setCities(data);
      setLoading(false);
    };
    fetchCities();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#273273" style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}

      <View style={styles.header}>
        <Text style={styles.brand}>ROTACRIC</Text>
        <Text style={styles.title}>Cidades da Rota</Text>
      </View>

      {/* Lista */}
      <FlatList
        data={cities}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item, index }) => {
          // const accentColor = CITY_COLORS[index % CITY_COLORS.length];
          return (
            <Pressable
              style={({ pressed }) => [
                styles.card,
                pressed && styles.cardPressed,
              ]}
              onPress={() => router.push(`/cidades/${item.id}`)}
            >
              {/* Faixa colorida no topo */}
              <View
                style={[styles.cardTopAccent, { backgroundColor: "#2563EB" }]}
              />

              <View style={styles.cardBody}>
                <View style={styles.cardRow}>
                  <Text style={styles.cityName}>{item.name}</Text>
                  <Text style={styles.arrow}>›</Text>
                </View>
                {!!item.about && (
                  <Text style={styles.cityAbout} numberOfLines={2}>
                    {item.about}
                  </Text>
                )}
              </View>
            </Pressable>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F8FC",
  },
  header: {
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  brand: {
    color: "#2563EB",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1F2937",
    marginTop: 4,
  },
  list: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 32,
    gap: 12,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.985 }],
  },
  cardTopAccent: {
    height: 5,
    width: "100%",
  },
  cardBody: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cityName: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
  },
  arrow: {
    fontSize: 22,
    color: "#9CA3AF",
  },
  cityAbout: {
    marginTop: 4,
    fontSize: 13,
    color: "#6B7280",
    lineHeight: 18,
  },
});
