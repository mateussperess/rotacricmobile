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

const allStamps = [
  {
    id: "ap1",
    name: "Ponto 1 — Início da Rota",
    local: "Charqueadas - RS",
    description: "Marco inicial da ROTA CRIC. Partida da Praça Central.",
    color: "#3B82F6",
    icon: "🚴",
    collectedAt: "10/04/2025 09:15",
    collected: true,
  },
  {
    id: "ap2",
    name: "Ponto 2 — Ciclovia 3 de Outubro",
    local: "Charqueadas - RS",
    description: "Primeiro grande trecho de ciclovia pavimentada da rota.",
    color: "#3B82F6",
    icon: "🛣️",
    collectedAt: "10/04/2025 10:30",
    collected: true,
  },
  {
    id: "ap3",
    name: "Ponto 3 — Mina do Butiá",
    local: "Butiá - RS",
    description: "Patrimônio histórico da mineração carbonífera regional.",
    color: "#F59E0B",
    icon: "⛏️",
    collectedAt: null,
    collected: false,
  },
  {
    id: "ap7",
    name: "Ponto 7 — São Jerônimo",
    local: "São Jerônimo - RS",
    description: "Marco final da ROTA CRIC, no centro histórico.",
    color: "#EF4444",
    icon: "🏁",
    collectedAt: null,
    collected: false,
  },
];

function StampCard({ stamp }: { stamp: any }) {
  return (
    <View style={[styles.card, !stamp.collected && styles.cardLocked]}>
      {/* Container do Ícone/Carimbo */}
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

      {/* Informações do Ponto */}
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
            <IconSymbol name="clock.fill" size={10} color="#3B82F6" />
            <Text style={styles.dateText}>{stamp.collectedAt}</Text>
          </View>
        ) : (
          <Text style={styles.lockedLabel}>Ainda não coletado</Text>
        )}
      </View>

      {/* Indicador de Status lateral */}
      {stamp.collected ? (
        <IconSymbol name="award.fill" size={20} color="#3B82F6" />
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

  // State: não logado
  if (!isLoggedIn) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.brand}>ROTACRIC</Text>
          <Text style={styles.title}>Meus Carimbos</Text>
        </View>

        <View style={styles.loginContainer}>
          <View style={styles.lockCircle}>
            <IconSymbol name="lock.fill" size={40} color="#9CA3AF" />
          </View>

          <Text style={styles.loginTitle}>Acesso restrito</Text>
          <Text style={styles.loginSub}>
            Faça login para visualizar seus carimbos coletados e acompanhar seu
            progresso.
          </Text>

          <View style={styles.gamificationCard}>
            <View style={styles.row}>
              <IconSymbol name="trophy.fill" size={20} color="#2563EB" />
              <Text style={styles.gamificationTitle}>
                Sistema de gamificação
              </Text>
            </View>
            <Text style={styles.gamificationText}>
              Colete carimbos via QR Code nos pontos da rota e ganhe seu
              certificado oficial!
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
            activeOpacity={0.7}
            style={styles.primaryButton}
            onPress={() => router.push("/profile")}
          >
            <Text style={styles.primaryButtonText}>Fazer login</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // State: logado
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.brand}>ROTACRIC</Text>
        <Text style={styles.title}>Meus Carimbos</Text>

        <View style={styles.progressCard}>
          <View style={[styles.row, { justifyContent: "space-between" }]}>
            <View style={styles.row}>
              <IconSymbol name="trophy.fill" size={18} color="#1E40AF" />
              <Text style={styles.progressLabel}>Progresso da rota</Text>
            </View>
            <Text style={styles.progressCount}>
              {collected}/{total}
            </Text>
          </View>

          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.remainingText}>
            {total - collected} carimbos restantes para completar
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {allStamps.map((stamp) => (
          <StampCard key={stamp.id} stamp={stamp} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
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
  scrollContent: {
    padding: 20,
    gap: 12,
    paddingBottom: 40,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#EBF5FF",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  cardLocked: {
    opacity: 0.7,
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
    backgroundColor: "#3B82F6",
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  cardContent: {
    flex: 1,
    marginLeft: 12,
  },
  stampName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
  },
  textDisabled: {
    color: "#9CA3AF",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 2,
  },
  localText: {
    fontSize: 12,
    color: "#6B7280",
  },
  dateText: {
    fontSize: 10,
    color: "#2563EB",
  },
  lockedLabel: {
    fontSize: 10,
    color: "#9CA3AF",
    fontStyle: "italic",
    marginTop: 4,
  },
  progressCard: {
    marginTop: 16,
    backgroundColor: "#EFF6FF",
    padding: 16,
    borderRadius: 16,
  },
  progressLabel: {
    color: "#1E40AF",
    fontWeight: "600",
    fontSize: 14,
  },
  progressCount: {
    color: "#1D4ED8",
    fontWeight: "700",
    fontSize: 14,
  },
  progressBarBg: {
    height: 10,
    backgroundColor: "#DBEAFE",
    borderRadius: 5,
    marginTop: 10,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#3B82F6",
    borderRadius: 5,
  },
  remainingText: {
    fontSize: 11,
    color: "#2563EB",
    marginTop: 8,
  },
  loginContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
  },
  lockCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  loginTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
  },
  loginSub: {
    textAlign: "center",
    color: "#6B7280",
    marginTop: 10,
    lineHeight: 20,
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
  gamificationTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1E40AF",
  },
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
    backgroundColor: "#2563EB",
    paddingVertical: 15,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  primaryButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
