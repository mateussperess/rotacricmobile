import { useAuth } from "@/components/contexts/AuthContext";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { router } from "expo-router";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const CRIC_BLUE = "#2563EB";

const allStamps = [
  {
    id: "ap1",
    name: "Ponto 1 — Início da Rota",
    local: "Charqueadas - RS",
    color: "#3B82F6",
    icon: "🚴",
    collectedAt: "10/04/2025 09:15",
    collected: true,
  },
  {
    id: "ap2",
    name: "Ponto 2 — Ciclovia 3 de Outubro",
    local: "Charqueadas - RS",
    color: "#3B82F6",
    icon: "🛣️",
    collectedAt: "10/04/2025 10:30",
    collected: true,
  },
  {
    id: "ap3",
    name: "Ponto 3 — Mina do Butiá",
    local: "Butiá - RS",
    color: "#F59E0B",
    icon: "⛏️",
    collectedAt: null,
    collected: false,
  },
  {
    id: "ap7",
    name: "Ponto 7 — São Jerônimo",
    local: "São Jerônimo - RS",
    color: "#EF4444",
    icon: "🏁",
    collectedAt: null,
    collected: false,
  },
];

function StampCard({ stamp }: { stamp: any }) {
  return (
    <View style={[styles.card, !stamp.collected && styles.cardLocked]}>
      <View
        style={[
          styles.stampIconContainer,
          { backgroundColor: stamp.collected ? stamp.color : "#E5E7EB" },
        ]}
      >
        {stamp.collected ? (
          <Text style={{ fontSize: 24 }}>{stamp.icon}</Text>
        ) : (
          <IconSymbol name="lock.fill" size={24} color="#9CA3AF" />
        )}
        {stamp.collected && (
          <View style={styles.checkBadge}>
            <IconSymbol name="checkmark.circle.fill" size={12} color="white" />
          </View>
        )}
      </View>
      <View style={styles.cardContent}>
        <Text
          style={[styles.stampName, !stamp.collected && styles.textDisabled]}
        >
          {stamp.name}
        </Text>
        <View style={styles.row}>
          <IconSymbol
            name="mappin.and.ellipse"
            size={12}
            color={stamp.collected ? "#9CA3AF" : "#D1D5DB"}
          />
          <Text style={styles.localText}>{stamp.local}</Text>
        </View>
        {stamp.collected ? (
          <View style={styles.row}>
            <IconSymbol name="clock.fill" size={10} color={CRIC_BLUE} />
            <Text style={styles.dateText}>{stamp.collectedAt}</Text>
          </View>
        ) : (
          <Text style={styles.lockedLabel}>Ainda não coletado</Text>
        )}
      </View>
      {stamp.collected ? (
        <IconSymbol name="award.fill" size={20} color={CRIC_BLUE} />
      ) : (
        <IconSymbol name="lock.fill" size={16} color="#D1D5DB" />
      )}
    </View>
  );
}

export default function CarimbosScreen() {
  const { isLoggedIn } = useAuth();

  const collected = allStamps.filter((s) => s.collected).length;
  const total = allStamps.length;
  const progress = (collected / total) * 100;

  // ── State: não logado ──
  if (!isLoggedIn) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <View style={styles.headerBlue}>
          <Text style={styles.brand}>ROTA CRIC</Text>
          <Text style={styles.heroTitle}>Meus Carimbos</Text>
          <Text style={styles.heroSub}>
            Colete carimbos nos pontos da rota e ganhe seu certificado oficial.
          </Text>
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{total}</Text>
              <Text style={styles.statLabel}>Pontos</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statValue}>180 km</Text>
              <Text style={styles.statLabel}>Extensão</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statValue}>1</Text>
              <Text style={styles.statLabel}>Certificado</Text>
            </View>
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.loginContainer}>
            <View style={styles.lockCircle}>
              <IconSymbol name="lock.fill" size={36} color="#9CA3AF" />
            </View>
            <Text style={styles.loginTitle}>Acesso restrito</Text>
            <Text style={styles.loginSub}>
              Faça login para visualizar seus carimbos e acompanhar seu
              progresso na rota.
            </Text>
            <View style={styles.gamificationCard}>
              <View style={styles.row}>
                <IconSymbol name="trophy.fill" size={18} color={CRIC_BLUE} />
                <Text style={styles.gamificationTitle}>
                  Sistema de gamificação
                </Text>
              </View>
              <Text style={styles.gamificationText}>
                Escaneie QR Codes nos pontos da rota, colecione carimbos e
                complete o percurso!
              </Text>
              <View style={[styles.row, { marginTop: 12, gap: 8 }]}>
                {["🚴", "⛏️", "💧", "🏁"].map((icon, i) => (
                  <View key={i} style={styles.miniIcon}>
                    <Text>{icon}</Text>
                  </View>
                ))}
              </View>
            </View>
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.primaryButton}
              onPress={() => router.push("/profile")}
            >
              <Text style={styles.primaryButtonText}>Fazer login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // ── State: logado ──
  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.container}>
        <View style={styles.headerBlue}>
          <Text style={styles.brand}>ROTA CRIC</Text>
          <Text style={styles.heroTitle}>Meus Carimbos</Text>
          <Text style={styles.heroSub}>
            Colete carimbos nos pontos da rota, ganhe seu certificado oficial e
            desconto especiais nos pontos de apoio parceiros.
          </Text>
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{collected}</Text>
              <Text style={styles.statLabel}>Coletados</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{total - collected}</Text>
              <Text style={styles.statLabel}>Restantes</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{Math.round(progress)}%</Text>
              <Text style={styles.statLabel}>Progresso</Text>
            </View>
          </View>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.sectionLabel}>PONTOS DA ROTA</Text>
          {allStamps.map((stamp) => (
            <StampCard key={stamp.id} stamp={stamp} />
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: CRIC_BLUE,
  },
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  headerBlue: {
    backgroundColor: CRIC_BLUE,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 32,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  brand: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 2.5,
    color: "rgba(255,255,255,0.45)",
    marginBottom: 6,
  },
  heroTitle: {
    fontSize: 30,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  heroSub: {
    fontSize: 13,
    color: "rgba(255,255,255,0.65)",
    lineHeight: 19,
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 14,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    marginBottom: 16,
  },
  statBox: { flex: 1, alignItems: "center", gap: 4 },
  statDivider: { width: 1, backgroundColor: "rgba(255,255,255,0.15)" },
  statValue: { fontSize: 18, fontWeight: "800", color: "#fff" },
  statLabel: {
    fontSize: 10,
    color: "rgba(255,255,255,0.5)",
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#fff",
    borderRadius: 3,
  },
  content: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 48,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#9CA3AF",
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#EBF5FF",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  cardLocked: {
    opacity: 0.6,
    borderColor: "transparent",
  },
  stampIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  checkBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: CRIC_BLUE,
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  cardContent: { flex: 1, marginLeft: 12 },
  stampName: { fontSize: 14, fontWeight: "600", color: "#1F2937" },
  textDisabled: { color: "#9CA3AF" },
  row: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 2 },
  localText: { fontSize: 12, color: "#6B7280" },
  dateText: { fontSize: 10, color: CRIC_BLUE },
  lockedLabel: {
    fontSize: 10,
    color: "#9CA3AF",
    fontStyle: "italic",
    marginTop: 4,
  },
  loginContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 28,
  },
  lockCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  loginTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1F2937",
    letterSpacing: -0.3,
  },
  loginSub: {
    textAlign: "center",
    color: "#6B7280",
    marginTop: 8,
    lineHeight: 20,
    fontSize: 13,
  },
  gamificationCard: {
    width: "100%",
    backgroundColor: "#EFF6FF",
    borderRadius: 16,
    padding: 16,
    marginVertical: 24,
    borderWidth: 1,
    borderColor: "#DBEAFE",
  },
  gamificationTitle: { fontSize: 14, fontWeight: "700", color: "#1E40AF" },
  gamificationText: {
    fontSize: 12,
    color: "#1E40AF",
    marginTop: 4,
    lineHeight: 18,
  },
  miniIcon: {
    width: 36,
    height: 36,
    backgroundColor: "#fff",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#DBEAFE",
  },
  primaryButton: {
    width: "100%",
    backgroundColor: CRIC_BLUE,
    paddingVertical: 15,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: CRIC_BLUE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  primaryButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
